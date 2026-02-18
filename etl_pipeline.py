import sys
import requests
import json
import os
import re
import time
import html
import concurrent.futures

sys.stdout.reconfigure(line_buffering=True)

# --- Configuration ---
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "public", "data")
PARASHOT_DIR = os.path.join(DATA_DIR, "parashot")
MANIFEST_FILE = os.path.join(DATA_DIR, "manifest.json")
SEFARIA_API_BASE = "https://www.sefaria.org/api"

# Ensure directories exist
os.makedirs(PARASHOT_DIR, exist_ok=True)

ALIYAH_MAP_FILE = os.path.join(BASE_DIR, "data", "aliyah_map.json")
HAFTARA_MAP_FILE = os.path.join(BASE_DIR, "data", "haftara_map.json")

ALIYAH_OVERRIDES = {}
if os.path.exists(ALIYAH_MAP_FILE):
    with open(ALIYAH_MAP_FILE, 'r') as f:
        ALIYAH_OVERRIDES = json.load(f).get('overrides', {}).get('yemenite', {})

HAFTARA_MAP = {}
if os.path.exists(HAFTARA_MAP_FILE):
    with open(HAFTARA_MAP_FILE, 'r') as f:
        HAFTARA_MAP = json.load(f)

# Books of the Torah (English and Hebrew names)
BOOKS = [
    {"english": "Genesis", "hebrew": "בראשית"},
    {"english": "Exodus", "hebrew": "שמות"},
    {"english": "Leviticus", "hebrew": "ויקרא"},
    {"english": "Numbers", "hebrew": "במדבר"},
    {"english": "Deuteronomy", "hebrew": "דברים"}
]

# --- Helper Functions ---

def clean_text(text):
    """
    Removes cantillation marks, vowels, and punctuation.
    Handles Parasha/Aliyah markers {פ} and {ס}.
    """
    if not text: return ""

    # 1. Handle Markers (replace with unique placeholders)
    # Pe (Petucha) -> Newline
    # Handle {פ}, (פ), [פ] or isolated פ
    text = re.sub(r'(?:[\{\(\[]\s*פ\s*[\}\)\]]|(?<!\S)פ(?!\S))', ' __PE_MARKER__ ', text)
    
    # Samekh (Setuma) -> 9 spaces
    # Handle {ס}, (ס), [ס] or isolated ס
    text = re.sub(r'(?:[\{\(\[]\s*ס\s*[\}\)\]]|(?<!\S)ס(?!\S))', ' __SAMEKH_MARKER__ ', text)

    # 2. Pre-process separators that should become spaces
    # Maqaf (05BE) and Hyphen (-) should separate words
    # FIX: Do NOT separate with spaces. Keep connected for correct tokenization match with Taj.
    # text = re.sub(r'[\-\u05BE]', ' ', text)

    # 3. Remove Vowels and Cantillation (Trope)
    # Cantillation: 0591-05AF
    # Vowels: 05B0-05BD, 05BF, 05C1-05C2, 05C4-05C5, 05C7
    # Paseq: 05C0 (vertical bar) - added to removal
    text = re.sub(r'[\u0591-\u05AF\u05B0-\u05BD\u05BF\u05C0\u05C1-\u05C2\u05C4-\u05C5\u05C7]', '', text)

    # 4. Remove Punctuation
    # Explicit list: :, ., ׃ (Sof Pasuq 05C3)
    # Hyphen/Maqaf already handled above as spaces
    text = re.sub(r'[:\.\u05C3]', '', text)
    
    # 5. Remove remaining brackets
    text = re.sub(r'[(){}\[\]]', '', text)
    
    # 6. Normalize Spaces
    text = ' '.join(text.split())
    
    # 7. Restore Markers
    # Remove surrounding spaces for newline to avoid trailing whitespace
    text = text.replace(' __PE_MARKER__ ', '\n')
    text = text.replace('__PE_MARKER__', '\n')
    
    # For Samekh, we want the 9 spaces.
    text = text.replace(' __SAMEKH_MARKER__ ', '         ')
    text = text.replace('__SAMEKH_MARKER__', '         ')
    
    return text

def fetch_parashot_for_book(book_name):
    """Fetches list of Parashot for a given book from Sefaria."""
    # Using Sefaria Index API to get the structure of the book/alt structs
    url = f"{SEFARIA_API_BASE}/v2/index/{book_name}"
    try:
        response = requests.get(url, timeout=30)
        response.raise_for_status()
        data = response.json()
        
        # Sefaria structure for Parashot is usually under 'alts' -> 'Parasha' -> 'nodes'
        if 'alts' in data and 'Parasha' in data['alts']:
            nodes = data['alts']['Parasha']['nodes']
            parashot = []
            for node in nodes:
                whole_ref = node.get('wholeRef')
                # Grab the Aliyot refs if available, otherwise fallback to wholeRef as a single chunk
                aliyah_refs = node.get('refs', [whole_ref])
                
                if not whole_ref and not aliyah_refs:
                    print(f"Skipping node {node.get('title')} - no ref found")
                    continue
                
                # Use whole_ref as the main ref for the Parasha
                main_ref = whole_ref if whole_ref else aliyah_refs[0]

                # Extract correct names
                parasha_entry = {
                    "ref": main_ref,
                    "aliyot": aliyah_refs
                }
                
                for t in node['titles']:
                    if t['lang'] == 'en':
                        parasha_entry['name'] = t['text']
                        parasha_entry['id'] = t['text'].lower().replace(" ", "-")
                    elif t['lang'] == 'he':
                        parasha_entry['hebrew'] = t['text']
                
                # Fallback if no Hebrew found
                if 'hebrew' not in parasha_entry:
                    parasha_entry['hebrew'] = parasha_entry['name']

                parashot.append(parasha_entry)
            return parashot
        else:
            print(f"No Parasha structure found for {book_name}")
            return []
            
    except Exception as e:
        print(f"Error fetching index for {book_name}: {e}")
        return []

def fetch_text(ref, is_haftara=False):
    """Fetches Hebrew (Standard & Yemenite) and Onkelos/Jonathan text for a given ref."""
    
    # 1. Fetch Standard Hebrew (Tanach with Ta'amei Hamikra)
    url_std = f"{SEFARIA_API_BASE}/texts/{ref}?context=0&commentary=0&versionTitle=Tanach with Ta'amei Hamikra"
    
    # 2. Fetch Yemenite Hebrew (Miqra according to the Masorah)
    url_yem = f"{SEFARIA_API_BASE}/texts/{ref}?context=0&commentary=0&versionTitle=Miqra_according_to_the_Masorah"

    # 3. Fetch Targum
    # If Haftarah (Prophets), use Targum Jonathan. If Torah, use Onkelos.
    # Note: Sefaria might name it "Targum Jonathan on [Book]" or just "Targum Jonathan".
    # Reliable check: First word of Ref is the Book.
    book = ref.split()[0]
    
    if is_haftara or book not in ["Genesis", "Exodus", "Leviticus", "Numbers", "Deuteronomy"]:
        # Prophets
        url_onk = f"{SEFARIA_API_BASE}/texts/Targum_Jonathan_on_{ref.replace(' ', '_')}?context=0&commentary=0"
    else:
        # Torah
        url_onk = f"{SEFARIA_API_BASE}/texts/Onkelos_{ref.replace(' ', '_')}?context=0&commentary=0"
    
    data_std = None
    data_yem = None
    data_onk = None

    try:
        # Fetch Standard
        resp_std = requests.get(url_std, timeout=30)
        if resp_std.status_code == 200:
            data_std = resp_std.json()
        else:
            # Fallback to default if specific version fails
            print(f"  Fallback for Standard: {ref}")
            resp_def = requests.get(f"{SEFARIA_API_BASE}/texts/{ref}?context=0&commentary=0", timeout=30)
            resp_def.raise_for_status()
            data_std = resp_def.json()

        # Fetch Yemenite
        resp_yem = requests.get(url_yem, timeout=30)
        if resp_yem.status_code == 200:
            data_yem = resp_yem.json()
            # Check if empty (sometimes API returns success but empty content for missing version)
            if not data_yem.get('he'):
                data_yem = None
        
        # Fetch Onkelos
        resp_onk = requests.get(url_onk, timeout=30)
        if resp_onk.status_code == 200:
            data_onk = resp_onk.json()
        
        return data_std, data_yem, data_onk
    except Exception as e:
        print(f"Error fetching text for {ref}: {e}")
        return None, None, None

def clean_html_and_spaces(text):
    if not text: return ""
    # Decode HTML entities (e.g. &thinsp; -> space)
    text = html.unescape(text)
    # Remove HTML tags
    text = re.sub(r'<[^>]+>', '', text)
    # Normalize unicode spaces to standard space
    text = text.replace('\xa0', ' ').replace('\u2009', ' ')
    # Collapse multiple spaces
    return ' '.join(text.split())

def extract_verses_with_meta(he_data, start_chapter, start_verse):
    """
    Traverses the he_data (list or list of lists) and returns a flat list of 
    dict(text=..., chapter=..., verse=...)
    """
    results = []
    
    if not he_data:
        return []
        
    # Depth 1: List of strings (Single chapter segment)
    if isinstance(he_data[0], str):
        for i, text in enumerate(he_data):
            results.append({
                "text": text,
                "chapter": start_chapter,
                "verse": start_verse + i
            })
            
    # Depth 2: List of lists (Spanning chapters)
    elif isinstance(he_data[0], list):
        # First chunk: continues from start_verse
        for i, text in enumerate(he_data[0]):
            results.append({
                "text": text,
                "chapter": start_chapter,
                "verse": start_verse + i
            })
            
        # Subsequent chunks: next chapters, starting at verse 1
        current_chapter = start_chapter + 1
        for chunk in he_data[1:]:
            for i, text in enumerate(chunk):
                results.append({
                    "text": text,
                    "chapter": current_chapter,
                    "verse": 1 + i
                })
            current_chapter += 1
            
    return results

def fetch_aliyah_data(aliyah_refs, is_haftara=False):
    """
    Fetches and processes data for a given list of Aliyah references.
    Returns: (aliyot_data, all_verses_flat)
    """
    aliyot_data = []
    all_verses_flat = []
    global_verse_count = 0

    for idx, aliyah_ref in enumerate(aliyah_refs):
        # Fetch text for this specific aliyah range
        std_data, yem_data, onk_data = fetch_text(aliyah_ref, is_haftara=is_haftara)
        
        if not std_data or not std_data.get('he'):
            print(f"  Warning: No Standard data for aliyah {aliyah_ref}")
            continue
        
        # Parse Section Metadata
        sections = std_data.get('sections', [0, 0])
        if len(sections) < 2: 
            sections = [0, 0]
        
        start_chapter = sections[0]
        start_verse = sections[1]
        
        # Flatten Standard with Metadata
        std_with_meta = extract_verses_with_meta(std_data['he'], start_chapter, start_verse)
        
        # Helper to flatten text lists
        def flatten(text_list):
            flat = []
            if isinstance(text_list, str): return [text_list]
            for item in text_list:
                if isinstance(item, list): flat.extend(flatten(item))
                else: flat.append(item)
            return flat

        # Prepare Yemenite flat list
        yem_flat = []
        if yem_data and yem_data.get('he'):
            yem_flat = flatten(yem_data['he'])
        
        # Fallback if Yemenite missing/mismatch
        if not yem_flat or len(yem_flat) != len(std_with_meta):
            if yem_flat and len(yem_flat) != len(std_with_meta):
                 print(f"  Warning: Yemenite/Standard length mismatch for {aliyah_ref} ({len(yem_flat)} vs {len(std_with_meta)}). Using Standard.")
            yem_flat = [item['text'] for item in std_with_meta]

        # Onkelos
        onk_flat = []
        if onk_data and 'he' in onk_data:
            onk_flat = flatten(onk_data['he'])
        
        if len(onk_flat) < len(std_with_meta):
            onk_flat.extend([""] * (len(std_with_meta) - len(onk_flat)))
            
        aliyah_verses = []
        for i, std_item in enumerate(std_with_meta):
            global_verse_count += 1
            
            std_text = std_item['text']
            verse_ch = std_item['chapter']
            verse_v = std_item['verse']
            
            clean_std = clean_html_and_spaces(std_text)
            clean_yem = clean_html_and_spaces(yem_flat[i])
            clean_onk = clean_html_and_spaces(onk_flat[i])
            
            # Skip cleaning for Haftara (we don't need Tikun/Clean text)
            simple_std = "" if is_haftara else clean_text(clean_std)
            simple_yem = "" if is_haftara else clean_text(clean_yem)
            
            verse_obj = {
                "verse_num": global_verse_count,
                "chapter": verse_ch,
                "verse": verse_v,
                "versions": {
                    "standard": {
                        "text_full": clean_std,
                        "text_clean": simple_std
                    },
                    "yemenite": {
                        "text_full": clean_yem,
                        "text_clean": simple_yem
                    }
                },
                "targum": clean_onk
            }
            aliyah_verses.append(verse_obj)
            all_verses_flat.append(verse_obj)
        
        aliyot_data.append({
            "num": idx + 1,
            "range": aliyah_ref,
            "verses": aliyah_verses
        })
        time.sleep(0.1)
        
    return aliyot_data, all_verses_flat

def process_parasha(parasha):
    """Fetches data, processes it, and saves to JSON."""
    print(f"Processing {parasha['name']} ({parasha['ref']})...")
    
    # 1. Standard Processing
    ref_list = parasha.get('aliyot')
    if not ref_list:
        ref_list = [parasha['ref']]
        
    aliyot_data, all_verses_flat = fetch_aliyah_data(ref_list)

    # --- MAFTIR LOGIC (Standard) ---
    if len(aliyot_data) >= 7:
        last_aliyah = aliyot_data[6]
        last_verses = last_aliyah['verses']
        
        if len(last_verses) >= 3:
            maftir_verses = last_verses[-3:]
            
            start_v = maftir_verses[0]
            end_v = maftir_verses[-1]
            book_name = parasha['ref'].split()[0] 
            
            if start_v['chapter'] == end_v['chapter']:
                maftir_range = f"{book_name} {start_v['chapter']}:{start_v['verse']}-{end_v['verse']}"
            else:
                maftir_range = f"{book_name} {start_v['chapter']}:{start_v['verse']}-{end_v['chapter']}:{end_v['verse']}"
            
            maftir_data = {
                "num": 8, 
                "range": maftir_range,
                "verses": maftir_verses 
            }
            aliyot_data.insert(7, maftir_data)
            print(f"  Generated Maftir (Standard): {maftir_range}")

    if not all_verses_flat:
        return False
        
    output_data = {
        "id": parasha['id'],
        "name": parasha['name'],
        "hebrew": parasha.get('hebrew', parasha['name']),
        "ref": parasha['ref'],
        "aliyot": aliyot_data,
        "verses": all_verses_flat
    }
    
    # 2. Check for Yemenite Override
    # Normalize ID to lowercase for lookup
    p_id = parasha['id'].lower().replace("parashat ", "").replace("parshat ", "").replace(" ", "-")
    
    override = ALIYAH_OVERRIDES.get(p_id)
    if not override:
        simplified_id = p_id.split("-")[-1] 
        override = ALIYAH_OVERRIDES.get(simplified_id)

    if override:
        print(f"  Applying Yemenite Override for {parasha['name']}...")
        yem_ref_list = override.get('aliyot')
        if yem_ref_list:
            yem_aliyot_data, _ = fetch_aliyah_data(yem_ref_list)
            
            # --- MAFTIR LOGIC (Yemenite) ---
            if len(yem_aliyot_data) >= 7:
                last_aliyah = yem_aliyot_data[-1] 
                last_verses = last_aliyah['verses']
                if len(last_verses) >= 3:
                    maftir_verses = last_verses[-3:]
                    start_v = maftir_verses[0]
                    end_v = maftir_verses[-1]
                    book_name = parasha['ref'].split()[0] 
                    
                    if start_v['chapter'] == end_v['chapter']:
                        maftir_range = f"{book_name} {start_v['chapter']}:{start_v['verse']}-{end_v['verse']}"
                    else:
                        maftir_range = f"{book_name} {start_v['chapter']}:{start_v['verse']}-{end_v['chapter']}:{end_v['verse']}"
                    
                    maftir_data = {
                        "num": 8, 
                        "range": maftir_range,
                        "verses": maftir_verses 
                    }
                    yem_aliyot_data.append(maftir_data)
                    print(f"  Generated Maftir (Yemenite): {maftir_range}")

            output_data["aliyot_yemenite"] = yem_aliyot_data
            output_data["ref_yemenite"] = override.get('ref')
            output_data["is_override"] = True

    # 3. Add Haftarah
    # Lookup in map
    haftara_entry = HAFTARA_MAP.get(parasha['id']) or HAFTARA_MAP.get(p_id)
    
    if haftara_entry:
        std_haftara_ref = haftara_entry.get('standard')
        yem_haftara_ref = haftara_entry.get('yemenite')
        
        # Clean refs (remove extra chars if any, like [73])
        if std_haftara_ref:
            std_haftara_ref = re.sub(r'\[\d+\]', '', std_haftara_ref).strip()
            # Replace en-dash with hyphen for Sefaria API compatibility if needed
            std_haftara_ref = std_haftara_ref.replace('–', '-').replace('—', '-') 
            
            print(f"  Fetching Haftarah (Standard): {std_haftara_ref}")
            # Use same logic as Aliyah (it's essentially an aliyah)
            # Wrap in list because fetch_aliyah_data expects a list of refs (like 7 aliyot)
            # but Haftara is one block.
            haftara_data_list, _ = fetch_aliyah_data([std_haftara_ref], is_haftara=True)
            if haftara_data_list:
                output_data["haftara"] = haftara_data_list[0]
                # Fix num/range if needed
                output_data["haftara"]["num"] = 8 # Convention? Or just leave as 1 relative to haftara list?
                # Actually, Trainer.tsx expects it as a single Aliyah object, not array.
                # fetch_aliyah_data returns [Aliyah, Aliyah...]. We take [0].
        
        if yem_haftara_ref and yem_haftara_ref != std_haftara_ref:
            yem_haftara_ref = re.sub(r'\[\d+\]', '', yem_haftara_ref).strip()
            yem_haftara_ref = yem_haftara_ref.replace('–', '-').replace('—', '-')
            
            print(f"  Fetching Haftarah (Yemenite): {yem_haftara_ref}")
            yem_haftara_data_list, _ = fetch_aliyah_data([yem_haftara_ref], is_haftara=True)
            if yem_haftara_data_list:
                output_data["haftara_yemenite"] = yem_haftara_data_list[0]
                output_data["haftara_yemenite"]["num"] = 8

    filename = f"{parasha['id']}.json"
    filepath = os.path.join(PARASHOT_DIR, filename)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(output_data, f, ensure_ascii=False, indent=2)
        
    return True

# --- Main Execution ---

def main():
    manifest = []
    
    # Use ThreadPoolExecutor for concurrent processing
    # Max workers = 3 to be safe with Sefaria API limits
    with concurrent.futures.ThreadPoolExecutor(max_workers=3) as executor:
        for book in BOOKS:
            print(f"--- Processing Book: {book['english']} ---")
            parashot_list = fetch_parashot_for_book(book['english'])
            
            book_entry = {
                "book": book['english'],
                "hebrew": book['hebrew'],
                "parashot": parashot_list
            }
            
            # Process Parashot in parallel for this book
            future_to_parasha = {executor.submit(process_parasha, p): p for p in parashot_list}
            
            for future in concurrent.futures.as_completed(future_to_parasha):
                p = future_to_parasha[future]
                try:
                    success = future.result()
                    if not success:
                        print(f"Failed to process {p['name']}")
                except Exception as exc:
                    print(f'{p["name"]} generated an exception: {exc}')
                
            manifest.append(book_entry)
            
            # Be nice to the API between books
            time.sleep(1)
            
    # Save Manifest
    with open(MANIFEST_FILE, 'w', encoding='utf-8') as f:
        json.dump(manifest, f, ensure_ascii=False, indent=2)
        
    print("\n--- ETL Pipeline Complete ---")
    print(f"Manifest saved to {MANIFEST_FILE}")

if __name__ == "__main__":
    main()

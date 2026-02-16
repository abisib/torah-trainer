import json
import re
import os
import urllib.request

def strip_cantillation_vowels(text):
    # Strip everything in the Nikkud/Teamim range EXCEPT 05BE (Maqaf)
    # Range 0591-05BD covers most marks. 05BF-05C7 covers the rest.
    # We leave 05BE (Maqaf) alone.
    text = re.sub(r'[\u0591-\u05BD\u05BF-\u05C7]', '', text)
    return text

import html

def remove_html_tags(text):
    # Decode HTML entities (e.g. &thinsp; -> thin space char)
    text = html.unescape(text)
    # Remove HTML tags
    clean = re.compile('<.*?>')
    text = re.sub(clean, '', text)
    # Replace non-breaking space explicitly just in case
    text = text.replace('\xa0', ' ')
    # Normalize whitespace (collapse multiple spaces)
    return ' '.join(text.split())

def fetch_json(url):
    req = urllib.request.Request(
        url, 
        headers={'User-Agent': 'Mozilla/5.0'}
    )
    with urllib.request.urlopen(req) as response:
        return json.loads(response.read().decode('utf-8'))

def fetch_data():
    # Fetch Exodus 15 (Hebrew)
    print("Fetching Exodus 15...")
    url_hebrew = "https://www.sefaria.org/api/texts/Exodus.15?context=0"
    
    try:
        data_he = fetch_json(url_hebrew)
        hebrew_text = data_he['he']
    except Exception as e:
        print(f"Error fetching Hebrew: {e}")
        return

    # Fetch Targum Onkelos Exodus 15
    print("Fetching Targum Onkelos...")
    url_targum = "https://www.sefaria.org/api/texts/Onkelos_Exodus.15?context=0"
    
    try:
        data_tm = fetch_json(url_targum)
        targum_text = data_tm['he'] 
    except Exception as e:
        print(f"Error fetching Targum: {e}")
        return

    # Process
    verses = []
    length = min(len(hebrew_text), len(targum_text))
    
    print(f"Processing {length} verses...")

    for i in range(length):
        verse_num = i + 1
        
        # Get raw text
        text_full = hebrew_text[i]
        targum = targum_text[i]
        
        # Clean HTML tags first
        text_full = remove_html_tags(text_full)
        targum = remove_html_tags(targum)
        
        # Create clean version from tag-free text
        text_clean = strip_cantillation_vowels(text_full)
        
        verses.append({
            "verse_num": verse_num,
            "text_full": text_full,
            "text_clean": text_clean,
            "targum": targum
        })

    output_data = {"verses": verses}
    
    # Save relative to script location
    script_dir = os.path.dirname(os.path.abspath(__file__))
    output_dir = os.path.join(script_dir, "src", "data")
    
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
        
    output_path = os.path.join(output_dir, "shirat_hayam.json")
    
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(output_data, f, ensure_ascii=False, indent=2)
    
    print(f"Saved {len(verses)} verses to {output_path}")

if __name__ == "__main__":
    fetch_data()

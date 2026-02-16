import json
import re

def parse_haftarah():
    # Load manifest
    with open('workspace/torah_trainer/public/data/manifest.json', 'r') as f:
        manifest_books = json.load(f)

    # Flatten manifest to list of parashot
    parashot = []
    for book in manifest_books:
        for p in book['parashot']:
            parashot.append({
                'id': p['id'],
                'name': p['name'],
                'hebrew': p['hebrew'],
                'standard': None,
                'yemenite': None
            })

    # Load Wiki text
    with open('workspace/torah_trainer/data/wiki_haftarah.txt', 'r') as f:
        lines = f.readlines()

    current_index = 0
    regex = r"^-\s*([^:]+):\s*(.*)"
    
    # Parasha map for syncing
    parasha_map = {p['name'].lower().replace('parashat ', '').replace('parshat ', ''): i for i, p in enumerate(parashot)}
    # (Same mapping as before, keeping it for robustness)
    parasha_map['bereshit'] = 0
    parasha_map['noach'] = 1
    parasha_map['lech lekha'] = 2
    parasha_map['vayera'] = 3
    parasha_map['chayei sarah'] = 4
    parasha_map['toldot'] = 5
    parasha_map['vayetze'] = 6
    parasha_map['vayishlach'] = 7
    parasha_map['vayeshev'] = 8
    parasha_map['miketz'] = 9
    parasha_map['vayigash'] = 10
    parasha_map['vayechi'] = 11
    parasha_map['sh\'mot'] = 12
    parasha_map['vaera'] = 13
    parasha_map['bo'] = 14
    parasha_map['beshalach'] = 15
    parasha_map['yitro'] = 16
    parasha_map['mishpatim'] = 17
    parasha_map['terumah'] = 18
    parasha_map['teztaveh'] = 19
    parasha_map['tetzaveh'] = 19
    parasha_map['ki tissa'] = 20
    parasha_map['ki tisa'] = 20
    parasha_map['vayakhel'] = 21
    parasha_map['vayakel'] = 21
    parasha_map['pekudei'] = 22
    parasha_map['pikudei'] = 22
    parasha_map['vayikra'] = 23
    parasha_map['tzav'] = 24
    parasha_map['shemini'] = 25
    parasha_map['tazria'] = 26
    parasha_map['metzorah'] = 27
    parasha_map['metzora'] = 27
    parasha_map['acharei mot'] = 28
    parasha_map['kedoshim'] = 29
    parasha_map['emor'] = 30
    parasha_map['behar'] = 31
    parasha_map['bechukotai'] = 32
    parasha_map['bamidbar'] = 33
    parasha_map['naso'] = 34
    parasha_map['behaloscha'] = 35
    parasha_map['beha\'alotcha'] = 35
    parasha_map['shlach'] = 36
    parasha_map['korach'] = 37
    parasha_map['korah'] = 37
    parasha_map['chukkat'] = 38
    parasha_map['chukat'] = 38
    parasha_map['balak'] = 39
    parasha_map['pinchas'] = 40
    parasha_map['pinhas'] = 40
    parasha_map['matot'] = 41
    parasha_map['mattot'] = 41
    parasha_map['masei'] = 42
    parasha_map['massei'] = 42
    parasha_map['d\'varim'] = 43
    parasha_map['devarim'] = 43
    parasha_map['v\'ethanan'] = 44
    parasha_map['vaetchanan'] = 44
    parasha_map['ekev'] = 45
    parasha_map['re\'eh'] = 46
    parasha_map['reeh'] = 46
    parasha_map['shofetim'] = 47
    parasha_map['shoftim'] = 47
    parasha_map['ki teitze'] = 48
    parasha_map['ki teitzei'] = 48
    parasha_map['ki tavo'] = 49
    parasha_map['nitzavim'] = 50
    parasha_map['vayelekh'] = 51
    parasha_map['haazinu'] = 52
    parasha_map['v\'zot haberachah'] = 53
    parasha_map['v\'zot ha-berachah'] = 53
    parasha_map['shabbat shirah'] = 15
    parasha_map['shabbat hazon'] = 43
    parasha_map['shabbat nahamu'] = 44

    last_line_was_blank = True
    
    # Indices where consecutive parashot might share the same book
    double_indices = [21, 26, 28, 31, 41, 50] 

    for line in lines:
        raw_line = line
        line = line.strip()
        
        if not line:
            last_line_was_blank = True
            continue

        lower_line = line.lower()
        found_sync = False
        
        # Check for sync
        if not line.startswith('-') and len(line) < 100:
             if ' - ' in line or ' – ' in line:
                 parts = re.split(r' - | – ', lower_line)
                 for part in parts:
                     clean_part = part.strip().replace('[', '').replace(']', '').replace('parashat ', '')
                     if clean_part in parasha_map:
                         current_index = parasha_map[clean_part]
                         found_sync = True
                         last_line_was_blank = True
            
             if not found_sync:
                for p_name, p_idx in parasha_map.items():
                    if f"[{p_name}]" in lower_line or lower_line == p_name or lower_line.startswith(f"{p_name} "):
                        current_index = p_idx
                        found_sync = True
                        last_line_was_blank = True
                        break

        match = re.match(regex, line)
        if match:
            codes = match.group(1).strip()
            reading = match.group(2).strip()
            if '(' in reading:
                reading = reading.split('(')[0].strip()

            codes_list = [c.strip() for c in codes.split(',')]
            
            is_ashkenazi = False
            is_yemenite = False
            
            def is_code_A(c):
                return c == 'A' or c.startswith('A ') or c == 'AH' or c.startswith('AH ')
            
            if any(is_code_A(c) for c in codes_list):
                is_ashkenazi = True
            if 'A' in codes.split(',')[0] or codes.startswith('A'):
                is_ashkenazi = True

            if 'Y' in codes_list or 'Y' == codes:
                is_yemenite = True
            
            if not is_ashkenazi and 'A' in codes:
                 is_ashkenazi = True

            if "some " in codes.lower() and not codes.strip().startswith('A'): 
                 pass

            if current_index < len(parashot):
                p = parashot[current_index]
                
                if is_ashkenazi:
                    if p['standard'] is not None:
                        # Logic for advancement
                        should_advance = False
                        
                        def get_book(s):
                            return " ".join([x for x in s.split(':')[0].split() if not x[0].isdigit()])
                        
                        prev_book = get_book(p['standard'])
                        curr_book = get_book(reading)
                        
                        if prev_book != curr_book:
                            should_advance = True
                        else:
                            # Same book
                            if current_index in double_indices:
                                # Advance if Codes imply primary A (Next Parasha)
                                if codes.split(',')[0].strip() == 'A' or codes.strip().startswith('A,'):
                                    should_advance = True
                        
                        if should_advance and not found_sync:
                            current_index += 1
                            if current_index < len(parashot):
                                parashot[current_index]['standard'] = reading
                                if is_yemenite:
                                    parashot[current_index]['yemenite'] = reading
                        else:
                            # Variation - prefer first but sometimes second overwrites?
                            # Usually keep first unless strict override needed.
                            pass
                    else:
                        p['standard'] = reading
                        if is_yemenite:
                             p['yemenite'] = reading
                
                elif is_yemenite:
                    if p['yemenite'] is None:
                        p['yemenite'] = reading
        
        last_line_was_blank = False

    # Post-processing
    final_map = {}
    for p in parashot:
        standard = p['standard']
        yemenite = p['yemenite']
        if standard: standard = standard.strip(' °')
        if yemenite: yemenite = yemenite.strip(' °')
        if not standard: standard = "Check manually"
        if not yemenite: yemenite = standard
        final_map[p['id']] = {"standard": standard, "yemenite": yemenite}

    with open('workspace/torah_trainer/data/haftara_map.json', 'w') as f:
        json.dump(final_map, f, indent=2)

if __name__ == "__main__":
    parse_haftarah()

import requests
import json

url = "https://www.sefaria.org/api/v2/index/Genesis"
resp = requests.get(url)
data = resp.json()

if 'alts' in data and 'Parasha' in data['alts']:
    node = data['alts']['Parasha']['nodes'][0] # Bereshit
    print(json.dumps(node, indent=2, ensure_ascii=False))

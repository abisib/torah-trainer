import requests
import json

url = "https://www.sefaria.org/api/v2/index/Genesis"
resp = requests.get(url)
data = resp.json()

if 'alts' in data and 'Parasha' in data['alts']:
    nodes = data['alts']['Parasha']['nodes']
    # Check the first one (Bereshit)
    node = nodes[0]
    print(json.dumps(node, indent=2, ensure_ascii=False))
else:
    print("Structure not found")

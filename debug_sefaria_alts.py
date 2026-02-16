import requests
import json

url = "https://www.sefaria.org/api/v2/index/Genesis"
resp = requests.get(url)
data = resp.json()

if 'alts' in data:
    print(json.dumps(list(data['alts'].keys()), indent=2))
else:
    print("No alts")

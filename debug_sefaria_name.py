import requests
import json

# Try to get info about the term "Bereshit" or the ref "Parashat Bereshit"
url = "https://www.sefaria.org/api/name/Parashat_Bereshit"
try:
    resp = requests.get(url)
    print(resp.text[:500]) # Print beginning
    data = resp.json()
    print(json.dumps(data, indent=2, ensure_ascii=False))
except Exception as e:
    print(e)

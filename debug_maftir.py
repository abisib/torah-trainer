import requests
import json

url = "https://www.sefaria.org/api/texts/Maftir_Bereshit?context=0"
try:
    resp = requests.get(url)
    print(json.dumps(resp.json(), indent=2))
except Exception as e:
    print(e)

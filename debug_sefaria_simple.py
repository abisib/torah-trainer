import requests
import json

# Check structure for a single-chapter range
url = "https://www.sefaria.org/api/texts/Genesis%201:1-1:5?context=0&versionTitle=Tanach with Ta'amei Hamikra"
resp = requests.get(url)
data = resp.json()

print(json.dumps(data, indent=2, ensure_ascii=False))

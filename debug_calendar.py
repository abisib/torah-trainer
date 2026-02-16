import requests
import json

url = "https://www.sefaria.org/api/calendars?timezone=Asia/Jerusalem"
resp = requests.get(url)
data = resp.json()

# Look for 'calendar_items' -> item with title.he == 'פרשת ...'
for item in data.get('calendar_items', []):
    if 'Parashat' in item.get('title', {}).get('en', ''):
        print(json.dumps(item, indent=2, ensure_ascii=False))
        # Check if it has 'extraDetails' -> 'aliyot' -> '8' or 'Maftir'?

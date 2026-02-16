import requests
import json

# Try to find Haftarah info for a Parasha
parasha = "Bereshit"
url = f"https://www.sefaria.org/api/calendars?timezone=Asia/Jerusalem"
# This is for today. Not useful for mapping all.

# Try getting the Parasha index/shape again, maybe I missed something.
url2 = "https://www.sefaria.org/api/v2/index/Parashat_Bereshit"
try:
    resp = requests.get(url2)
    # print(json.dumps(resp.json(), indent=2))
except:
    pass

# Another approach: Sefaria likely has a mapping in their source code or a specific API.
# Let's try searching the web or documentation? No, I have limited tools.
# Let's try to guess the ref. "Haftarah for Bereshit"?
url3 = "https://www.sefaria.org/api/name/Haftarah_for_Bereshit"
try:
    resp = requests.get(url3)
    print(json.dumps(resp.json(), indent=2))
except:
    pass

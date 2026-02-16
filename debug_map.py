import json
import os

path = "data/aliyah_map.json"
if os.path.exists(path):
    with open(path, 'r') as f:
        print(json.dumps(json.load(f), indent=2))
else:
    print("Map file not found")

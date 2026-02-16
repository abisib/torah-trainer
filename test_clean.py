import re
import html

def clean_html_and_spaces(text):
    text = html.unescape(text)
    text = re.sub(r'<[^>]+>', ' ', text) # Replace tags with space instead of empty string
    text = text.replace('\xa0', ' ').replace('\u2009', ' ')
    return ' '.join(text.split())

def clean_text(text):
    # Remove cantillation (trope)
    text = re.sub(r'[\u0591-\u05AF]', '', text)
    # Remove vowels (niqqud) - KEEP 05BE (Maqaf)
    text = re.sub(r'[\u05B0-\u05BD\u05BF\u05C1-\u05C2\u05C4-\u05C5\u05C7]', '', text)
    return text

sample = "בְּרֵאשִׁ֖ית בָּרָ֣א אֱלֹהִ֑ים אֵ֥ת הַשָּׁמַ֖יִם וְאֵ֥ת הָאָֽרֶץ׃"
cleaned = clean_html_and_spaces(sample)
stripped = clean_text(cleaned)

print(f"Original: {sample}")
print(f"Cleaned:  {stripped}")
print(f"Hex:      {[hex(ord(c)) for c in stripped]}")

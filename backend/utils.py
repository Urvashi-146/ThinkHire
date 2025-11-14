# backend/utils.py
import re

def normalize_text(s: str):
    if not s:
        return ""
    s = re.sub(r'<[^>]+>', ' ', s)  # strip HTML
    s = re.sub(r'\s+', ' ', s)
    return s.lower().strip()

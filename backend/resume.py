# backend/resume.py
import os
import json
import openai

OPENAI_KEY = os.environ.get('OPENAI_API_KEY')
if OPENAI_KEY:
    openai.api_key = OPENAI_KEY

PROMPT = (
    "Extract a JSON array (list) of the most relevant technical skills and tools "
    "mentioned in this resume text. Only return a JSON array of lowercase strings. "
    "Resume:\n\n"
)

# Very small fallback keyword list for demo if OpenAI not configured
FALLBACK_SKILLS = [
    "python","java","c++","javascript","react","node","flask","django","sql",
    "mongodb","aws","docker","kubernetes","html","css","tensorflow","pytorch"
]

def parse_resume(text: str):
    text = (text or "").strip()
    if not text:
        return []

    # If OpenAI key available, try to get structured skills
    if OPENAI_KEY:
        try:
            resp = openai.ChatCompletion.create(
                model="gpt-4o",
                messages=[{"role":"user","content": PROMPT + text}],
                max_tokens=200,
                temperature=0
            )
            content = resp['choices'][0]['message']['content'].strip()
            # Try to parse JSON out of response
            skills = json.loads(content)
            # normalize
            skills = [s.lower().strip() for s in skills if isinstance(s, str)]
            return list(dict.fromkeys(skills))  # dedupe preserving order
        except Exception as e:
            print("OpenAI parse error:", e)

    # Fallback: simple substring match
    lowered = text.lower()
    got = [s for s in FALLBACK_SKILLS if s in lowered]
    return got

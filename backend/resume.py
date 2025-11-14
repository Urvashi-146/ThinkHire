# backend/resume.py
import os
import json

# PDF reading library
try:
    from pypdf import PdfReader
except Exception:
    PdfReader = None

# Optional OpenAI usage
try:
    import openai
except Exception:
    openai = None

OPENAI_KEY = os.environ.get("OPENAI_API_KEY")
if OPENAI_KEY and openai:
    openai.api_key = OPENAI_KEY

PROMPT = (
    "Extract a JSON array of the most relevant technical skills and tools "
    "mentioned in this resume text. Only return a JSON array of lowercase strings.\n\nResume:\n\n"
)

FALLBACK_SKILLS = [
    "python","java","c++","javascript","react","node","flask","django","sql",
    "mongodb","aws","docker","kubernetes","html","css","tensorflow","pytorch",
    "mysql","postgresql","c#","php","ruby"
]


def extract_text_from_pdf(file_storage):
    if PdfReader is None:
        raise RuntimeError("pypdf library not installed. Run: pip install pypdf")
    try:
        reader = PdfReader(file_storage.stream)
        pages = []
        for p in reader.pages:
            try:
                pages.append(p.extract_text() or "")
            except:
                pages.append("")
        return "\n".join(pages).strip()
    except Exception as e:
        raise RuntimeError("PDF parse error: " + str(e))


def parse_resume(text: str):
    text = (text or "").strip()
    if not text:
        return []

    # Try OpenAI if available
    if OPENAI_KEY and openai:
        try:
            resp = openai.ChatCompletion.create(
                model="gpt-4o",
                messages=[{"role": "user", "content": PROMPT + text}],
                max_tokens=200,
                temperature=0
            )
            content = resp["choices"][0]["message"]["content"].strip()
            skills = json.loads(content)
            return [s.lower().strip() for s in skills if isinstance(s, str)]
        except:
            pass

    # Fallback keyword match
    lowered = text.lower()
    return [s for s in FALLBACK_SKILLS if s in lowered]

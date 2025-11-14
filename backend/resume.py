# backend/resume.py

import os
import json
import PyPDF2
import openai

# ⭐ Load OpenAI API key
OPENAI_KEY = os.environ.get("OPENAI_API_KEY")
if OPENAI_KEY:
    openai.api_key = OPENAI_KEY

# ⭐ Prompt for extracting skills
PROMPT = (
    "Extract a JSON array (list) of the most relevant technical skills and tools "
    "mentioned in this resume text. Only return a JSON array of lowercase strings. "
    "Resume:\n\n"
)

# ⭐ Small fallback list (if no OpenAI key used)
FALLBACK_SKILLS = [
    "python", "java", "c++", "javascript", "react", "node", "flask", "django",
    "sql", "mongodb", "aws", "docker", "kubernetes", "html", "css",
    "tensorflow", "pytorch"
]

# ⭐ EXTRACT TEXT FROM PDF
def extract_text_from_pdf(file_stream):
    try:
        reader = PyPDF2.PdfReader(file_stream)
        text = ""

        for page in reader.pages:
            text += page.extract_text() or ""

        return text.strip()
    except Exception as e:
        print("PDF extract error:", e)
        return ""


# ⭐ PARSE RESUME INTO SKILLS
def parse_resume(text: str):
    text = (text or "").strip()
    if not text:
        return []

    # ⭐ If OpenAI key available → AI skill detection
    if OPENAI_KEY:
        try:
            response = openai.ChatCompletion.create(
                model="gpt-4o-mini",
                messages=[{"role": "user", "content": PROMPT + text}],
                max_tokens=200,
                temperature=0
            )

            content = response["choices"][0]["message"]["content"].strip()

            # parse JSON
            skills = json.loads(content)

            # normalize list
            skills = [
                s.lower().strip()
                for s in skills
                if isinstance(s, str)
            ]

            return list(dict.fromkeys(skills))  # remove duplicates
        except Exception as e:
            print("OpenAI parse error:", e)

    # ⭐ Fallback (no OpenAI key)
    lowered = text.lower()
    found = [s for s in FALLBACK_SKILLS if s in lowered]

    return list(dict.fromkeys(found))

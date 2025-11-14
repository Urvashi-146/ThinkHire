# backend/jobs.py
import requests
from profession import detect_profession

REMOTE_OK = "https://remoteok.com/api"
ARBEITNOW = "https://www.arbeitnow.com/api/job-board-api"


# ---------------------------------------------------------
# FETCH JOBS FROM APIS
# ---------------------------------------------------------
def fetch_remoteok_jobs():
    try:
        r = requests.get(REMOTE_OK, timeout=10)
        data = r.json()
        if not isinstance(data, list):
            return []
        return data[1:]  # first object = metadata
    except Exception as e:
        print("RemoteOK error:", e)
        return []


def fetch_arbeitnow_jobs():
    try:
        r = requests.get(ARBEITNOW, timeout=10)
        data = r.json()
        return data.get("data", [])
    except Exception as e:
        print("Arbeitnow error:", e)
        return []


# ---------------------------------------------------------
# PROFESSION KEYWORDS
# ---------------------------------------------------------
PROFESSION_KEYWORDS = {
    "software": ["developer", "engineer", "software", "python", "java", "react", "node", "frontend", "backend"],
    "doctor": ["doctor", "medical", "clinic", "hospital", "physician", "healthcare", "nurse", "surgeon"],
    "lawyer": ["legal", "lawyer", "attorney", "court", "litigation"],
    "architect": ["architect", "autocad", "civil", "construction", "structural", "interior"],
    "teacher": ["teacher", "faculty", "education", "school", "trainer"],
    "marketing": ["marketing", "seo", "brand", "advertising", "digital"],
    "finance": ["finance", "accounting", "audit", "banking", "investment"],
    "general": []
}


# ---------------------------------------------------------
# MAIN MATCHING LOGIC (FIXED)
# ---------------------------------------------------------
def fetch_and_match_jobs(skills: list, resume_text: str = ""):
    # detect profession properly
    profession = detect_profession(resume_text)
    print("Profession detected:", profession)

    # fetch jobs once
    jobs = fetch_remoteok_jobs() + fetch_arbeitnow_jobs()
    print("Jobs fetched:", len(jobs))

    matched_jobs = []

    for job in jobs:
        # normalize title / description
        title = (job.get("title") or job.get("position") or "").lower()

        # RemoteOK tags is a LIST → convert to string safely
        tags = job.get("tags", [])
        if isinstance(tags, list):
            tags = " ".join([str(t).lower() for t in tags])
        else:
            tags = str(tags).lower()

        desc = (job.get("description") or "").lower() + " " + tags

        # profession-based match
        prof_keywords = PROFESSION_KEYWORDS.get(profession, [])
        profession_match = any(p in title or p in desc for p in prof_keywords)

        # special case:
        # if profession != software → allow jobs if text has 0 skills
        if profession != "software" and len(skills) == 0:
            profession_match = True

        if not profession_match:
            continue

        # skill matching (partial, improved)
        matched = [s for s in skills if s.lower() in desc or s.lower() in title]

        matched_jobs.append({
            "title": job.get("title") or job.get("position") or "Unknown Role",
            "company": job.get("company") or job.get("company_name") or "Unknown",
            "url": job.get("url") or job.get("apply_url") or job.get("url_original"),
            "matched_skills": matched,
            "raw": job
        })

    print("Matched Jobs:", len(matched_jobs))
    return matched_jobs[:20]   # return top 20

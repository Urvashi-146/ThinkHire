# backend/jobs.py
import requests
from utils import normalize_text

REMOTEOK_URL = "https://remoteok.com/api"
ARBEITNOW_URL = "https://www.arbeitnow.com/api/job-board-api"

def fetch_remoteok():
    try:
        r = requests.get(REMOTEOK_URL, headers={"User-Agent":"Mozilla/5.0"})
        data = r.json()
        # remoteok returns metadata at index 0; filter real job dicts
        jobs = [j for j in data if isinstance(j, dict) and j.get("company")]
        return jobs
    except Exception as e:
        print("RemoteOK fetch error:", e)
        return []

def fetch_arbeitnow():
    try:
        r = requests.get(ARBEITNOW_URL, headers={"User-Agent":"Mozilla/5.0"})
        data = r.json()
        jobs = data.get("data", []) if isinstance(data, dict) else []
        return jobs
    except Exception as e:
        print("ArbeitNow fetch error:", e)
        return []

def match_job_to_skills(job, skills):
    text = ""
    # try multiple fields depending on source
    for k in ("description","tags","position","title","company","slug","role"):
        val = job.get(k) if isinstance(job, dict) else None
        if isinstance(val, (list, tuple)):
            val = " ".join(val)
        if val:
            text += " " + str(val)
    text = normalize_text(text)
    matched = [s for s in skills if s.lower() in text]
    return matched

def fetch_and_match_jobs(skills):
    if not skills:
        # demo default
        skills = ["python","react","aws"]
    matches = []
    sources = []
    sources += fetch_remoteok()
    sources += fetch_arbeitnow()
    # limit to first 400 to keep it quick
    for j in sources[:400]:
        try:
            matched = match_job_to_skills(j, skills)
            if matched:
                item = {
                    "title": j.get("position") or j.get("title") or j.get("slug") or "",
                    "company": j.get("company") or j.get("company_name") or "",
                    "url": j.get("url") or j.get("path") or j.get("redirect_url") or "",
                    "matched_skills": matched,
                    "raw": j
                }
                matches.append(item)
        except Exception:
            continue
    return matches

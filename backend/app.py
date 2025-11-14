# backend/app.py
import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from apscheduler.schedulers.background import BackgroundScheduler

from resume import parse_resume, extract_text_from_pdf  # ⭐ PDF parser added
from jobs import fetch_and_match_jobs
from models import init_db, save_match
from notifications import send_email, send_telegram

app = Flask(__name__)
CORS(app)
app.config['SECRET_KEY'] = os.environ.get('FLASK_SECRET', 'dev')

# ⭐ Initialize DB
init_db()


@app.route('/')
def health():
    return jsonify({"status": "ThinkHire backend running"})


@app.route('/api/upload-resume', methods=['POST'])
def upload_resume():
    """
    Accepts multipart form:
       - PDF file
       - TXT file
       - OR JSON with "text"
    Returns extracted skills + job matches.
    """
    try:
        text = ""

        # ⭐ CASE 1 — File uploaded (PDF or TXT)
        if "file" in request.files:
            f = request.files["file"]

            # PDF
            if f.filename.lower().endswith(".pdf"):
                text = extract_text_from_pdf(f)

            # TXT or others
            else:
                text = f.read().decode("utf-8", errors="ignore")

        # ⭐ CASE 2 — Raw text
        else:
            body = request.get_json(force=True, silent=True) or {}
            text = body.get("text", "")

        if not text.strip():
            return jsonify({"error": "No text extracted from file."}), 400

        # ⭐ Extract skills
        skills = parse_resume(text)

        # ⭐ Match jobs
        matches = fetch_and_match_jobs(skills)

        # ⭐ Save to DB
        for m in matches:
            save_match(m)

        return jsonify({"skills": skills, "matches": matches}), 200

    except Exception as e:
        print("UPLOAD ERROR:", e)
        return jsonify({"error": str(e)}), 500


@app.route('/api/fetch-jobs', methods=['POST', 'GET'])
def fetch_jobs_endpoint():
    """
    POST: { "skills": [...] }
    GET: Uses empty skill list
    """
    data = request.get_json(force=True, silent=True) or {}
    skills = data.get("skills") or []

    matches = fetch_and_match_jobs(skills)

    for m in matches:
        save_match(m)

    return jsonify({"matches": matches}), 200


# ⭐ Scheduler (runs every 6 hours)
scheduler = BackgroundScheduler()
interval_minutes = int(os.environ.get("SCHEDULE_INTERVAL_MINUTES", 360))


@scheduler.scheduled_job("interval", minutes=interval_minutes)
def scheduled_fetch():
    print("Scheduler: fetching jobs for demo users...")
    fetch_and_match_jobs([])


scheduler.start()


if __name__ == "__main__":
    debug = os.environ.get("FLASK_DEBUG", "1") == "1"
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5000)), debug=debug)

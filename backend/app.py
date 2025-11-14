# backend/app.py
import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from apscheduler.schedulers.background import BackgroundScheduler

from resume import parse_resume, extract_text_from_pdf
from jobs import fetch_and_match_jobs       # FIXED: only this import
from models import init_db, save_match
from notifications import send_email, send_telegram
from profession import detect_profession

app = Flask(__name__)
CORS(app)
app.config["SECRET_KEY"] = os.environ.get("FLASK_SECRET", "dev")

# Initialize DB
init_db()


@app.route("/")
def health():
    return jsonify({"status": "ThinkHire backend running"})


# ===============================================================
# ⭐ MAIN ENDPOINT — UPLOAD RESUME & GET SKILLS + MATCHED JOBS
# ===============================================================
@app.route("/api/upload-resume", methods=["POST"])
def upload_resume():
    try:
        text = ""

        # ---------------------------
        # 1️⃣ FILE UPLOAD CASE
        # ---------------------------
        if "file" in request.files:
            file = request.files["file"]

            if file.filename.lower().endswith(".pdf"):
                text = extract_text_from_pdf(file)
            else:
                text = file.read().decode("utf-8", errors="ignore")

        # ---------------------------
        # 2️⃣ RAW TEXT CASE
        # ---------------------------
        else:
            body = request.get_json(force=True, silent=True) or {}
            text = body.get("text", "")

        if not text.strip():
            return jsonify({"error": "No text extracted from resume."}), 400

        # ---------------------------
        # 3️⃣ SKILL EXTRACTION
        # ---------------------------
        skills = parse_resume(text)
        print("Extracted Skills:", skills)

        # ---------------------------
        # 4️⃣ PROFESSION DETECTION
        # ---------------------------
        profession = detect_profession(text)
        print("Detected Profession:", profession)

        # ---------------------------
        # 5️⃣ JOB MATCHING (skills + profession)
        # ---------------------------
        final_matches = fetch_and_match_jobs(skills, resume_text=text)
        print("Matched Jobs:", len(final_matches))

        # ---------------------------
        # 6️⃣ SAVE TO DB
        # ---------------------------
        for m in final_matches:
            try:
                save_match(m)
            except Exception as db_err:
                print("DB save error:", db_err)

        # ---------------------------
        # 7️⃣ SEND RESPONSE
        # ---------------------------
        return jsonify({
            "profession": profession,
            "skills": skills,
            "matches": final_matches
        }), 200

    except Exception as e:
        print("\n🔥 UPLOAD ERROR:", e)
        return jsonify({"error": str(e)}), 500


# ===============================================================
# ⭐ MANUAL JOB FETCH ENDPOINT
# ===============================================================
@app.route("/api/fetch-jobs", methods=["POST", "GET"])
def fetch_jobs_endpoint():
    data = request.get_json(force=True, silent=True) or {}
    skills = data.get("skills", [])

    matches = fetch_and_match_jobs(skills, resume_text="")
    for m in matches:
        save_match(m)

    return jsonify({"matches": matches}), 200


# ===============================================================
# ⭐ SCHEDULER (every 6 hours or custom)
# ===============================================================
scheduler = BackgroundScheduler()
interval_minutes = int(os.environ.get("SCHEDULE_INTERVAL_MINUTES", 360))


@scheduler.scheduled_job("interval", minutes=interval_minutes)
def scheduled_fetch():
    print("Scheduler running...")
    fetch_and_match_jobs([], resume_text="")


scheduler.start()


# ===============================================================
# ⭐ RUN SERVER
# ===============================================================
if __name__ == "__main__":
    debug = os.environ.get("FLASK_DEBUG", "1") == "1"
    app.run(
        host="0.0.0.0",
        port=int(os.environ.get("PORT", 5000)),
        debug=debug
    )

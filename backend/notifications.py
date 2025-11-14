# backend/notifications.py
import os
import smtplib
from email.mime.text import MIMEText
import requests

SMTP_HOST = os.environ.get('SMTP_HOST')
SMTP_PORT = int(os.environ.get('SMTP_PORT', 587))
SMTP_USER = os.environ.get('SMTP_USER')
SMTP_PASS = os.environ.get('SMTP_PASS')
TELEGRAM_TOKEN = os.environ.get('TELEGRAM_BOT_TOKEN')
TELEGRAM_CHAT_ID = os.environ.get('TELEGRAM_CHAT_ID')

def send_email(job):
    if not (SMTP_HOST and SMTP_USER and SMTP_PASS):
        print("SMTP not configured - skipping email")
        return False
    try:
        subject = f"ThinkHire — New Job: {job.get('title')} @ {job.get('company')}"
        body = f"Found job matching your skills: {job.get('matched_skills')}\n\nLink: {job.get('url')}"
        msg = MIMEText(body)
        msg['Subject'] = subject
        msg['From'] = SMTP_USER
        msg['To'] = SMTP_USER  # demo: send to yourself; change for multi-user
        s = smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=10)
        s.starttls()
        s.login(SMTP_USER, SMTP_PASS)
        s.sendmail(SMTP_USER, [SMTP_USER], msg.as_string())
        s.quit()
        print("Email sent")
        return True
    except Exception as e:
        print("Email send error:", e)
        return False

def send_telegram(job):
    if not (TELEGRAM_TOKEN and TELEGRAM_CHAT_ID):
        print("Telegram not configured - skipping telegram")
        return False
    try:
        text = f"New job: {job.get('title')} @ {job.get('company')}\nSkills: {', '.join(job.get('matched_skills', []))}\n{job.get('url')}"
        url = f"https://api.telegram.org/bot{TELEGRAM_TOKEN}/sendMessage"
        requests.post(url, json={"chat_id": TELEGRAM_CHAT_ID, "text": text}, timeout=10)
        print("Telegram sent")
        return True
    except Exception as e:
        print("Telegram send error:", e)
        return False

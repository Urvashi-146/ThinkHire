# ThinkHire – AI Job Matching System 🤖

ThinkHire is an AI-powered job matching platform that reads resumes, extracts skills using AI, fetches real-time job opportunities from trusted job boards, and notifies users instantly via Email & Telegram.

---

## 🔍 Overview

- Built using **Python, Flask, and React**
- Uses **OpenAI GPT** for intelligent resume skill extraction
- Fetches real-time jobs from public APIs (RemoteOK, ArbeitNow)
- Matches jobs based on extracted skills
- Sends job alerts through **Email & Telegram**
- Designed for automation and multi-user scalability

---

## 📁 Project Files

| File / Folder | Description |
|---------------|-------------|
| `backend/app.py` | Main Flask backend server |
| `backend/resume.py` | Resume parsing + AI skill extraction |
| `backend/jobs.py` | Real-time job fetching & matching |
| `backend/notifications.py` | Email + Telegram notification logic |
| `backend/models.py` | Database for job storage |
| `backend/utils.py` | Helper functions |
| `backend/requirements.txt` | Python dependencies |
| `frontend/index.html` | React app entry point |
| `frontend/src/App.jsx` | Resume upload UI |
| `frontend/src/main.jsx` | React root file |
| `.gitignore` | Git ignore rules |

---

## 🗂 Folder Structure

```
ThinkHire/
├── backend/
│   ├── app.py
│   ├── resume.py
│   ├── jobs.py
│   ├── notifications.py
│   ├── models.py
│   ├── utils.py
│   └── requirements.txt
│
├── frontend/
│   ├── index.html
│   └── src/
│       ├── App.jsx
│       └── main.jsx
│
└── .gitignore
```

---

## 🚀 Run This Project Locally

```bash
git clone https://github.com/Urvashi-146/ThinkHire.git
cd ThinkHire
```

### 🛠 Backend Setup
```bash
cd backend
pip install -r requirements.txt
python app.py
```

### 🎨 Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

---

## 🔮 Future Enhancements

- SaaS version with user login  
- Multi-user dashboards  
- More job platforms (LinkedIn, Indeed)  
- AI-based job ranking  
- OAuth secure authentication  
- In-app real-time notifications  

---

## 👩‍💻 Author

**Urvashi Sharma**  
ThinkHire – AI Job Matching Project  

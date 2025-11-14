# ThinkHire – AI Job Matching & Notification System

ThinkHire is an AI-powered job automation system that reads user resumes, extracts skills using LLMs, fetches real-time job opportunities from trusted job platforms, and matches them intelligently. The system also sends notifications through Email and Telegram so that users never miss a relevant opening.

---

## 🚀 Features

- 📄 **AI Resume Parsing** using OpenAI LLM
- 🎯 **Accurate Skill Extraction**
- 🌐 **Real-Time Job Fetching**
  - RemoteOK API  
  - ArbeitNow API  
- 🔍 **Skill-Based Job Matching**
- ✉️ **Email & Telegram Notifications**
- 📊 Google Sheet / Database storage support
- ⏰ **Automated Scheduler** (runs every 6 hours)
- ⚙️ Flask Backend + React Frontend Architecture

---

## 🧠 Tech Stack

### **Frontend**
- React.js  
- Tailwind CSS  

### **Backend**
- Python  
- Flask  
- SQLite (or Google Sheets)  

### **AI**
- OpenAI GPT Models  

### **Integrations**
- Gmail SMTP  
- Telegram Bot API  
- Job APIs (RemoteOK, ArbeitNow)

---


ThinkHire/
│── backend/
│ ├── app.py
│ ├── resume.py
│ ├── jobs.py
│ ├── notifications.py
│ ├── models.py
│ ├── utils.py
│ └── requirements.txt
│
├── frontend/
│ ├── index.html
│ └── src/
│ ├── App.jsx
│ └── main.jsx
│
└── .gitignore


---

## 🛠️ How to Run Locally

### 🔧 Backend Setup


cd backend
pip install -r requirements.txt
python app.py


### 🎨 Frontend Setup


cd frontend
npm install
npm run dev


---

## ✨ Future Enhancements

- Full SaaS web portal with user login
- Multi-user job dashboards
- Integration with LinkedIn, Indeed, etc.
- Advanced AI ranking for job matches
- Secure OAuth authentication
- In-app notification system

---

## 👤 Author

**Urvashi Sharma**  
ThinkHire – AI Job Automation Project


## 📁 Project Structure


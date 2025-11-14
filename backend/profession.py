# backend/profession.py
"""
ThinkHire — Advanced Profession Detection System
Using score-based weighted keyword matching for higher accuracy.
"""

def detect_profession(text: str):
    if not text:
        return "general"

    txt = text.lower()

    # Score dictionary
    score = {
        "software": 0,
        "doctor": 0,
        "lawyer": 0,
        "architect": 0,
        "teacher": 0,
        "marketing": 0,
        "finance": 0,
    }

    # ---------------- SOFTWARE / TECH ----------------
    software_keywords = [
        "developer", "software", "engineer", "programmer", "devops",
        "python", "java", "react", "node", "backend", "frontend",
        "full stack", "cloud", "api", "docker", "kubernetes",
        "database", "html", "css", "javascript", "ml", "ai", "data science"
    ]

    # ---------------- DOCTOR / MEDICAL ----------------
    doctor_keywords = [
        "clinic", "hospital", "medical", "patient", "treatment",
        "doctor", "physician", "surgery", "surgeon", "medicine",
        "diagnosis", "mbbs", "md", "icu", "healthcare", "nurse",
        "pharmacology", "cardiology", "radiology"
    ]

    # ---------------- LAWYER / LEGAL ----------------
    lawyer_keywords = [
        "lawyer", "legal", "litigation", "court", "attorney",
        "advocate", "contract law", "criminal law", "compliance",
        "legal drafting", "human rights"
    ]

    # ---------------- ARCHITECT / CIVIL ----------------
    architect_keywords = [
        "architect", "architecture", "autocad", "blueprint",
        "civil engineer", "construction", "planning",
        "structural design", "floor plan", "3d modelling",
        "revit", "interior design"
    ]

    # ---------------- TEACHER / EDUCATION ----------------
    teacher_keywords = [
        "teacher", "teaching", "classroom", "lesson plan",
        "curriculum", "school", "faculty", "education",
        "training", "mentoring", "tutor", "lecture"
    ]

    # ---------------- MARKETING / BUSINESS ----------------
    marketing_keywords = [
        "marketing", "digital marketing", "seo", "brand",
        "branding", "advertising", "campaign", "content",
        "social media", "market research", "copywriting"
    ]

    # ---------------- FINANCE / ACCOUNTING ----------------
    finance_keywords = [
        "finance", "financial", "accounting", "tax", "audit",
        "budgeting", "banking", "investment", "payroll",
        "ca", "cpa", "equity", "risk analysis"
    ]

    # ---------------- SCORING ----------------
    def add_scores(keywords, profession):
        for word in keywords:
            if word in txt:
                score[profession] += 1

    add_scores(software_keywords, "software")
    add_scores(doctor_keywords, "doctor")
    add_scores(lawyer_keywords, "lawyer")
    add_scores(architect_keywords, "architect")
    add_scores(teacher_keywords, "teacher")
    add_scores(marketing_keywords, "marketing")
    add_scores(finance_keywords, "finance")

    # ---------------- FINAL DECISION ----------------
    best = max(score, key=score.get)

    # If everything is 0 → general
    if score[best] == 0:
        return "general"

    return best

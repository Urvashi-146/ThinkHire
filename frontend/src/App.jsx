import React, { useState } from "react";
import axios from "axios";
import "./components/index.css";
 // import CSS here so standalone works if you paste only App.jsx

const BACKEND_URL = "http://127.0.0.1:5000";

export default function App() {
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [skills, setSkills] = useState([]);
  const [matches, setMatches] = useState([]);
  const [error, setError] = useState("");

  const validateAndSetFile = (selected) => {
    if (!selected) return;
    const name = selected.name.toLowerCase();
    if (!name.endsWith(".pdf") && !name.endsWith(".txt")) {
      setError("❌ Only PDF or TXT files allowed.");
      return;
    }
    setFile(selected);
    setError("");
  };

  const handleFileChange = (e) => {
    validateAndSetFile(e.target.files[0]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };
  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    validateAndSetFile(e.dataTransfer.files[0]);
  };

  const uploadResume = async () => {
    setError("");
    setSkills([]);
    setMatches([]);
    setLoading(true);

    if (!file) {
      setError("Please upload a PDF/TXT resume.");
      setLoading(false);
      return;
    }

    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await axios.post(`${BACKEND_URL}/api/upload-resume`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 60000
      });

      setSkills(res.data.skills || []);
      setMatches(res.data.matches || []);
    } catch (err) {
      console.error(err);
      setError("❌ Request failed — check backend is running & CORS allowed.");
    }

    setLoading(false);
  };

  return (
    <div className="page">
      <div className="upload-container">
        <h1 className="neon-title">⬆ Upload Your Resume</h1>

        <div
          className={`upload-box ${dragActive ? "drag-active" : ""}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <label htmlFor="fileInput" className="upload-label">
            <div className="cloud-icon">☁️</div>
            <div className="upload-text">Click or Drag & Drop PDF Resume</div>
          </label>

          <input
            id="fileInput"
            type="file"
            accept=".pdf,.txt"
            onChange={handleFileChange}
            style={{ display: "none" }}
          />
        </div>

        {file && <div className="file-name">Selected: <b>{file.name}</b></div>}

        <button className="neon-btn" onClick={uploadResume} disabled={loading}>
          {loading ? "Processing…" : "🚀 Upload Now"}
        </button>

        {error && <div className="error">{error}</div>}

        <div className="results-section">
          <h2 className="section-title">Extracted Skills</h2>
          <div className="skills-row">
            {skills.length ? skills.map((s, i) => (
              <span key={i} className="skill-pill">{s}</span>
            )) : <i>No skills yet</i>}
          </div>

          <h2 className="section-title">Matched Jobs</h2>
          <div className="jobs-list">
            {matches.length ? matches.map((job, i) => (
              <div className="job-card" key={i}>
                <h3>{job.title || "No Title"}</h3>
                <p className="company">{job.company || "Unknown Company"}</p>
                <p className="matched"><b>Matched:</b> {job.matched_skills?.join(", ") || "-"}</p>
                <a className="apply-btn" href={job.url || job.raw?.apply_url} target="_blank" rel="noreferrer">Apply</a>
              </div>
            )) : <i>No matched jobs yet</i>}
          </div>
        </div>
      </div>
    </div>
  );
}

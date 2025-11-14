// frontend/src/App.jsx
import React, { useState } from "react";
import axios from "axios";
import "./components/index.css"; // ensure index.css lives in src/

const BACKEND_URL = "http://127.0.0.1:5000";

export default function App() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [skills, setSkills] = useState([]);
  const [matches, setMatches] = useState([]);
  const [error, setError] = useState("");

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    if (!f.name.toLowerCase().endsWith(".pdf") && !f.name.toLowerCase().endsWith(".txt")) {
      setError("Only .pdf or .txt allowed");
      return;
    }
    setFile(f);
    setError("");
  };

  const uploadResume = async () => {
    setError("");
    setSkills([]);
    setMatches([]);
    setLoading(true);

    try {
      if (!file) {
        setError("Please choose a PDF or TXT resume file.");
        setLoading(false);
        return;
      }
      const fd = new FormData();
      fd.append("file", file);

      const res = await axios.post(`${BACKEND_URL}/api/upload-resume`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSkills(res.data.skills || []);
      setMatches(res.data.matches || []);
    } catch (err) {
      console.error(err);
      setError("Backend not running or wrong API route.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg">
      <div className="card">
        <h2 className="title">⬆ Upload Your Resume</h2>

        <label className="drop">
          <input type="file" onChange={handleFileChange} accept=".pdf,.txt" />
          <div className="drop-inner">
            <div className="cloud">☁️</div>
            <div className="drop-text">Click or Drag & Drop PDF Resume</div>
          </div>
        </label>

        <button className="upload-btn" onClick={uploadResume} disabled={loading}>
          {loading ? "Processing…" : "Upload Now"}
        </button>

        {error && <div className="error">{error}</div>}

        <h3>Extracted Skills</h3>
        <div className="skills">
          {skills.length ? skills.map((s, i) => <span key={i} className="skill-pill">{s}</span>) : <i>No skills yet</i>}
        </div>

        <h3>Matched Jobs</h3>
        <div className="matches">
          {matches.length ? matches.map((job, i) => (
            <div key={i} className="job">
              <h4>{job.title || "No title"}</h4>
              <div className="company">{job.company || job.raw?.company || "Unknown"}</div>
              <div className="matched"><b>Matched:</b> {(job.matched_skills||[]).join(", ")}</div>
              <a className="apply" href={job.url||job.raw?.apply_url} target="_blank" rel="noreferrer">Apply</a>
            </div>
          )) : <i>No matched jobs yet</i>}
        </div>
      </div>
    </div>
  );
}

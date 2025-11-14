// frontend/src/components/ResumeUploadNeon.jsx
import React, { useRef, useState, useEffect } from "react";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://127.0.0.1:5000";

export default function ResumeUploadNeon({ onResult }) {
  const [file, setFile] = useState(null);
  const [filename, setFilename] = useState("No file chosen");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [skills, setSkills] = useState([]);
  const [matches, setMatches] = useState([]);

  const fileInputRef = useRef(null);
  const dropRef = useRef(null);
  const canvasRef = useRef(null);

  // Canvas star background
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    const stars = Array.from({ length: 120 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.6 + 0.2,
      vx: (Math.random() - 0.5) * 0.2,
    }));

    let raf;
    function loop() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // subtle base so canvas blends in
      ctx.fillStyle = "rgba(5,16,24,0.04)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = "#06f5dd";
      ctx.globalAlpha = 0.9;
      for (let s of stars) {
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
        s.x += s.vx;
        s.y += 0.12;
        if (s.y > canvas.height) s.y = 0;
        if (s.x > canvas.width) s.x = 0;
        if (s.x < 0) s.x = canvas.width;
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(loop);
    }
    raf = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(raf);
    };
  }, []);

  // drag & drop class toggles
  useEffect(() => {
    const el = dropRef.current;
    if (!el) return;

    const over = (e) => {
      e.preventDefault();
      el.classList.add("drop-active");
    };
    const leave = (e) => {
      e.preventDefault();
      el.classList.remove("drop-active");
    };
    const drop = (e) => {
      e.preventDefault();
      el.classList.remove("drop-active");
      const f = e.dataTransfer.files && e.dataTransfer.files[0];
      if (f) selectFile(f);
    };

    el.addEventListener("dragover", over);
    el.addEventListener("dragleave", leave);
    el.addEventListener("drop", drop);

    return () => {
      el.removeEventListener("dragover", over);
      el.removeEventListener("dragleave", leave);
      el.removeEventListener("drop", drop);
    };
  }, []);

  function selectFile(f) {
    if (!f) return;
    const name = (f.name || "").toLowerCase();
    if (!name.endsWith(".pdf") && !name.endsWith(".txt")) {
      setError("Only PDF or TXT files allowed");
      return;
    }
    setFile(f);
    setFilename(f.name);
    setError("");
  }

  async function upload() {
    setError("");
    setSkills([]);
    setMatches([]);
    if (!file) {
      setError("Please choose a PDF or TXT file first.");
      return;
    }

    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await axios.post(`${BACKEND_URL}/api/upload-resume`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 120000,
      });

      if (res.data) {
        setSkills(res.data.skills || []);
        setMatches(res.data.matches || []);
        if (onResult) onResult(res.data);
      } else {
        setError("No response from server.");
      }
    } catch (err) {
      console.error(err);
      setError("Upload failed. Check backend is running.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="bg neon-page">
      <canvas ref={canvasRef} className="star-canvas" />

      <div className="neon-layout">

        {/* Left: Upload Card */}
        <div className="card neon-card upload-column">
          <h2 className="title">Upload Your Resume</h2>

          <div
            ref={dropRef}
            className="drop neon-drop"
            onClick={() => fileInputRef.current && fileInputRef.current.click()}
          >
            <div className="drop-inner">
              <div className="cloud">⬆️</div>
              <div className="drop-text">Click or Drag & Drop PDF Resume</div>
              <div className="drop-text small">Only .pdf or .txt</div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.txt"
              onChange={(e) => selectFile(e.target.files[0])}
              style={{ display: "none" }}
            />
          </div>

          <button
            className="upload-btn"
            onClick={upload}
            disabled={uploading}
            aria-busy={uploading}
          >
            {uploading ? "Uploading..." : "Upload Now"}
          </button>

          <div className="file-info">
            <span className="filename">{filename}</span>
            {error && <div className="error">{error}</div>}
          </div>
        </div>

        {/* Right: Results */}
        <div className="neon-results results-column">
          <div className="card results-card">
            <h3 className="section-title">Extracted Skills</h3>
            <div className="section-sub">Detected from your resume</div>
            <div className="skills">
              {skills.length > 0 ? (
                skills.map((s, i) => (
                  <span key={i} className="skill-pill">{s}</span>
                ))
              ) : (
                <i className="muted">No skills yet</i>
              )}
            </div>

            <h3 className="section-title" style={{ marginTop: 18 }}>Matched Jobs</h3>
            <div className="section-sub">Jobs matching your skillset</div>

            <div className="jobs-list">
              {matches.length > 0 ? (
                matches.map((job, i) => (
                  <div key={i} className="job" style={{ animationDelay: `${i * 80}ms` }}>
                    <h4>{job.title || "No Title"}</h4>
                    <div className="company">{job.company || "Unknown Company"}</div>
                    <div className="matched">
                      <strong>Matched:</strong> {(job.matched_skills || []).join(", ") || "—"}
                    </div>
                    <a className="apply" href={job.url || job.raw?.apply_url} target="_blank" rel="noreferrer">Apply</a>
                  </div>
                ))
              ) : (
                <i className="muted">No matched jobs yet</i>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

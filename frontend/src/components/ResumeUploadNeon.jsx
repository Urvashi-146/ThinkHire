// frontend/src/components/ResumeUploadNeon.jsx
import React, { useRef, useState, useEffect } from "react";
import axios from "axios";

const BACKEND_URL = "http://127.0.0.1:5000";

export default function ResumeUploadNeon({ onResult }) {
  const [file, setFile] = useState(null);
  const [filename, setFilename] = useState("No file chosen");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [skills, setSkills] = useState([]);
  const [matches, setMatches] = useState([]);

  const dropRef = useRef(null);
  const canvasRef = useRef(null);

  // Canvas stars background
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
      ctx.fillStyle = "#062126";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = "#06f5dd";
      ctx.globalAlpha = 0.85;
      for (let s of stars) {
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
        s.x += s.vx;
        s.y += 0.15;
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

  // Drag & drop visual
  useEffect(() => {
    const el = dropRef.current;
    if (!el) return;

    const handleDragOver = (e) => {
      e.preventDefault();
      el.style.borderColor = "#00f0ff";
      el.style.boxShadow = "0 0 20px rgba(0,240,255,0.15)";
    };
    const handleDragLeave = (e) => {
      e.preventDefault();
      el.style.borderColor = "rgba(0,240,255,0.45)";
      el.style.boxShadow = "none";
    };
    const handleDrop = (e) => {
      e.preventDefault();
      el.style.borderColor = "rgba(0,240,255,0.45)";
      el.style.boxShadow = "none";
      const f = e.dataTransfer.files && e.dataTransfer.files[0];
      if (f) selectFile(f);
    };

    el.addEventListener("dragover", handleDragOver);
    el.addEventListener("dragleave", handleDragLeave);
    el.addEventListener("drop", handleDrop);

    return () => {
      el.removeEventListener("dragover", handleDragOver);
      el.removeEventListener("dragleave", handleDragLeave);
      el.removeEventListener("drop", handleDrop);
    };
  }, []);

  function selectFile(f) {
    if (!f) return;
    const name = f.name.toLowerCase();
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
    <div style={styles.page}>
      <canvas ref={canvasRef} style={styles.canvas} />

      <div style={styles.centerCard}>
        <div style={styles.card}>
          <h2 style={styles.title}>
            <span style={{ marginRight: 8 }}>☁️</span> Upload Your Resume
          </h2>

          <div ref={dropRef} style={styles.dropZone}>
            <div style={styles.cloudIcon}>⬆️</div>
            <div style={styles.dropText}>Click or Drag & Drop PDF Resume</div>
            <div style={styles.small}>Only .pdf or .txt</div>
          </div>

          <div style={{ marginTop: 12, textAlign: "center" }}>
            <label style={styles.chooseBtn}>
              Choose File
              <input
                type="file"
                accept=".pdf,.txt"
                onChange={(e) => selectFile(e.target.files[0])}
                style={{ display: "none" }}
              />
            </label>
          </div>

          <div style={styles.filenameLine}>
            <span style={{ opacity: 0.85 }}>{filename}</span>
          </div>

          <button
            onClick={upload}
            style={uploading ? styles.uploadBtnDisabled : styles.uploadBtn}
            disabled={uploading}
          >
            {uploading ? "Uploading..." : "Upload Now"}
          </button>

          {error && <div style={styles.error}>{error}</div>}
        </div>

        {/* Results below card */}
        <div style={styles.results}>
          <h3 style={{ color: "#cfeff0" }}>Extracted Skills:</h3>
          <div style={styles.skillRow}>
            {skills.length > 0 ? (
              skills.map((s, i) => (
                <span key={i} style={styles.skillPill}>
                  {s}
                </span>
              ))
            ) : (
              <i style={{ color: "#9fb0b0" }}>No skills yet</i>
            )}
          </div>

          <h3 style={{ color: "#cfeff0", marginTop: 18 }}>Matched Jobs:</h3>
          <div>
            {matches.length > 0 ? (
              matches.map((job, i) => (
                <div key={i} style={styles.jobCard}>
                  <h4 style={{ margin: 0 }}>{job.title || "No Title"}</h4>
                  <div style={{ color: "#9fb0b0", marginTop: 6 }}>
                    {job.company || "Unknown Company"}
                  </div>
                  <div style={{ marginTop: 8 }}>
                    <b>Matched:</b>{" "}
                    {(job.matched_skills || []).join(", ") || "—"}
                  </div>
                  <a
                    href={job.url || job.raw?.apply_url}
                    target="_blank"
                    rel="noreferrer"
                    style={styles.applyLink}
                  >
                    Apply
                  </a>
                </div>
              ))
            ) : (
              <i style={{ color: "#9fb0b0" }}>No matched jobs yet</i>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Styles (neon-ish)
const styles = {
  page: {
    width: "100%",
    minHeight: "100vh",
    background: "#051018",
    position: "relative",
    fontFamily: "'Poppins', Arial, sans-serif",
  },
  canvas: {
    position: "fixed",
    inset: 0,
    zIndex: 0,
  },
  centerCard: {
    position: "relative",
    zIndex: 2,
    maxWidth: 920,
    margin: "40px auto",
    display: "grid",
    gridTemplateColumns: "520px 1fr",
    gap: 30,
    alignItems: "start",
    padding: "12px",
  },
  card: {
    borderRadius: 16,
    padding: 26,
    background: "linear-gradient(180deg, rgba(0,0,0,0.35), rgba(255,255,255,0.02))",
    border: "1px solid rgba(0,240,255,0.25)",
    boxShadow: "0 8px 40px rgba(0,240,255,0.06), 0 0 50px rgba(0,240,255,0.06)",
    textAlign: "center",
  },
  title: {
    color: "#00f0ff",
    textShadow: "0 0 8px rgba(0,240,255,0.25)",
    marginBottom: 12,
    letterSpacing: 1,
  },
  dropZone: {
    borderRadius: 12,
    border: "2px dashed rgba(0,240,255,0.45)",
    padding: 28,
    minHeight: 120,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    color: "#bfeff0",
    cursor: "pointer",
  },
  cloudIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  dropText: {
    fontSize: 16,
    fontWeight: 600,
  },
  small: {
    fontSize: 12,
    opacity: 0.75,
    marginTop: 6,
  },
  chooseBtn: {
    marginTop: 8,
    padding: "10px 18px",
    background: "linear-gradient(90deg,#00e0ff,#d02bff)",
    color: "#001",
    borderRadius: 30,
    fontWeight: 700,
    cursor: "pointer",
    display: "inline-block",
  },
  filenameLine: {
    marginTop: 12,
    color: "#9fb0b0",
    minHeight: 20,
  },
  uploadBtn: {
    marginTop: 14,
    padding: "12px 20px",
    borderRadius: 30,
    background: "linear-gradient(90deg,#00d5ff,#ff3cdf)",
    color: "#001",
    fontWeight: 800,
    cursor: "pointer",
    border: "none",
    width: "100%",
  },
  uploadBtnDisabled: {
    marginTop: 14,
    padding: "12px 20px",
    borderRadius: 30,
    background: "#5a5f66",
    color: "#ddd",
    fontWeight: 800,
    border: "none",
    width: "100%",
    cursor: "not-allowed",
  },
  error: {
    marginTop: 12,
    color: "#ff8a8a",
    fontWeight: 700,
  },
  results: {
    marginTop: 8,
    padding: 10,
  },
  skillRow: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
    marginTop: 8,
  },
  skillPill: {
    background: "rgba(255,255,255,0.06)",
    padding: "6px 10px",
    borderRadius: 20,
    border: "1px solid rgba(0,240,255,0.08)",
    color: "#dffcff",
    fontWeight: 600,
    fontSize: 13,
  },
  jobCard: {
    background: "rgba(255,255,255,0.02)",
    border: "1px solid rgba(255,255,255,0.03)",
    padding: 14,
    borderRadius: 10,
    marginBottom: 12,
    color: "#eafcff",
  },
  applyLink: {
    marginTop: 8,
    display: "inline-block",
    padding: "6px 12px",
    background: "#00d28a",
    color: "#001",
    borderRadius: 8,
    textDecoration: "none",
    fontWeight: 700,
  },
};

import React, { useState } from "react";
import axios from "axios";

// ⭐ BACKEND URL (Correct)
const BACKEND_URL = "http://127.0.0.1:5000";

export default function App() {
  const [file, setFile] = useState(null);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [skills, setSkills] = useState([]);
  const [matches, setMatches] = useState([]);
  const [error, setError] = useState("");

  const uploadResume = async () => {
    setError("");
    setSkills([]);
    setMatches([]);
    setLoading(true);

    try {
      let response;

      // ⭐ CASE 1 — FILE UPLOADED
      if (file) {
        const fd = new FormData();
        fd.append("file", file);

        response = await axios.post(
          `${BACKEND_URL}/api/upload-resume`,
          fd,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
      }

      // ⭐ CASE 2 — TEXT ENTERED
      else if (text.trim() !== "") {
        response = await axios.post(
          `${BACKEND_URL}/api/upload-resume`,
          { text },
          {
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      // ⭐ CASE 3 — NOTHING ENTERED
      else {
        setError("Please upload a file or paste resume text.");
        setLoading(false);
        return;
      }

      // ⭐ SUCCESS RESPONSE
      setSkills(response.data.skills || []);
      setMatches(response.data.matches || []);
    } catch (err) {
      console.log(err);
      setError("❌ Request failed — Backend is not running or endpoint is wrong.");
    }

    setLoading(false);
  };

  return (
    <div style={styles.page}>
      <div style={styles.box}>
        <h1>ThinkHire — AI Job Matcher</h1>

        <label>Select Resume File (.txt)</label>
        <input
          type="file"
          accept=".txt"
          onChange={(e) => setFile(e.target.files[0] || null)}
          style={{ marginBottom: 10 }}
        />

        <textarea
          placeholder="Or paste resume text here…"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={5}
          style={styles.textarea}
        />

        <button
          onClick={uploadResume}
          disabled={loading}
          style={styles.button}
        >
          {loading ? "Processing…" : "Upload & Find Jobs"}
        </button>

        {error && <p style={styles.error}>{error}</p>}

        <h3>Extracted Skills:</h3>
        {skills.length > 0 ? (
          <div style={styles.row}>
            {skills.map((s, i) => (
              <span key={i} style={styles.skill}>
                {s}
              </span>
            ))}
          </div>
        ) : (
          <i>No skills yet</i>
        )}

        <h3 style={{ marginTop: 20 }}>Matched Jobs:</h3>

        {matches.length > 0 ? (
          matches.map((job, i) => (
            <div key={i} style={styles.card}>
              <h4>{job.title || "No Title"}</h4>
              <p>{job.company || "Unknown Company"}</p>

              <p>
                <b>Matched:</b>{" "}
                {job.matched_skills?.join(", ") || "None"}
              </p>

              <a
                href={job.url || job.raw?.apply_url}
                target="_blank"
                rel="noreferrer"
                style={styles.apply}
              >
                Apply
              </a>
            </div>
          ))
        ) : (
          <i>No matched jobs yet</i>
        )}
      </div>
    </div>
  );
}

// ⭐ STYLES
const styles = {
  page: {
    padding: 20,
    background: "#f4f4f4",
    minHeight: "100vh",
    fontFamily: "Arial",
  },
  box: {
    maxWidth: 700,
    margin: "auto",
    background: "#fff",
    padding: 20,
    borderRadius: 10,
    boxShadow: "0 3px 12px rgba(0,0,0,0.1)",
  },
  textarea: {
    width: "100%",
    padding: 10,
    borderRadius: 6,
    border: "1px solid #ccc",
    marginBottom: 10,
  },
  button: {
    padding: "10px 15px",
    background: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
    marginBottom: 20,
  },
  error: {
    color: "red",
    fontWeight: "bold",
    marginBottom: 10,
  },
  row: {
    display: "flex",
    gap: 6,
    flexWrap: "wrap",
  },
  skill: {
    background: "#dbeafe",
    padding: "5px 10px",
    borderRadius: 20,
    fontSize: 13,
  },
  card: {
    background: "#fafafa",
    padding: 15,
    borderRadius: 8,
    border: "1px solid #ddd",
    marginBottom: 10,
  },
  apply: {
    display: "inline-block",
    marginTop: 8,
    padding: "6px 12px",
    background: "#10b981",
    color: "white",
    textDecoration: "none",
    borderRadius: 6,
  },
};

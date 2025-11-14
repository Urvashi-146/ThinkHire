import React, { useState, useRef, useEffect } from "react";
import axios from "axios";

const BACKEND_URL = "http://127.0.0.1:5000";

export default function ResumeUpload() {
  const [fileName, setFileName] = useState("No file chosen");
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);

  const dropRef = useRef(null);
  const canvasRef = useRef(null);

  // ⭐ STARS BACKGROUND ANIMATION ⭐
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const stars = Array.from({ length: 100 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 1.5 + 0.5,
    }));

    function animateStars() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "rgba(255,255,255,0.8)";

      stars.forEach((star) => {
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
        star.y += star.size * 0.3;
        if (star.y > canvas.height) star.y = 0;
      });

      requestAnimationFrame(animateStars);
    }

    animateStars();
  }, []);

  // ⭐ FILE HANDLING ⭐
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.endsWith(".pdf") && !file.name.endsWith(".txt")) {
      setError("Only PDF or TXT allowed");
      return;
    }

    setFileName(file.name);
    setError("");
    uploadToBackend(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];

    if (!file) return;

    if (!file.name.endsWith(".pdf") && !file.name.endsWith(".txt")) {
      setError("Only PDF or TXT allowed");
      return;
    }

    setFileName(file.name);
    setError("");
    uploadToBackend(file);
  };

  const uploadToBackend = async (file) => {
    setUploading(true);
    setError("");

    try {
      const fd = new FormData();
      fd.append("file", file);

      const res = await axios.post(
        `${BACKEND_URL}/api/upload-resume`,
        fd,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      console.log("Backend Response:", res.data);
      alert("Upload successful! Check console for output.");
    } catch (err) {
      console.log(err);
      setError("Upload failed. Check backend.");
    }

    setUploading(false);
  };

  return (
    <div style={styles.wrapper}>
      <canvas ref={canvasRef} style={styles.canvas}></canvas>

      <div className="glass-card" style={styles.card}>
        <h2 style={styles.title}>Upload Your Resume</h2>

        <div
          ref={dropRef}
          style={styles.dropArea}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
        >
          <p>Drag & Drop PDF or TXT file</p>
          <p style={{ fontSize: "12px", opacity: 0.8 }}>
            or click the button below
          </p>
        </div>

        <label className="file-btn" style={styles.button}>
          Choose File
          <input
            type="file"
            accept=".pdf,.txt"
            style={{ display: "none" }}
            onChange={handleFileSelect}
          />
        </label>

        <p style={styles.fileName}>{fileName}</p>

        {uploading && <p style={{ color: "#0f0" }}>Uploading...</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}
      </div>
    </div>
  );
}

// ⭐ STYLES ⭐
const styles = {
  wrapper: {
    position: "relative",
    width: "100%",
    height: "100vh",
    background: "#020617",
    overflow: "hidden",
  },
  canvas: {
    position: "absolute",
    top: 0,
    left: 0,
  },
  card: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "360px",
    padding: "25px",
    borderRadius: "15px",
    background: "rgba(255,255,255,0.1)",
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(255,255,255,0.2)",
    boxShadow: "0 0 20px rgba(0,255,255,0.4)",
    textAlign: "center",
    color: "white",
  },
  title: {
    marginBottom: "15px",
    fontSize: "22px",
  },
  dropArea: {
    border: "2px dashed cyan",
    padding: "30px",
    borderRadius: "12px",
    marginBottom: "15px",
    cursor: "pointer",
  },
  button: {
    padding: "10px 20px",
    background: "#00eaff",
    borderRadius: "6px",
    color: "#000",
    fontWeight: "bold",
    cursor: "pointer",
    display: "inline-block",
    marginBottom: "10px",
  },
  fileName: {
    marginTop: "10px",
    fontSize: "14px",
    opacity: 0.8,
  },
};

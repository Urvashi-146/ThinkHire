// frontend/src/components/ResumeUpload.jsx
import React, { useState, useRef } from "react";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://127.0.0.1:5000";

export default function ResumeUpload() {
  const [fileName, setFileName] = useState("No file chosen");
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);

  const fileInputRef = useRef(null);

  const triggerSelect = () => {
    fileInputRef.current.click();
  };

  const handleSelect = (e) => {
    const file = e.target.files[0];
    processFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    processFile(file);
  };

  const processFile = (file) => {
    if (!file) return;
    if (!file.name.endsWith(".pdf") && !file.name.endsWith(".txt")) {
      setError("Only PDF or TXT allowed");
      return;
    }
    setFileName(file.name);
    setError("");
    uploadFile(file);
  };

  const uploadFile = async (file) => {
    setUploading(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await axios.post(`${BACKEND_URL}/api/upload-resume`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      console.log("Backend Response:", res.data);
      alert("Resume uploaded successfully!");
    } catch (err) {
      console.error(err);
      setError("Upload failed. Try again.");
    }
    setUploading(false);
  };

  return (
    <div className="bg">
      <div className="card neon-card upload-only-card">

        <h2 className="title">Upload Your Resume</h2>

        <div
          className="drop neon-drop"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={triggerSelect}
        >
          <div className="drop-inner">
            <div className="cloud">☁</div>
            <div className="drop-text">Drag & Drop File</div>
            <div className="drop-text small">or click to browse</div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.txt"
            onChange={handleSelect}
            style={{ display: "none" }}
          />
        </div>

        <button className="upload-btn" onClick={triggerSelect} disabled={uploading}>
          {uploading ? "Uploading…" : "Choose File"}
        </button>

        <p className="file-info">
          <span className="filename">{fileName}</span>
        </p>

        {error && <div className="error">{error}</div>}
      </div>
    </div>
  );
}

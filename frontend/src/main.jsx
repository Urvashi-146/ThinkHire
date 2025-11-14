import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

// ⭐ Correct CSS import based on your file location
import "./components/index.css";

createRoot(document.getElementById("root")).render(<App />);

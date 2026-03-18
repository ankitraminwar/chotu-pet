import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./popup/popup.css";
import App from "./popup/App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

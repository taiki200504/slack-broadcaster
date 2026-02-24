import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { openUrl } from "@tauri-apps/plugin-opener";
import "./index.css";
import App from "./App";

document.addEventListener("click", (e) => {
  const anchor = (e.target as HTMLElement).closest("a");
  if (anchor && anchor.href && anchor.href.startsWith("http")) {
    e.preventDefault();
    openUrl(anchor.href);
  }
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);

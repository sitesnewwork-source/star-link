import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./i18n";
import { detectAndApplyLanguage } from "./i18n/geoDetect";

detectAndApplyLanguage();

createRoot(document.getElementById("root")!).render(<App />);

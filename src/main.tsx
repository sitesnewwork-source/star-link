import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import App from "./App.tsx";
import "./index.css";
import "./admin-mobile-fix.css";
import "./i18n";
import { detectAndApplyLanguage } from "./i18n/geoDetect";

detectAndApplyLanguage();

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <App />
  </HelmetProvider>
);

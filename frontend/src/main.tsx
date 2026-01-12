import { createRoot } from "react-dom/client";
import { AuthProvider } from "react-oidc-context";
import { oidcConfig } from "./lib/authConfig";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <AuthProvider {...oidcConfig}>
    <App />
  </AuthProvider>
);
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { AuthProvider } from "./auth/AuthProvider.jsx";
import { ThemeProvider } from "./context/ThemeProvider.jsx";
createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <StrictMode>
      <AuthProvider>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </AuthProvider>
    </StrictMode>
  </BrowserRouter>
);
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

console.log("[Main] React app starting...");

const Root = () => {
  const isGenyB = window.location.pathname.startsWith("/genyb");

  if (isGenyB) {
    return <App />;
  }

  return (
    <div style={{ background: "#000", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <img src="/Ingresarios_logo_blanco.png" alt="Ingresarios" style={{ maxWidth: "80%", maxHeight: "80%", objectFit: "contain" }} />
    </div>
  );
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
)

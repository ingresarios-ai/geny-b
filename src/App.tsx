import { useEffect } from "react";

const REDIRECT_URL = "https://genyapp.ingresarios.ai/actualizacion";

export default function App() {
  useEffect(() => {
    window.location.replace(REDIRECT_URL);
  }, []);

  return (
    <div style={{
      background: "#0a0e1a",
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'Segoe UI', system-ui, sans-serif",
      color: "#f0f4ff",
    }}>
      <div style={{
        width: 64, height: 64, borderRadius: 16,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "linear-gradient(135deg, #ffd700, #c5a300)",
        boxShadow: "0 4px 24px #ffd70044",
        fontSize: 29, fontWeight: 900, color: "#0a0e1a",
        marginBottom: 20,
      }}>G</div>
      <div style={{ fontSize: 13, color: "#7b8cad", letterSpacing: 2 }}>REDIRIGIENDO...</div>
    </div>
  );
}

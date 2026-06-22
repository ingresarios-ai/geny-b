import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Registro from './pages/Registro';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/registro" element={<Registro />} />
        {/* Placeholder: redirigir al main app por ahora */}
        <Route path="/app" element={
          <div style={{
            background: '#0a0e1a',
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: "'Segoe UI', system-ui, sans-serif",
            color: '#f0f4ff',
          }}>
            <div style={{
              width: 64, height: 64, borderRadius: 16,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'linear-gradient(135deg, #ffd700, #c5a300)',
              boxShadow: '0 4px 24px #ffd70044',
              fontSize: 29, fontWeight: 900, color: '#0a0e1a',
              marginBottom: 20,
            }}>G</div>
            <h1 style={{ fontSize: 24, fontWeight: 700, margin: '0 0 8px', color: '#FFD700' }}>GENY</h1>
            <p style={{ fontSize: 14, color: '#7b8cad' }}>Bienvenido a la plataforma</p>
          </div>
        } />
        {/* Ruta raíz: splash con logo */}
        <Route path="/" element={
          <div style={{ background: '#000', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img src="/Ingresarios_logo_blanco.png" alt="Ingresarios" style={{ maxWidth: '80%', maxHeight: '80%', objectFit: 'contain' }} />
          </div>
        } />
        {/* Cualquier otra ruta → home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import Registro from './pages/Registro';

const APP_URL = 'https://genyapp.ingresarios.ai/geny';

function ExternalRedirect({ url }: { url: string }) {
  useEffect(() => {
    window.location.href = url;
  }, [url]);

  return (
    <div style={{
      background: '#0a0e1a',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Segoe UI', system-ui, sans-serif",
      color: '#7b8cad',
      fontSize: 14,
    }}>
      Redirigiendo a la plataforma...
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/registro" element={<Registro />} />
        {/* Redirigir /app a la app real */}
        <Route path="/app" element={<ExternalRedirect url={APP_URL} />} />
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

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

(window as any).storage = {
  get: async (key: string, shared: boolean = false) => {
    const val = localStorage.getItem(key);
    return val ? { value: val } : null;
  },
  set: async (key: string, value: string, shared: boolean = false) => {
    localStorage.setItem(key, value);
  },
  delete: async (key: string, shared: boolean = false) => {
    localStorage.removeItem(key);
  }
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Aplicar el tema guardado ANTES del primer render, para que no haya
// parpadeo de tema claro al abrir la app con tema oscuro elegido.
const temaGuardado = localStorage.getItem('portia:tema');
if (temaGuardado === 'dark') {
  document.documentElement.setAttribute('data-theme', 'dark');
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

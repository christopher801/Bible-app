import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './styles/main.css';
import { initStorage } from './services/storageService.js';
import { registerServiceWorker } from './services/pwaService.js';
import { preloadAllPages } from './pages/index.js';
import App from './App.jsx';

initStorage();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);

if (import.meta.env.PROD) {
  registerServiceWorker(() => window.dispatchEvent(new CustomEvent('bible-sw-updated')));
  window.addEventListener('load', preloadAllPages, { once: true });
}

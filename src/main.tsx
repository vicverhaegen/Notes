import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import { polyfill } from 'mobile-drag-drop';
import 'mobile-drag-drop/default.css';

// Enable mobile touch drag-and-drop on iPhone / iPad / Android
polyfill({
  holdToDrag: 200,
});

window.addEventListener('touchmove', () => {}, { passive: false });

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

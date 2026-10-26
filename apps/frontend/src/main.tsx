import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Automatically route relative API and upload requests to backend in production / Render
const rawApiUrl = (import.meta as any).env?.VITE_API_URL as string | undefined;
const backendOrigin = rawApiUrl
  ? rawApiUrl.replace(/\/api\/v1\/?$/, '')
  : window.location.hostname.includes('render.com')
  ? 'https://meshvi.onrender.com'
  : '';

if (backendOrigin) {
  const nativeFetch = window.fetch;
  window.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
    if (typeof input === 'string') {
      if (input.startsWith('/api') || input.startsWith('/uploads')) {
        return nativeFetch(`${backendOrigin}${input}`, init);
      }
    } else if (input instanceof Request) {
      const url = new URL(input.url, window.location.origin);
      if (url.pathname.startsWith('/api') || url.pathname.startsWith('/uploads')) {
        const redirected = new Request(`${backendOrigin}${url.pathname}${url.search}`, input);
        return nativeFetch(redirected, init);
      }
    }
    return nativeFetch(input, init);
  };
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);


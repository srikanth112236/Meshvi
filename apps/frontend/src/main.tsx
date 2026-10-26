import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Automatically route relative API and upload requests to backend in production / Render
const rawApiUrl = (import.meta as any).env?.VITE_API_URL as string | undefined;
let backendOrigin = 'https://meshvi.onrender.com';

if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
  backendOrigin = ''; // Use local Vite proxy during local development
} else if (rawApiUrl && !rawApiUrl.includes('setu-backend')) {
  backendOrigin = rawApiUrl.replace(/\/api\/v1\/?$/, '');
} else {
  backendOrigin = 'https://meshvi.onrender.com';
}

const nativeFetch = window.fetch;
window.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
  if (typeof input === 'string') {
    let targetUrl = input;
    // Replace any legacy or cached setu-backend references
    if (targetUrl.includes('setu-backend.onrender.com')) {
      targetUrl = targetUrl.replace(/https?:\/\/setu-backend\.onrender\.com/, 'https://meshvi.onrender.com');
    }
    if (backendOrigin && (targetUrl.startsWith('/api') || targetUrl.startsWith('/uploads'))) {
      targetUrl = `${backendOrigin}${targetUrl}`;
    }
    return nativeFetch(targetUrl, init);
  } else if (input instanceof Request) {
    let reqUrl = input.url;
    if (reqUrl.includes('setu-backend.onrender.com')) {
      reqUrl = reqUrl.replace(/https?:\/\/setu-backend\.onrender\.com/, 'https://meshvi.onrender.com');
    }
    const parsed = new URL(reqUrl, window.location.origin);
    if (backendOrigin && (parsed.pathname.startsWith('/api') || parsed.pathname.startsWith('/uploads'))) {
      const redirected = new Request(`${backendOrigin}${parsed.pathname}${parsed.search}`, input);
      return nativeFetch(redirected, init);
    }
    return nativeFetch(new Request(reqUrl, input), init);
  }
  return nativeFetch(input, init);
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);


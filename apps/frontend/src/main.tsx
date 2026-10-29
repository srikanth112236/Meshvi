import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Automatically route relative API and upload requests to backend in development / production
const rawApiUrl = (import.meta as any).env?.VITE_API_URL as string | undefined;
let backendOrigin = '';

if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
  // Local development: keep relative URL to use local Vite dev proxy -> http://localhost:3500
  backendOrigin = '';
} else if (typeof window !== 'undefined' && (window.location.hostname === 'meshvi.org' || window.location.hostname.endsWith('meshvi.org'))) {
  // Production Azure custom domain: always route to api.meshvi.org
  backendOrigin = 'https://api.meshvi.org';
} else if (rawApiUrl) {
  backendOrigin = rawApiUrl.replace(/\/api\/v1\/?$/, '').replace(/https?:\/\/setu-backend\.onrender\.com/g, 'https://meshvi.onrender.com');
} else {
  backendOrigin = 'https://api.meshvi.org';
}

const sanitizeUrl = (url: string): string => {
  let target = url;
  if (backendOrigin && (target.startsWith('/api') || target.startsWith('/uploads'))) {
    target = `${backendOrigin}${target}`;
  }
  // Enforce redirection from legacy setu-backend or render host when running on meshvi.org
  if (target.includes('setu-backend.onrender.com')) {
    target = target.replace(/https?:\/\/setu-backend\.onrender\.com/g, 'https://api.meshvi.org');
  }
  if (typeof window !== 'undefined' && (window.location.hostname === 'meshvi.org' || window.location.hostname.endsWith('meshvi.org'))) {
    target = target.replace(/https?:\/\/meshvi\.onrender\.com/g, 'https://api.meshvi.org');
  }
  return target;
};

const nativeFetch = window.fetch;
window.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
  if (typeof input === 'string') {
    return nativeFetch(sanitizeUrl(input), init);
  } else if (input instanceof Request) {
    let reqUrl = sanitizeUrl(input.url);
    const parsed = new URL(reqUrl, window.location.origin);
    const finalUrl = sanitizeUrl(parsed.href);
    return nativeFetch(new Request(finalUrl, input), init);
  }
  return nativeFetch(input, init);
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);


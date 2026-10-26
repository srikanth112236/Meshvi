import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';

export const NetworkStatusPill: React.FC = () => {
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleManualCheck = async () => {
    setChecking(true);
    try {
      const res = await fetch('/api/v1/health/liveness');
      if (res.ok) {
        setIsOnline(true);
      } else {
        setIsOnline(false);
      }
    } catch {
      setIsOnline(false);
    } finally {
      setChecking(false);
    }
  };

  if (isOnline) {
    return (
      <div 
        className="hidden lg:inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50/80 text-emerald-800 border border-emerald-200 shadow-2xs select-none"
        title="Institutional Network Connection Active &bull; Sub-100ms Latency"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        <Wifi className="w-3 h-3 text-emerald-600" />
        <span>Live</span>
      </div>
    );
  }

  return (
    <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-800 border border-rose-300 shadow-sm animate-pulse select-none">
      <WifiOff className="w-3.5 h-3.5 text-rose-600 shrink-0" />
      <span className="text-[11px]">Offline: Reconnecting...</span>
      <button
        type="button"
        onClick={handleManualCheck}
        disabled={checking}
        className="p-0.5 hover:bg-rose-100 rounded text-rose-700 disabled:opacity-50"
        title="Check Connectivity"
      >
        <RefreshCw className={`w-3 h-3 ${checking ? 'animate-spin' : ''}`} />
      </button>
    </div>
  );
};

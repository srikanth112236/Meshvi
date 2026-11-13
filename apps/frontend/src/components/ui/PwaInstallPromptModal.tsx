import React, { useState, useEffect } from 'react';
import {
  Download,
  X,
  Sparkles,
  Monitor,
  Smartphone,
  Share,
  PlusSquare,
  CheckCircle2,
  ShieldCheck,
  Zap,
} from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export const PwaInstallPromptModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    // 1. Check if already installed as standalone PWA
    const isStandalone =
      typeof window !== 'undefined' &&
      (window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true ||
        document.referrer.includes('android-app://') ||
        localStorage.getItem('meshvi_pwa_installed') === 'true');

    if (isStandalone) {
      setInstalled(true);
      return;
    }

    // 2. Detect iOS / iPadOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isAppleMobile = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isAppleMobile);

    // 3. Capture native Chromium install prompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // 4. Listen for successful install event
    const handleAppInstalled = () => {
      localStorage.setItem('meshvi_pwa_installed', 'true');
      setInstalled(true);
      setIsOpen(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    // 5. 15-second polite timer
    const timer = setTimeout(() => {
      // Check if user dismissed recently (7-day polite cooldown)
      const dismissedUntil = localStorage.getItem('meshvi_pwa_dismissed_until');
      if (dismissedUntil && Number(dismissedUntil) > Date.now()) {
        return;
      }

      // Check standalone again
      const currentStandalone =
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true ||
        localStorage.getItem('meshvi_pwa_installed') === 'true';

      if (!currentStandalone) {
        setIsOpen(true);
      }
    }, 15000); // Exactly 15 seconds after opening the application

    return () => {
      clearTimeout(timer);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleDismiss = () => {
    setIsOpen(false);
    // Respect user preference for 7 days
    try {
      const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
      localStorage.setItem('meshvi_pwa_dismissed_until', String(Date.now() + sevenDaysMs));
    } catch {
      // Safe fallback
    }
  };

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice.outcome === 'accepted') {
          localStorage.setItem('meshvi_pwa_installed', 'true');
          setInstalled(true);
          setIsOpen(false);
        } else {
          handleDismiss();
        }
      } catch (err) {
        console.debug('Install prompt error:', err);
        handleDismiss();
      }
    } else {
      // If deferredPrompt is unavailable (e.g. desktop Chrome already consumed it), guide the user
      alert('To install Meshvi on desktop:\n1. Click the Install icon in the right side of your address bar (⊕ or 💻)\n2. Or open browser menu (⋮) -> Select "Install Meshvi"');
      handleDismiss();
    }
  };

  if (!isOpen || installed) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-300">
      <div
        className="w-full max-w-md bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-5 relative overflow-hidden animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Subtle Brand Accent Header Glow */}
        <div className="absolute top-0 right-0 -mr-12 -mt-12 w-44 h-44 rounded-full bg-gradient-to-br from-[#078BCC]/25 to-[#36C4E8]/20 blur-2xl pointer-events-none" />

        {/* Close Button */}
        <button
          type="button"
          onClick={handleDismiss}
          className="absolute top-3.5 right-3.5 p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          title="Dismiss for now"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="space-y-3.5 relative">
          {/* Top Icon & Badge Row */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#102B45] via-[#078BCC] to-[#36C4E8] text-white flex items-center justify-center shrink-0 shadow-md ring-4 ring-sky-50">
              <Download className="w-6 h-6 animate-bounce" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-sky-50 text-[#078BCC] border border-sky-200/80 text-[10px] font-black uppercase tracking-wider mb-1">
                <Sparkles className="w-2.5 h-2.5" />
                <span>Fast Desktop &amp; Mobile Access</span>
              </div>
              <h3 className="text-sm sm:text-base font-extrabold text-[#142B45] leading-snug tracking-tight">
                Add Meshvi to Your Device
              </h3>
            </div>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed">
            Get instant 1-click access to verified executive matchmaking, deal rooms, and live introductions right from your desktop dock or home screen.
          </p>

          {/* Perks Preview Checklist */}
          <div className="bg-slate-50/80 border border-slate-200/80 rounded-xl p-2.5 space-y-2 text-[11px] text-slate-700">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-3 h-3 stroke-[2.5]" />
              </div>
              <span><strong>Instant 1-Click Launch:</strong> Opens in standalone mode with zero browser clutter.</span>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-blue-100 text-[#078BCC] flex items-center justify-center shrink-0">
                <Zap className="w-3 h-3 stroke-[2.5]" />
              </div>
              <span><strong>Lightning Fast Speed:</strong> Precached app shell for offline readiness and rapid navigation.</span>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-3 h-3 stroke-[2.5]" />
              </div>
              <span><strong>Native Responsive UI:</strong> Fully optimized across desktop, tablet, and mobile screens.</span>
            </div>
          </div>

          {/* iOS Specific Instructions if on iPhone / iPad */}
          {isIOS ? (
            <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl text-xs space-y-1.5 text-amber-950">
              <p className="font-bold flex items-center gap-1.5 text-amber-900">
                <Share className="w-3.5 h-3.5" />
                <span>To Install on iOS (Safari):</span>
              </p>
              <ol className="list-decimal list-inside space-y-1 text-[11.5px] text-amber-900/90 pl-1 leading-snug">
                <li>Tap the <strong>Share</strong> icon in your Safari bottom toolbar</li>
                <li>Scroll down and tap <strong className="inline-flex items-center gap-0.5"><PlusSquare className="w-3 h-3 inline text-amber-800" /> Add to Home Screen</strong></li>
              </ol>
            </div>
          ) : null}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
            {!isIOS ? (
              <button
                type="button"
                onClick={handleInstallClick}
                className="w-full sm:flex-1 py-2.5 px-4 bg-[#078BCC] hover:bg-[#0679B2] text-white text-xs font-bold rounded-xl shadow-xs hover:shadow-[#078BCC]/30 transition-all flex items-center justify-center space-x-2 cursor-pointer"
              >
                <Monitor className="w-4 h-4" />
                <span>Install on Desktop / Device</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleDismiss}
                className="w-full sm:flex-1 py-2.5 px-4 bg-[#078BCC] hover:bg-[#0679B2] text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <Smartphone className="w-4 h-4" />
                <span>Got It!</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleDismiss}
              className="w-full sm:w-auto py-2.5 px-4 text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer text-center"
            >
              Maybe Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

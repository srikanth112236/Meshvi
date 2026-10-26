import { Platform, Vibration } from 'react-native';

/**
 * Play a crisp, executive dual-harmonic chime sound with subtle tactile vibration.
 * Zero external native modules needed (100% Expo Go & Web compatible).
 */
export async function playExecutiveNotificationSound(): Promise<void> {
  try {
    // 1. Executive haptic pulse on physical mobile devices (Built into core React Native)
    if (Platform.OS !== 'web') {
      try {
        Vibration.vibrate([0, 30, 45, 30]);
      } catch {
        // Non-fatal
      }
    }

    // 2. Web Audio API synthesis in Web / HTML5 environments
    if (
      typeof window !== 'undefined' &&
      ((window as any).AudioContext || (window as any).webkitAudioContext)
    ) {
      try {
        const AudioCtx = (window as any).AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioCtx();
        if (ctx.state === 'suspended') {
          await ctx.resume();
        }

        const now = ctx.currentTime;

        // Primary tone: E6 (1318.5 Hz)
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(1318.5, now);
        gain1.gain.setValueAtTime(0.24, now);
        gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.48);
        osc1.connect(gain1);
        gain1.connect(ctx.destination);

        // Harmonic shimmer: B6 (1975.5 Hz) delayed by 38ms
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(1975.5, now + 0.038);
        gain2.gain.setValueAtTime(0.0001, now);
        gain2.gain.setValueAtTime(0.18, now + 0.038);
        gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.58);
        osc2.connect(gain2);
        gain2.connect(ctx.destination);

        osc1.start(now);
        osc1.stop(now + 0.5);
        osc2.start(now + 0.038);
        osc2.stop(now + 0.6);
      } catch {
        // Non-fatal if audio context blocked by browser autoplay policy
      }
    }
  } catch {
    // Graceful error ignore
  }
}

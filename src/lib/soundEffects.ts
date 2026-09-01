// Web Audio API native sound generator - No external audio assets needed
let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume().catch(() => {
      // ignore resume failure
    });
  }
  return audioCtx;
}

export const soundManager = {
  isEnabled(): boolean {
    if (typeof window === "undefined") return true;
    const stored = localStorage.getItem("reto_sound_enabled");
    return stored === null ? true : stored === "true";
  },

  setEnabled(enabled: boolean) {
    if (typeof window === "undefined") return;
    localStorage.setItem("reto_sound_enabled", String(enabled));
  },

  playPop() {
    if (!this.isEnabled()) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch (_e) {
      // AudioContext failure gracefully ignored
    }
  },

  playProgress() {
    if (!this.isEnabled()) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.exponentialRampToValueAtTime(659.25, ctx.currentTime + 0.1); // E5

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } catch (_e) {
      // AudioContext failure gracefully ignored
    }
  },

  playChallengeComplete() {
    if (!this.isEnabled()) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.value = freq;

        const startTime = ctx.currentTime + i * 0.06;
        gain.gain.setValueAtTime(0.15, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.25);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.25);
      });
    } catch (_e) {
      // AudioContext failure gracefully ignored
    }
  },

  playDailyVictory() {
    if (!this.isEnabled()) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      // Arpeggio + chord fanfare
      const melody = [
        { note: 523.25, time: 0, dur: 0.12 }, // C5
        { note: 659.25, time: 0.1, dur: 0.12 }, // E5
        { note: 783.99, time: 0.2, dur: 0.15 }, // G5
        { note: 1046.5, time: 0.35, dur: 0.4 }, // C6
      ];

      melody.forEach(({ note, time, dur }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.value = note;

        const startTime = ctx.currentTime + time;
        gain.gain.setValueAtTime(0.2, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + dur);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + dur);
      });
    } catch (_e) {
      // AudioContext failure gracefully ignored
    }
  },

  playAchievement() {
    if (!this.isEnabled()) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const notes = [440, 554.37, 659.25, 880]; // A4, C#5, E5, A5
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.value = freq;

        const startTime = ctx.currentTime + i * 0.08;
        gain.gain.setValueAtTime(0.18, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.35);
      });
    } catch (_e) {
      // AudioContext failure gracefully ignored
    }
  },
};

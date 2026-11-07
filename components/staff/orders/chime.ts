// Two-note chime from Web Audio, so there is no sound file to host or license.
// Must be created from a tap: iOS only lets an AudioContext start on a gesture.
export function makeChime(): (() => void) | null {
  try {
    const context = new AudioContext();
    return () => {
      if (context.state === "suspended") void context.resume();
      const start = context.currentTime;
      [880, 1320].forEach((frequency, i) => {
        const at = start + i * 0.18;
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        oscillator.frequency.value = frequency;
        gain.gain.setValueAtTime(0.0001, at);
        gain.gain.exponentialRampToValueAtTime(0.2, at + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.3);
        oscillator.connect(gain).connect(context.destination);
        oscillator.start(at);
        oscillator.stop(at + 0.3);
      });
    };
  } catch {
    return null;
  }
}

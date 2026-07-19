/**
 * Sonidos cortos de la app, sintetizados con Web Audio (sin archivos).
 * Se deben disparar desde un gesto del usuario (tap) para que el navegador
 * permita reproducir audio.
 */
import { hapticLight, hapticMedium, hapticSuccess } from "./haptics";

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  return ctx;
}

/** Toca una secuencia de notas (Hz) tipo arpegio con envolvente suave. */
function playNotes(freqs: number[], { step = 0.09, dur = 0.28, gain = 0.18 } = {}) {
  const ac = getCtx();
  if (!ac) return;
  if (ac.state === "suspended") ac.resume();
  const now = ac.currentTime;
  freqs.forEach((freq, i) => {
    const osc = ac.createOscillator();
    const g = ac.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    const t = now + i * step;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(gain, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(g).connect(ac.destination);
    osc.start(t);
    osc.stop(t + dur + 0.02);
  });
}

/** Chime ascendente (C5-E5-G5) + vibración: arranque de entrenamiento. */
export function playStartSound() {
  playNotes([523.25, 659.25, 783.99]);
  hapticMedium();
}

/** Tick corto + micro-vibración: serie registrada. */
export function playSetLoggedSound() {
  playNotes([987.77], { step: 0, dur: 0.11, gain: 0.13 });
  hapticLight();
}

/** Arpegio triunfal + vibración marcada: nuevo récord personal (PR). */
export function playPRSound() {
  playNotes([659.25, 880, 1174.66], { step: 0.07, dur: 0.32, gain: 0.2 });
  hapticSuccess();
}

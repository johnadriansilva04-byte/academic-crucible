/**
 * SONS DE RECOMPENSA — sintetizados via WebAudio, sem assets externos.
 * O PlayStation-like "ting" de conquista, o clique de HUD e o colapso de erro.
 */

let ctx: AudioContext | null = null;

function contexto(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

type Nota = {
  freq: number;
  inicio: number;
  duracao: number;
  tipo?: OscillatorType;
  volume?: number;
};

function tocar(notas: Nota[], ganhoGeral = 0.14) {
  const audio = contexto();
  if (!audio) return;
  const agora = audio.currentTime;

  for (const n of notas) {
    const osc = audio.createOscillator();
    const ganho = audio.createGain();
    osc.type = n.tipo ?? "triangle";
    osc.frequency.setValueAtTime(n.freq, agora + n.inicio);
    const volume = (n.volume ?? 1) * ganhoGeral;
    ganho.gain.setValueAtTime(0, agora + n.inicio);
    ganho.gain.linearRampToValueAtTime(volume, agora + n.inicio + 0.012);
    ganho.gain.exponentialRampToValueAtTime(0.0001, agora + n.inicio + n.duracao);
    osc.connect(ganho).connect(audio.destination);
    osc.start(agora + n.inicio);
    osc.stop(agora + n.inicio + n.duracao + 0.05);
  }
}

/** Fanfarra curta de conquista desbloqueada (estilo troféu de console). */
export function somConquista() {
  tocar([
    { freq: 880, inicio: 0, duracao: 0.22, tipo: "sine" },
    { freq: 1174.66, inicio: 0.1, duracao: 0.3, tipo: "sine" },
    { freq: 1567.98, inicio: 0.2, duracao: 0.55, tipo: "sine", volume: 0.9 },
  ]);
}

/** Recompensa de missão: acorde ascendente com brilho. */
export function somRecompensa() {
  tocar([
    { freq: 523.25, inicio: 0, duracao: 0.3 },
    { freq: 659.25, inicio: 0.09, duracao: 0.32 },
    { freq: 783.99, inicio: 0.18, duracao: 0.42 },
    { freq: 1046.5, inicio: 0.27, duracao: 0.7, tipo: "sine", volume: 0.8 },
  ]);
}

/** Interface: clique seco de HUD. */
export function somHud() {
  tocar([{ freq: 1320, inicio: 0, duracao: 0.06, tipo: "square", volume: 0.35 }], 0.08);
}

/** Reprovação: queda dissonante e colapso. */
export function somFalha() {
  tocar(
    [
      { freq: 220, inicio: 0, duracao: 0.45, tipo: "sawtooth", volume: 0.8 },
      { freq: 174.61, inicio: 0.12, duracao: 0.5, tipo: "sawtooth", volume: 0.8 },
      { freq: 110, inicio: 0.28, duracao: 0.9, tipo: "sawtooth", volume: 0.7 },
    ],
    0.09,
  );
}

/** Fuga detectada: sirene de alerta. */
export function somAlerta() {
  tocar([
    { freq: 740, inicio: 0, duracao: 0.16, tipo: "square" },
    { freq: 560, inicio: 0.18, duracao: 0.16, tipo: "square" },
    { freq: 740, inicio: 0.36, duracao: 0.16, tipo: "square" },
    { freq: 560, inicio: 0.54, duracao: 0.24, tipo: "square" },
  ]);
}

/*
 * Tiny Web Audio engine: synthesized UI sounds + a step-sequenced soundtrack.
 * The AudioContext is only created inside a user gesture (see `unlockAudio`),
 * so nothing ever autoplays.
 */
import { create } from 'zustand';

import { TRACKS } from './tracks';

const storage = {
    get(key, fallback) {
        try {
            const v = localStorage.getItem(key);
            return v === null ? fallback : JSON.parse(v);
        } catch {
            return fallback;
        }
    },
    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch {
            /* storage unavailable */
        }
    }
};

export const useAudioStore = create(() => ({
    unlocked: false,
    muted: storage.get('ah-muted', false),
    volume: storage.get('ah-volume', 0.7),
    trackIndex: 0,
    playing: false
}));

let ctx = null;
let master;
let musicBus;
let sfxBus;
let analyser;
let delaySend;
let delayNode;
let noiseBuffer;

const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);

function applyLevels() {
    if (!ctx) return;
    const { muted, volume } = useAudioStore.getState();
    const t = ctx.currentTime;
    master.gain.cancelScheduledValues(t);
    master.gain.setTargetAtTime(muted ? 0 : 1, t, 0.04);
    musicBus.gain.setTargetAtTime(volume * volume * 0.9, t, 0.04);
}

useAudioStore.subscribe((state, prev) => {
    if (state.muted !== prev.muted) storage.set('ah-muted', state.muted);
    if (state.volume !== prev.volume) storage.set('ah-volume', state.volume);
    if (state.muted !== prev.muted || state.volume !== prev.volume) {
        applyLevels();
    }
});

export function unlockAudio() {
    if (!ctx) {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return null;
        ctx = new AC();

        master = ctx.createGain();
        const comp = ctx.createDynamicsCompressor();
        comp.threshold.value = -12;
        comp.ratio.value = 3;
        master.connect(comp);
        comp.connect(ctx.destination);

        musicBus = ctx.createGain();
        analyser = ctx.createAnalyser();
        analyser.fftSize = 64;
        analyser.smoothingTimeConstant = 0.8;
        musicBus.connect(analyser);
        analyser.connect(master);

        sfxBus = ctx.createGain();
        sfxBus.gain.value = 0.55;
        sfxBus.connect(master);

        delaySend = ctx.createGain();
        delayNode = ctx.createDelay(2);
        const feedback = ctx.createGain();
        feedback.gain.value = 0.32;
        const damp = ctx.createBiquadFilter();
        damp.type = 'lowpass';
        damp.frequency.value = 2200;
        delaySend.connect(delayNode);
        delayNode.connect(damp);
        damp.connect(feedback);
        feedback.connect(delayNode);
        damp.connect(musicBus);

        noiseBuffer = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
        const data = noiseBuffer.getChannelData(0);
        for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;

        useAudioStore.setState({ unlocked: true });
        applyLevels();
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
}

export const getAnalyser = () => analyser;

/* ------------------------------------------------------------------ */
/* Voices                                                              */
/* ------------------------------------------------------------------ */

function env(gainNode, t, attack, peak, decay) {
    gainNode.gain.setValueAtTime(0.0001, t);
    gainNode.gain.exponentialRampToValueAtTime(peak, t + attack);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, t + attack + decay);
}

function tone(dest, { type = 'sine', f0, f1, t, dur, peak, attack = 0.005 }) {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(f0, t);
    if (f1) o.frequency.exponentialRampToValueAtTime(f1, t + dur);
    env(g, t, attack, peak, dur);
    o.connect(g);
    g.connect(dest);
    o.start(t);
    o.stop(t + attack + dur + 0.05);
}

function noise(dest, { t, dur, peak, type = 'highpass', freq = 6000, freq1, q = 0.7 }) {
    const src = ctx.createBufferSource();
    src.buffer = noiseBuffer;
    const f = ctx.createBiquadFilter();
    f.type = type;
    f.Q.value = q;
    f.frequency.setValueAtTime(freq, t);
    if (freq1) f.frequency.exponentialRampToValueAtTime(freq1, t + dur);
    const g = ctx.createGain();
    env(g, t, 0.004, peak, dur);
    src.connect(f);
    f.connect(g);
    g.connect(dest);
    src.start(t, Math.random() * 0.5);
    src.stop(t + dur + 0.05);
}

const SFX = {
    hover: (t) =>
        tone(sfxBus, { type: 'sine', f0: 1500, f1: 1900, t, dur: 0.05, peak: 0.05 }),
    click: (t) => {
        tone(sfxBus, { type: 'square', f0: 660, t, dur: 0.04, peak: 0.05 });
        tone(sfxBus, { type: 'square', f0: 990, t: t + 0.045, dur: 0.05, peak: 0.04 });
    },
    open: (t) => {
        noise(sfxBus, { t, dur: 0.38, peak: 0.12, type: 'bandpass', freq: 380, freq1: 2600, q: 1.4 });
        tone(sfxBus, { type: 'sine', f0: 220, f1: 440, t, dur: 0.3, peak: 0.08 });
    },
    close: (t) => {
        noise(sfxBus, { t, dur: 0.32, peak: 0.1, type: 'bandpass', freq: 2400, freq1: 380, q: 1.4 });
        tone(sfxBus, { type: 'sine', f0: 440, f1: 200, t, dur: 0.26, peak: 0.07 });
    },
    power: (t) => {
        tone(sfxBus, { type: 'sine', f0: 90, f1: 38, t, dur: 0.6, peak: 0.35 });
        const f = ctx.createBiquadFilter();
        f.type = 'lowpass';
        f.Q.value = 6;
        f.frequency.setValueAtTime(180, t);
        f.frequency.exponentialRampToValueAtTime(5200, t + 1.1);
        f.frequency.exponentialRampToValueAtTime(900, t + 2.2);
        f.connect(sfxBus);
        [45, 52, 57, 64].forEach((m, i) => {
            ['sawtooth', 'sawtooth'].forEach((type, j) => {
                const o = ctx.createOscillator();
                o.type = type;
                o.frequency.value = mtof(m);
                o.detune.value = j ? 9 : -9;
                const g = ctx.createGain();
                g.gain.setValueAtTime(0.0001, t);
                g.gain.exponentialRampToValueAtTime(0.045, t + 0.25 + i * 0.05);
                g.gain.exponentialRampToValueAtTime(0.0001, t + 2.4);
                o.connect(g);
                g.connect(f);
                o.start(t);
                o.stop(t + 2.5);
            });
        });
    },
    toggle: (t) => {
        tone(sfxBus, { type: 'triangle', f0: 1200, t, dur: 0.03, peak: 0.08 });
        tone(sfxBus, { type: 'triangle', f0: 800, t: t + 0.05, dur: 0.04, peak: 0.06 });
    },
    bounce: (t) => tone(sfxBus, { type: 'square', f0: 440, t, dur: 0.05, peak: 0.05 }),
    brick: (t) =>
        tone(sfxBus, { type: 'square', f0: 880, f1: 1320, t, dur: 0.07, peak: 0.05 }),
    launch: (t) =>
        tone(sfxBus, { type: 'square', f0: 330, f1: 990, t, dur: 0.12, peak: 0.05 }),
    lose: (t) =>
        tone(sfxBus, { type: 'sawtooth', f0: 320, f1: 70, t, dur: 0.55, peak: 0.08 }),
    win: (t) =>
        [72, 76, 79, 84].forEach((m, i) =>
            tone(sfxBus, { type: 'square', f0: mtof(m), t: t + i * 0.09, dur: 0.12, peak: 0.05 })
        )
};

let lastHover = 0;
export function sfx(name) {
    if (!ctx || ctx.state !== 'running' || useAudioStore.getState().muted) return;
    const now = ctx.currentTime;
    if (name === 'hover') {
        if (now - lastHover < 0.08) return;
        lastHover = now;
    }
    SFX[name]?.(now + 0.01);
}

/* ------------------------------------------------------------------ */
/* Sequencer                                                           */
/* ------------------------------------------------------------------ */

let timer = null;
let step = 0;
let nextTime = 0;

const track = () => TRACKS[useAudioStore.getState().trackIndex];
const stepDur = (tr) => 60 / tr.bpm / 4;
const totalSteps = (tr) => tr.bars * 16;

function playKick(t) {
    tone(musicBus, { f0: 140, f1: 42, t, dur: 0.32, peak: 0.85 });
}
function playSnare(t) {
    noise(musicBus, { t, dur: 0.17, peak: 0.28, freq: 1400 });
    tone(musicBus, { type: 'triangle', f0: 200, f1: 150, t, dur: 0.08, peak: 0.12 });
}
function playHat(t, level = 1) {
    noise(musicBus, { t, dur: 0.035, peak: 0.07 * level, freq: 7600 });
}
function playBass(t, midi, dur) {
    const o = ctx.createOscillator();
    o.type = 'sawtooth';
    o.frequency.value = mtof(midi);
    const f = ctx.createBiquadFilter();
    f.type = 'lowpass';
    f.Q.value = 5;
    f.frequency.setValueAtTime(900, t);
    f.frequency.exponentialRampToValueAtTime(240, t + dur);
    const g = ctx.createGain();
    env(g, t, 0.01, 0.22, dur);
    o.connect(f);
    f.connect(g);
    g.connect(musicBus);
    o.start(t);
    o.stop(t + dur + 0.05);
}
function playArp(t, midi, tr) {
    const o = ctx.createOscillator();
    o.type = tr.arpWave;
    o.frequency.value = mtof(midi);
    const f = ctx.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.value = 3200;
    const g = ctx.createGain();
    env(g, t, 0.005, tr.arpLevel, 0.16);
    o.connect(f);
    f.connect(g);
    g.connect(musicBus);
    g.connect(delaySend);
    o.start(t);
    o.stop(t + 0.25);
}
function playPad(t, midis, dur, level) {
    const f = ctx.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.value = 1100;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.03 * level, t + 0.35);
    g.gain.setValueAtTime(0.03 * level, t + dur - 0.2);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.4);
    f.connect(g);
    g.connect(musicBus);
    g.connect(delaySend);
    midis.forEach((m) => {
        [-7, 7].forEach((detune) => {
            const o = ctx.createOscillator();
            o.type = 'sawtooth';
            o.frequency.value = mtof(m);
            o.detune.value = detune;
            o.connect(f);
            o.start(t);
            o.stop(t + dur + 0.5);
        });
    });
}

function playStep(tr, s, t) {
    const i = s % 16;
    const bar = Math.floor(s / 16);
    const chord = tr.chords[bar % tr.chords.length].map((n) => tr.root + n);
    const sd = stepDur(tr);
    // Intro: the first two bars drop drums so tracks breathe in.
    const intro = bar < 2;

    if (i === 0) playPad(t, chord, sd * 16, tr.padLevel);
    if (!intro && tr.kick[i] === 'x') playKick(t);
    if (!intro && tr.snare[i] === 'x') playSnare(t);
    if (tr.hat[i] === 'x') playHat(t, intro ? 0.5 : 1);
    if (!intro && tr.bass[i] === 'x') {
        const octave = i % 4 === 2 ? 0 : -12;
        playBass(t, chord[0] - 12 + octave, sd * 1.6);
    }
    const a = tr.arp[i];
    if (a >= 0) {
        const tones = [...chord, ...chord.map((n) => n + 12)];
        playArp(t, tones[a % tones.length] + 12, tr);
    }
}

function scheduler() {
    const tr = track();
    const sd = stepDur(tr);
    while (nextTime < ctx.currentTime + 0.12) {
        if (step >= totalSteps(tr)) {
            // Let the scheduled tail ring, then advance.
            const delay = Math.max(0, (nextTime - ctx.currentTime) * 1000);
            stopTimer();
            setTimeout(() => musicNext(), delay);
            return;
        }
        const swing = step % 2 === 1 ? tr.swing * sd : 0;
        playStep(tr, step, nextTime + swing);
        nextTime += sd;
        step++;
    }
}

function stopTimer() {
    if (timer) clearInterval(timer);
    timer = null;
}

function startTimer() {
    stopTimer();
    const tr = track();
    delayNode.delayTime.setValueAtTime(stepDur(tr) * 4 * tr.delay, ctx.currentTime);
    nextTime = ctx.currentTime + 0.06;
    timer = setInterval(scheduler, 25);
    scheduler();
}

export function musicPlay(index) {
    if (!unlockAudio()) return;
    if (typeof index === 'number' && index !== useAudioStore.getState().trackIndex) {
        step = 0;
        useAudioStore.setState({ trackIndex: (index + TRACKS.length) % TRACKS.length });
    }
    useAudioStore.setState({ playing: true });
    startTimer();
}

export function musicPause() {
    stopTimer();
    useAudioStore.setState({ playing: false });
}

export function musicToggle() {
    if (useAudioStore.getState().playing) musicPause();
    else musicPlay();
}

export function musicNext() {
    const { trackIndex, playing } = useAudioStore.getState();
    step = 0;
    useAudioStore.setState({ trackIndex: (trackIndex + 1) % TRACKS.length });
    if (playing) musicPlay();
}

export function musicPrev() {
    const { trackIndex, playing } = useAudioStore.getState();
    // Like most players: restart the track unless we're at its very start.
    if (step > 16) {
        step = 0;
    } else {
        step = 0;
        useAudioStore.setState({
            trackIndex: (trackIndex - 1 + TRACKS.length) % TRACKS.length
        });
    }
    if (playing) musicPlay();
}

export function musicSeek(fraction) {
    const tr = track();
    step = Math.max(0, Math.min(totalSteps(tr) - 1, Math.floor(fraction * totalSteps(tr))));
    if (useAudioStore.getState().playing) startTimer();
}

export function musicSelect(index) {
    const { trackIndex, playing } = useAudioStore.getState();
    if (index === trackIndex) {
        musicToggle();
        return;
    }
    step = 0;
    useAudioStore.setState({ trackIndex: index });
    musicPlay();
    if (!playing) sfx('click');
}

export function getProgress() {
    const tr = track();
    const total = totalSteps(tr);
    const sd = stepDur(tr);
    return {
        fraction: Math.min(1, step / total),
        elapsed: step * sd,
        duration: total * sd
    };
}

export const setMuted = (muted) => useAudioStore.setState({ muted });
export const toggleMuted = () =>
    useAudioStore.setState((s) => ({ muted: !s.muted }));
export const setVolume = (volume) =>
    useAudioStore.setState({ volume: Math.max(0, Math.min(1, volume)) });

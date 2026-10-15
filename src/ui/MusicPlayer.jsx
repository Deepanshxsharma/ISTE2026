import { useEffect, useRef, useState } from 'react';

import {
    getAnalyser,
    getProgress,
    musicNext,
    musicPrev,
    musicSeek,
    musicSelect,
    musicToggle,
    setVolume,
    toggleMuted,
    useAudioStore
} from '../audio/engine';
import { TRACKS } from '../audio/tracks';
import { useCameraStore } from '../helper/CameraStore';
import { IconMusic, IconMute, IconNext, IconPause, IconPlay, IconPrev, IconSound } from './icons';

const fmt = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

/** Bottom-right player. Compact by default; expands in the music view or on request. */
export default function MusicPlayer() {
    const playing = useAudioStore((s) => s.playing);
    const trackIndex = useAudioStore((s) => s.trackIndex);
    const volume = useAudioStore((s) => s.volume);
    const muted = useAudioStore((s) => s.muted);
    const inMusicView = useCameraStore((s) => s.cameraState === 'laptop');
    const [open, setOpen] = useState(false);
    const expanded = open || inMusicView;
    const track = TRACKS[trackIndex];

    const progressRef = useRef();
    const elapsedRef = useRef();
    const barsRef = useRef();
    const [duration, setDuration] = useState(() => getProgress().duration);

    useEffect(() => setDuration(getProgress().duration), [trackIndex]);

    // Progress + spectrum, only while something is playing and the panel is visible.
    useEffect(() => {
        let raf = 0;
        const data = new Uint8Array(32);
        const tick = () => {
            const p = getProgress();
            if (progressRef.current) progressRef.current.style.setProperty('--p', `${p.fraction * 100}%`);
            if (elapsedRef.current) elapsedRef.current.textContent = fmt(p.elapsed);
            const analyser = getAnalyser();
            if (analyser && barsRef.current) {
                analyser.getByteFrequencyData(data);
                const bars = barsRef.current.children;
                for (let i = 0; i < bars.length; i++) {
                    bars[i].style.transform = `scaleY(${0.12 + (data[i * 2 + 1] / 255) * 0.88})`;
                }
            }
            if (playing) raf = requestAnimationFrame(tick);
        };
        tick();
        return () => cancelAnimationFrame(raf);
    }, [playing, trackIndex, expanded]);

    const onSeek = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        musicSeek((e.clientX - rect.left) / rect.width);
        const p = getProgress();
        progressRef.current?.style.setProperty('--p', `${p.fraction * 100}%`);
        if (elapsedRef.current) elapsedRef.current.textContent = fmt(p.elapsed);
    };

    const onSeekKey = (e) => {
        const p = getProgress().fraction;
        if (e.key === 'ArrowRight') musicSeek(Math.min(1, p + 0.05));
        else if (e.key === 'ArrowLeft') musicSeek(Math.max(0, p - 0.05));
        else return;
        e.preventDefault();
    };

    return (
        <section
            className={`player ${expanded ? 'is-open' : ''} ${playing ? 'is-playing' : ''}`}
            style={{ '--accent': track.color }}
            aria-label="Music player"
        >
            <div className="player__row">
                <button
                    type="button"
                    className="player__art"
                    onClick={() => setOpen((o) => !o)}
                    aria-expanded={expanded}
                    aria-label={expanded ? 'Collapse music player' : 'Expand music player'}
                    disabled={inMusicView}
                >
                    <span className="player__bars" ref={barsRef} aria-hidden="true">
                        {Array.from({ length: 5 }, (_, i) => (
                            <span key={i} />
                        ))}
                    </span>
                    {!playing && <IconMusic size={16} />}
                </button>
                <div className="player__meta">
                    <p className="player__title">{track.title}</p>
                    <p className="player__artist">
                        {track.artist} · {track.bpm} BPM
                    </p>
                </div>
                <button
                    type="button"
                    className="icon-btn player__play"
                    onClick={musicToggle}
                    aria-label={playing ? 'Pause music' : 'Play music'}
                >
                    {playing ? <IconPause /> : <IconPlay />}
                </button>
            </div>

            {expanded && (
                <div className="player__more">
                    <div className="player__progress">
                        <span ref={elapsedRef} className="player__time">
                            0:00
                        </span>
                        <div
                            ref={progressRef}
                            className="player__track"
                            role="slider"
                            tabIndex={0}
                            aria-label="Seek"
                            aria-valuemin={0}
                            aria-valuemax={100}
                            onClick={onSeek}
                            onKeyDown={onSeekKey}
                        >
                            <span className="player__fill" />
                        </div>
                        <span className="player__time">{fmt(duration)}</span>
                    </div>
                    <div className="player__controls">
                        <button type="button" className="icon-btn" onClick={musicPrev} aria-label="Previous track">
                            <IconPrev />
                        </button>
                        <button type="button" className="icon-btn" onClick={musicNext} aria-label="Next track">
                            <IconNext />
                        </button>
                        <button
                            type="button"
                            className="icon-btn"
                            onClick={toggleMuted}
                            aria-label={muted ? 'Unmute all sound' : 'Mute all sound'}
                            aria-pressed={muted}
                        >
                            {muted ? <IconMute /> : <IconSound />}
                        </button>
                        <input
                            className="player__volume"
                            type="range"
                            min={0}
                            max={1}
                            step={0.01}
                            value={volume}
                            onChange={(e) => setVolume(Number(e.target.value))}
                            aria-label="Music volume"
                            style={{ '--v': `${volume * 100}%` }}
                        />
                    </div>
                    <ol className="player__list" aria-label="Tracks">
                        {TRACKS.map((t, i) => (
                            <li key={t.id}>
                                <button
                                    type="button"
                                    className={i === trackIndex ? 'is-current' : ''}
                                    style={{ '--accent': t.color }}
                                    onClick={() => musicSelect(i)}
                                    aria-current={i === trackIndex ? 'true' : undefined}
                                >
                                    <span>{String(i + 1).padStart(2, '0')}</span>
                                    {t.title}
                                </button>
                            </li>
                        ))}
                    </ol>
                </div>
            )}
        </section>
    );
}

/* eslint-disable react/prop-types */
import { useEffect, useRef, useState } from 'react';

import { sfx, toggleMuted, useAudioStore } from '../audio/engine';
import { MOOD_ORDER, MOODS } from '../config/moods';
import { profile } from '../config/profile';
import { DESTINATIONS, useCameraStore } from '../helper/CameraStore';
import { cycleMood, useRoomStore } from '../helper/RoomStore';
import AboutPanel from './AboutPanel';
import { IconBack, IconClose, IconHelp, IconMute, IconSound } from './icons';
import MusicPlayer from './MusicPlayer';

const PLACE_NAMES = {
    default: 'Overview',
    ...Object.fromEntries(DESTINATIONS.map((d) => [d.id, d.label]))
};

function HoverLabel() {
    const hover = useRoomStore((s) => s.hover);
    const ref = useRef();

    useEffect(() => {
        document.body.style.cursor = hover ? 'pointer' : '';
    }, [hover]);

    useEffect(() => {
        const move = (e) => {
            if (ref.current) ref.current.style.transform = `translate3d(${e.clientX + 18}px, ${e.clientY + 16}px, 0)`;
        };
        window.addEventListener('pointermove', move, { passive: true });
        return () => window.removeEventListener('pointermove', move);
    }, []);

    return (
        <div ref={ref} className={`hover-label ${hover ? 'is-on' : ''}`} aria-hidden="true">
            {hover && (
                <>
                    <span className="hover-label__name">{hover.label}</span>
                    {hover.hint && <span className="hover-label__hint">{hover.hint}</span>}
                </>
            )}
        </div>
    );
}

function MoodDial() {
    const mood = useRoomStore((s) => s.mood);
    const setMood = useRoomStore((s) => s.setMood);
    const transitioning = useRoomStore((s) => s.moodTransitioning);
    return (
        <div className={`mood ${transitioning ? 'is-busy' : ''}`} role="radiogroup" aria-label="Room mood (L to cycle)">
            {MOOD_ORDER.map((id) => (
                <button
                    key={id}
                    type="button"
                    role="radio"
                    aria-checked={mood === id}
                    className={`mood__btn mood__btn--${id} ${mood === id ? 'is-on' : ''}`}
                    onClick={() => {
                        sfx('toggle');
                        setMood(id);
                    }}
                    title={MOODS[id].description}
                >
                    <span className="mood__dot" aria-hidden="true" />
                    <span className="mood__label">{MOODS[id].short}</span>
                </button>
            ))}
        </div>
    );
}

function MoodToast() {
    const mood = useRoomStore((s) => s.mood);
    const [shown, setShown] = useState(null);
    const first = useRef(true);
    useEffect(() => {
        if (first.current || mood === 'off') {
            first.current = mood === 'off';
            return;
        }
        setShown(mood);
        const id = setTimeout(() => setShown(null), 2400);
        return () => clearTimeout(id);
    }, [mood]);
    return (
        <div className={`toast ${shown ? 'is-on' : ''}`} role="status" aria-live="polite">
            {shown && (
                <>
                    <span className="toast__k">Mood</span>
                    <span className="toast__v">{MOODS[shown].label}</span>
                </>
            )}
        </div>
    );
}

function Help({ onClose }) {
    const coarse = useRoomStore((s) => s.coarsePointer);
    const rows = coarse
        ? [
              ['Drag', 'Orbit the room'],
              ['Pinch', 'Zoom'],
              ['Tap a label', 'Visit an object']
          ]
        : [
              ['Drag', 'Orbit the room'],
              ['Scroll', 'Zoom'],
              ['Right-drag', 'Pan'],
              ['Click', 'Visit a glowing object'],
              ['1 – 6', 'Jump to a place'],
              ['L', 'Cycle the room lights'],
              ['M', 'Mute / unmute'],
              ['Esc', 'Back to the overview']
          ];
    return (
        <div className="help" role="dialog" aria-label="Controls">
            <div className="help__head">
                <p>Controls</p>
                <button type="button" className="icon-btn" onClick={onClose} aria-label="Close controls">
                    <IconClose size={16} />
                </button>
            </div>
            <dl>
                {rows.map(([k, v]) => (
                    <div key={k}>
                        <dt>
                            <kbd>{k}</kbd>
                        </dt>
                        <dd>{v}</dd>
                    </div>
                ))}
            </dl>
        </div>
    );
}

export default function Hud() {
    const entered = useRoomStore((s) => s.entered);
    const cameraState = useCameraStore((s) => s.cameraState);
    const go = useCameraStore((s) => s.go);
    const muted = useAudioStore((s) => s.muted);
    const [help, setHelp] = useState(false);

    useEffect(() => {
        if (!entered) return;
        const onKey = (e) => {
            if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey) return;
            const tag = e.target?.tagName;
            if (tag === 'INPUT' || tag === 'TEXTAREA') return;
            const state = useCameraStore.getState().cameraState;
            if (e.key === 'Escape') {
                if (help) setHelp(false);
                else if (state !== 'default') go('default');
                return;
            }
            // Arcade keys belong to the game.
            if (state === 'tv') return;
            const dest = DESTINATIONS.find((d) => d.key === e.key);
            if (dest) go(state === dest.id ? 'default' : dest.id);
            else if (e.key === 'l' || e.key === 'L') {
                sfx('toggle');
                cycleMood();
            } else if (e.key === 'm' || e.key === 'M') toggleMuted();
            else if (e.key === '?') setHelp((h) => !h);
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [entered, go, help]);

    return (
        <div className={`hud ${entered ? 'is-on' : ''}`} inert={entered ? undefined : ''}>
            <HoverLabel />
            <MoodToast />

            <header className="hud__top">
                <div className="brand">
                    <span className="brand__mark" aria-hidden="true" />
                    <span className="brand__name">{profile.handle}</span>
                    <span className="brand__place" aria-live="polite">
                        {PLACE_NAMES[cameraState]}
                    </span>
                </div>
                <div className="hud__tools">
                    <MoodDial />
                    <button
                        type="button"
                        className="icon-btn icon-btn--framed"
                        onClick={toggleMuted}
                        aria-label={muted ? 'Unmute sound (M)' : 'Mute sound (M)'}
                        aria-pressed={muted}
                    >
                        {muted ? <IconMute /> : <IconSound />}
                    </button>
                    <button
                        type="button"
                        className="icon-btn icon-btn--framed"
                        onClick={() => setHelp((h) => !h)}
                        aria-label="Show controls"
                        aria-expanded={help}
                    >
                        <IconHelp />
                    </button>
                </div>
            </header>
            {help && <Help onClose={() => setHelp(false)} />}
            <AboutPanel />

            <nav className="hud__nav" aria-label="Places in the room">
                {cameraState !== 'default' ? (
                    <button type="button" className="back" onClick={() => go('default')}>
                        <IconBack />
                        <span>Back to room</span>
                        <kbd>Esc</kbd>
                    </button>
                ) : null}
                <ul className="places">
                    {DESTINATIONS.map((d) => (
                        <li key={d.id}>
                            <button
                                type="button"
                                className={`place ${cameraState === d.id ? 'is-on' : ''}`}
                                aria-current={cameraState === d.id ? 'location' : undefined}
                                onClick={() => go(d.id)}
                                onPointerEnter={() => sfx('hover')}
                            >
                                <kbd>{d.key}</kbd>
                                <span>{d.label}</span>
                            </button>
                        </li>
                    ))}
                </ul>
            </nav>

            <MusicPlayer />
        </div>
    );
}

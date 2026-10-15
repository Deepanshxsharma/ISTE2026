import { useProgress } from '@react-three/drei';
import { useEffect, useRef, useState } from 'react';

import { setMuted, unlockAudio, useAudioStore } from '../audio/engine';
import { profile } from '../config/profile';
import { useRoomStore } from '../helper/RoomStore';
import { IconMute, IconSound } from './icons';

export default function Intro() {
    const entered = useRoomStore((s) => s.entered);
    const sceneReady = useRoomStore((s) => s.sceneReady);
    const coarse = useRoomStore((s) => s.coarsePointer);
    const reduced = useRoomStore((s) => s.reducedMotion);
    const muted = useAudioStore((s) => s.muted);
    const { progress } = useProgress();
    const [gone, setGone] = useState(false);
    const enterBtn = useRef();

    useEffect(() => {
        if (sceneReady) enterBtn.current?.focus({ preventScroll: true });
    }, [sceneReady]);

    useEffect(() => {
        if (!entered) return;
        const id = setTimeout(() => setGone(true), reduced ? 200 : 1100);
        return () => clearTimeout(id);
    }, [entered, reduced]);

    if (gone) return null;

    const enter = () => {
        if (!sceneReady || entered) return;
        // This click is the user gesture that's allowed to start audio.
        if (!muted) unlockAudio();
        useRoomStore.getState().enter();
        setTimeout(() => useRoomStore.getState().setMood(profile.defaultMood), reduced ? 0 : 650);
    };

    const pct = Math.round(sceneReady ? 100 : Math.min(progress, 99));
    const hints = coarse
        ? [
              ['Drag', 'orbit'],
              ['Pinch', 'zoom'],
              ['Tap', 'glowing labels']
          ]
        : [
              ['Drag', 'orbit'],
              ['Scroll', 'zoom'],
              ['Right-drag', 'pan'],
              ['Click', 'glowing objects'],
              ['1–6', 'jump'],
              ['Esc', 'back']
          ];

    return (
        <div className={`intro ${entered ? 'is-leaving' : ''}`} role="dialog" aria-modal="true" aria-labelledby="intro-title">
            <div className="intro__veil" aria-hidden="true" />
            <div className="intro__inner">
                <p className="intro__kicker">
                    <span className="intro__pip" aria-hidden="true" />
                    {profile.kicker}
                </p>
                <h1 id="intro-title" className="intro__title" data-text={profile.handle}>
                    {profile.handle}
                </h1>
                <p className="intro__sub">{profile.title}</p>
                <p className="intro__headline">{profile.headline}</p>
                <p className="intro__tagline">{profile.intro}</p>

                <div className="intro__actions">
                    <button
                        ref={enterBtn}
                        type="button"
                        className="intro__enter"
                        onClick={enter}
                        disabled={!sceneReady}
                        aria-describedby="intro-status"
                    >
                        <span className="intro__enter-label">{sceneReady ? 'Enter my room' : 'Warming up'}</span>
                        <span className="intro__enter-meter" style={{ '--p': `${pct}%` }} aria-hidden="true" />
                    </button>
                    <button
                        type="button"
                        className={`intro__sound ${muted ? '' : 'is-on'}`}
                        onClick={() => setMuted(!muted)}
                        aria-pressed={!muted}
                    >
                        {muted ? <IconMute /> : <IconSound />}
                        <span>{muted ? 'Sound off' : 'Sound on'}</span>
                    </button>
                </div>
                <p id="intro-status" className="intro__status" aria-live="polite">
                    {sceneReady ? 'Room ready.' : `Loading room · ${pct}%`}
                </p>

                <ul className="intro__hints" aria-label="Controls">
                    {hints.map(([k, v]) => (
                        <li key={k}>
                            <kbd>{k}</kbd>
                            <span>{v}</span>
                        </li>
                    ))}
                </ul>
            </div>
            <p className="intro__credit">
                Designed and built by {profile.name} · 3D room from{' '}
                <a href="https://github.com/AT010303/Room_Portfolio" target="_blank" rel="noreferrer">
                    Room Portfolio
                </a>{' '}
                by Ashutosh Tripathi
            </p>
        </div>
    );
}

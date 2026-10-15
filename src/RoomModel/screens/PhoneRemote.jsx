/* eslint-disable react/display-name */
import { Html } from '@react-three/drei';
import React, { useEffect, useState } from 'react';

import { musicNext, musicPrev, musicToggle, useAudioStore } from '../../audio/engine';
import { TRACKS } from '../../audio/tracks';
import { MOOD_ORDER, MOODS } from '../../config/moods';
import { profile } from '../../config/profile';
import { destination, useCameraStore } from '../../helper/CameraStore';
import { useRoomStore } from '../../helper/RoomStore';
import ContactList from '../../ui/ContactList';
import ScreenShell from './ScreenShell';

const JUMPS = ['about', 'desktop', 'displayBoard', 'tv'];

function Remote() {
    const [time, setTime] = useState(() => new Date());
    useEffect(() => {
        const id = setInterval(() => setTime(new Date()), 15000);
        return () => clearInterval(id);
    }, []);
    const mood = useRoomStore((s) => s.mood);
    const setMood = useRoomStore((s) => s.setMood);
    const playing = useAudioStore((s) => s.playing);
    const track = TRACKS[useAudioStore((s) => s.trackIndex)];
    const go = useCameraStore((s) => s.go);

    return (
        <ScreenShell className="phone" width={392} height={809} label="Phone room remote">
            <div className="phone__status">
                <span>{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                <span className="phone__notch" aria-hidden="true" />
                <span>{profile.initials}</span>
            </div>
            <h2 className="phone__title">Say hello</h2>
            <section className="phone__card phone__card--contact">
                <p className="phone__label">{profile.name}</p>
                <ContactList className="phone__contacts" keyClass="phone__contact-k" linkClass="phone__link" />
            </section>

            <section className="phone__card">
                <p className="phone__label">Room lights</p>
                <div className="phone__seg" role="radiogroup" aria-label="Room mood">
                    {MOOD_ORDER.map((id) => (
                        <button
                            key={id}
                            type="button"
                            role="radio"
                            aria-checked={mood === id}
                            className={`phone__segbtn phone__segbtn--${id} ${mood === id ? 'is-on' : ''}`}
                            onClick={() => setMood(id)}
                        >
                            {MOODS[id].label}
                        </button>
                    ))}
                </div>
            </section>

            <section className="phone__card" style={{ '--accent': track.color }}>
                <p className="phone__label">{playing ? 'Now playing' : 'Radio'}</p>
                <p className="phone__track">{track.title}</p>
                <p className="phone__artist">
                    {track.artist} · {track.bpm} BPM
                </p>
                <div className="phone__transport">
                    <button type="button" onClick={musicPrev} aria-label="Previous track">
                        ⏮
                    </button>
                    <button type="button" className="is-main" onClick={musicToggle} aria-label={playing ? 'Pause' : 'Play'}>
                        {playing ? '❚❚' : '▶'}
                    </button>
                    <button type="button" onClick={musicNext} aria-label="Next track">
                        ⏭
                    </button>
                </div>
            </section>

            <section className="phone__card">
                <p className="phone__label">Jump to</p>
                <div className="phone__grid">
                    {JUMPS.map((id) => (
                        <button key={id} type="button" onClick={() => go(id)}>
                            {destination(id).label}
                        </button>
                    ))}
                </div>
            </section>

            <button type="button" className="phone__home" onClick={() => go('default')}>
                Back to room
            </button>
        </ScreenShell>
    );
}

const PhoneRemote = React.memo(() => {
    const isPhone = useCameraStore((s) => s.cameraState === 'smartphone');
    if (!isPhone) return null;
    return (
        <Html
            occlude="blending"
            rotation-y={Math.PI}
            rotation-x={Math.PI / 2}
            rotation-z={-Math.PI / 6}
            transform
            wrapperClass="htmlPhoneScreen"
            distanceFactor={0.285}
            position={[1.6395, 1.125, -1.373]}
            zIndexRange={[2, 1]}
        >
            <Remote />
        </Html>
    );
});

export default PhoneRemote;

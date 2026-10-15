import { useFrame } from '@react-three/fiber';
import { gsap } from 'gsap';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';

import { sfx } from '../../audio/engine';
import { MOODS } from '../../config/moods';
import { useRoomStore } from '../../helper/RoomStore';
import { moodTargets, moodUniforms, settleWave, writeMood } from './moodUniforms';

const WAVE_DISTANCE = 34;
const WAVE_DURATION = 2.6;

/** Drives the signature "light wave" whenever the requested mood changes. */
export default function MoodController() {
    const mood = useRoomStore((s) => s.mood);
    const timeline = useRef(null);
    const isFirst = useRef(true);

    useEffect(() => {
        const target = MOODS[mood];
        const reduced = useRoomStore.getState().reducedMotion;

        // A new request finishes the previous wave instantly, then starts fresh.
        if (timeline.current) {
            timeline.current.progress(1);
            timeline.current.kill();
        }

        document.documentElement.dataset.mood = mood;

        writeMood('To', mood);
        moodUniforms.uWaveColor.value.set(target.waveColor || '#41f3ff');

        if (moodTargets.switchObject) {
            moodTargets.switchObject.getWorldPosition(moodUniforms.uWaveOrigin.value);
        }

        const finish = () => {
            writeMood('From', mood);
            settleWave();
            useRoomStore.setState({ moodTransitioning: false });
        };

        const windowColor = moodTargets.windowMaterial?.color;
        const bloom = moodTargets.bloom;

        if (isFirst.current) {
            isFirst.current = false;
            finish();
            if (windowColor) windowColor.setRGB(...target.window);
            if (bloom) bloom.intensity = target.bloom;
            moodUniforms.uGridAmount.value = target.grid;
            return;
        }

        const duration = reduced ? 0.35 : WAVE_DURATION;
        useRoomStore.setState({ moodTransitioning: true });
        if (mood !== 'off') sfx('power');

        const tl = gsap.timeline({ onComplete: finish });
        timeline.current = tl;

        if (reduced) {
            moodUniforms.uWaveRadius.value = WAVE_DISTANCE;
            moodUniforms.uWaveStrength.value = 0;
        } else {
            moodUniforms.uWaveRadius.value = 0;
            tl.to(moodUniforms.uWaveRadius, { value: WAVE_DISTANCE, duration, ease: 'power1.in' }, 0);
            tl.fromTo(
                moodUniforms.uWaveStrength,
                { value: 0 },
                { value: 1, duration: 0.25, ease: 'power2.out' },
                0
            );
            tl.to(
                moodUniforms.uWaveStrength,
                { value: 0, duration: duration * 0.45, ease: 'power2.in' },
                duration * 0.55
            );
            // Bloom swells as the wave passes, then settles on the mood's level.
            if (bloom) {
                tl.to(bloom, { intensity: target.bloom + 0.9, duration: duration * 0.3, ease: 'power2.out' }, 0);
                tl.to(bloom, { intensity: target.bloom, duration: duration * 0.6, ease: 'power2.inOut' }, duration * 0.35);
            }
        }

        if (reduced && bloom) tl.to(bloom, { intensity: target.bloom, duration }, 0);
        if (windowColor) {
            const c = new THREE.Color(...target.window);
            tl.to(windowColor, { r: c.r, g: c.g, b: c.b, duration: duration * 0.5, ease: 'power1.inOut' }, duration * 0.15);
        }
        tl.to(moodUniforms.uGridAmount, { value: target.grid, duration: duration * 0.8 }, duration * 0.2);
    }, [mood]);

    useEffect(() => () => timeline.current?.kill(), []);

    useFrame((_, delta) => {
        moodUniforms.uTime.value += delta;
    });

    return null;
}

import * as THREE from 'three';

import { MOODS } from '../../config/moods';

const SETTLED_RADIUS = 1000;

const stateUniforms = (prefix) => ({
    [`u${prefix}NightMix`]: { value: 1 },
    [`u${prefix}Exposure`]: { value: 1 },
    [`u${prefix}Tint`]: { value: new THREE.Color('#ffffff') },
    [`u${prefix}TintAmount`]: { value: 0 },
    [`u${prefix}BoardColor`]: { value: new THREE.Color('#ffffff') },
    [`u${prefix}BoardStrength`]: { value: 0 },
    [`u${prefix}DeskColor`]: { value: new THREE.Color('#ffffff') },
    [`u${prefix}DeskStrength`]: { value: 0 },
    [`u${prefix}PcColor`]: { value: new THREE.Color('#ffffff') },
    [`u${prefix}PcStrength`]: { value: 0 }
});

/** Uniform objects shared by every baked material, so one tween drives the whole room. */
export const moodUniforms = {
    ...stateUniforms('From'),
    ...stateUniforms('To'),
    uWaveOrigin: { value: new THREE.Vector3() },
    uWaveRadius: { value: SETTLED_RADIUS },
    uWaveWidth: { value: 0.45 },
    uWaveStrength: { value: 0 },
    uWaveColor: { value: new THREE.Color('#41f3ff') },
    uGridAmount: { value: 0 },
    uTime: { value: 0 }
};

export function writeMood(prefix, mood) {
    const m = MOODS[mood];
    const u = moodUniforms;
    u[`u${prefix}NightMix`].value = m.nightMix;
    u[`u${prefix}Exposure`].value = m.exposure;
    u[`u${prefix}Tint`].value.set(m.tint);
    u[`u${prefix}TintAmount`].value = m.tintAmount;
    u[`u${prefix}BoardColor`].value.set(m.board[0]);
    u[`u${prefix}BoardStrength`].value = m.board[1];
    u[`u${prefix}DeskColor`].value.set(m.desk[0]);
    u[`u${prefix}DeskStrength`].value = m.desk[1];
    u[`u${prefix}PcColor`].value.set(m.pc[0]);
    u[`u${prefix}PcStrength`].value = m.pc[1];
}

export function settleWave() {
    moodUniforms.uWaveRadius.value = SETTLED_RADIUS;
    moodUniforms.uWaveStrength.value = 0;
}

writeMood('From', 'off');
writeMood('To', 'off');

/** Imperative handles the mood controller animates (registered by scene components). */
export const moodTargets = {
    bloom: null,
    windowMaterial: null,
    switchObject: null
};

/* eslint-disable react-refresh/only-export-components */
import { create } from 'zustand';

import { sfx } from '../audio/engine';

/** Places in the room, in story order. `object` names the thing you click in 3D. */
export const DESTINATIONS = [
    { id: 'about', label: 'About', object: 'Photo frame', hint: 'Who I am and what I’m building', key: '1' },
    { id: 'desktop', label: 'Projects', object: 'Computer', hint: 'Every project, with details', key: '2' },
    { id: 'displayBoard', label: 'Work wall', object: 'Pin board', hint: 'Featured work at a glance', key: '3' },
    { id: 'smartphone', label: 'Contact', object: 'Phone', hint: 'Get in touch · room remote', key: '4' },
    { id: 'laptop', label: 'Radio', object: 'Laptop', hint: 'Five original synth tracks', key: '5' },
    { id: 'tv', label: 'Arcade', object: 'TV', hint: 'Play Neon Breaker', key: '6' }
];

export const destination = (id) => DESTINATIONS.find((d) => d.id === id);

export const useCameraStore = create((set, get) => {
    const go = (next) => {
        const prev = get().cameraState;
        if (prev === next) return;
        if (next === 'default') sfx('close');
        else sfx('open');
        set({ cameraState: next });
    };

    return {
        cameraState: 'default',
        go,

        default: () => go('default'),
        about: () => go('about'),
        desktop: () => go('desktop'),
        laptop: () => go('laptop'),
        tv: () => go('tv'),
        smartphone: () => go('smartphone'),
        displayBoard: () => go('displayBoard')
    };
});

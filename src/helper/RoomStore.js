import { create } from 'zustand';

import { MOOD_ORDER } from '../config/moods';

const reducedMotionQuery =
    typeof window !== 'undefined' && window.matchMedia
        ? window.matchMedia('(prefers-reduced-motion: reduce)')
        : null;

const coarsePointerQuery =
    typeof window !== 'undefined' && window.matchMedia
        ? window.matchMedia('(pointer: coarse)')
        : null;

export const useRoomStore = create((set) => ({
    // All 3D assets have loaded and the scene has rendered.
    sceneReady: false,
    entered: false,
    enter: () => set({ entered: true }),

    // Requested lighting mood; the scene animates towards it.
    mood: 'off',
    setMood: (mood) => set({ mood }),
    // True while the light wave is travelling through the room.
    moodTransitioning: false,

    // Object currently under the pointer: { label, hint }
    hover: null,
    setHover: (hover) => set({ hover }),

    reducedMotion: reducedMotionQuery ? reducedMotionQuery.matches : false,
    coarsePointer: coarsePointerQuery ? coarsePointerQuery.matches : false
}));

export function cycleMood() {
    const { mood, setMood } = useRoomStore.getState();
    const i = MOOD_ORDER.indexOf(mood);
    setMood(MOOD_ORDER[(i + 1) % MOOD_ORDER.length]);
}

reducedMotionQuery?.addEventListener?.('change', (e) =>
    useRoomStore.setState({ reducedMotion: e.matches })
);
coarsePointerQuery?.addEventListener?.('change', (e) =>
    useRoomStore.setState({ coarsePointer: e.matches })
);

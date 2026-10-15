/*
 * Lighting moods for the room shader. Each light colour drives one channel
 * of the baked light map: board = red, desk = green, pc = blue.
 */

export const MOODS = {
    off: {
        label: 'Standby',
        nightMix: 1,
        exposure: 0.07,
        tint: '#0b1236',
        tintAmount: 0.7,
        board: ['#ff2bd6', 0],
        desk: ['#7b5cff', 0],
        pc: ['#00e5ff', 0],
        window: [0.08, 0.1, 0.25],
        bloom: 0.4,
        grid: 0.15
    },
    day: {
        label: 'Sunlit',
        short: 'DAY',
        description: 'Warm afternoon light, the room as it was first built.',
        nightMix: 0,
        exposure: 1,
        tint: '#ffffff',
        tintAmount: 0,
        board: ['#ff2d88', 1.35],
        desk: ['#ff7236', 1.55],
        pc: ['#4b7eff', 1.2],
        window: [2, 0.8, 0.5],
        bloom: 0.75,
        grid: 0.2,
        waveColor: '#ffb36b'
    },
    night: {
        label: 'Midnight',
        short: 'NIGHT',
        description: 'Midnight blue, a cyan screen glow and a warm desk lamp.',
        nightMix: 1,
        exposure: 0.74,
        tint: '#1f2b66',
        tintAmount: 0.26,
        board: ['#9a6bff', 0.95],
        desk: ['#ffa45c', 1.45],
        pc: ['#3fd8ff', 1.3],
        window: [0.55, 0.75, 2.6],
        bloom: 0.8,
        grid: 0.35,
        waveColor: '#41f3ff'
    },
    overdrive: {
        label: 'Overdrive',
        short: 'NEON',
        description: 'Full cyberpunk: cyan, violet and magenta take over.',
        nightMix: 1,
        exposure: 0.4,
        tint: '#2a2470',
        tintAmount: 0.55,
        board: ['#ff2bd6', 1.25],
        desk: ['#7b4dff', 1.1],
        pc: ['#00e5ff', 1.45],
        window: [1.4, 0.35, 2.6],
        bloom: 1.25,
        grid: 1,
        waveColor: '#41f3ff'
    }
};

export const MOOD_ORDER = ['day', 'night', 'overdrive'];

/*
 * Original procedural soundtrack for AFTER HOURS.
 * Chords are semitone offsets from `root` (MIDI). Patterns are one bar of 16th notes:
 * drums use 'x' = hit; arp lists indices into the chord tones (+ octave), -1 = rest.
 */

export const TRACKS = [
    {
        id: 'midnight-grid',
        title: 'Midnight Grid',
        artist: 'After Hours OST',
        color: '#41f3ff',
        bpm: 100,
        bars: 32,
        swing: 0,
        root: 57,
        chords: [
            [0, 3, 7],
            [-4, 0, 3],
            [3, 7, 10],
            [-2, 2, 5]
        ],
        arp: [0, 2, 4, 2, 1, 3, 5, 3, 0, 2, 4, 2, 1, 3, 5, 3],
        arpWave: 'square',
        arpLevel: 0.05,
        bass: 'x.x.x.x.x.x.x.x.',
        kick: 'x...x...x...x...',
        snare: '....x.......x...',
        hat: '..x...x...x...x.',
        padLevel: 1,
        delay: 0.75
    },
    {
        id: 'neon-arcade',
        title: 'Neon Arcade',
        artist: 'After Hours OST',
        color: '#ff2bd6',
        bpm: 124,
        bars: 40,
        swing: 0,
        root: 52,
        chords: [
            [0, 3, 7],
            [-4, 0, 3],
            [3, 7, 10],
            [-2, 2, 5]
        ],
        arp: [0, 1, 2, 3, 4, 3, 2, 1, 0, 1, 2, 3, 5, 4, 3, 2],
        arpWave: 'square',
        arpLevel: 0.045,
        bass: 'x.xx.xx.x.xx.xx.',
        kick: 'x...x...x...x...',
        snare: '....x.......x...',
        hat: 'xxx.xxx.xxx.xxx.',
        padLevel: 0.7,
        delay: 0.75
    },
    {
        id: 'lofi-terminal',
        title: 'Lo-Fi Terminal',
        artist: 'After Hours OST',
        color: '#8a5bff',
        bpm: 78,
        bars: 24,
        swing: 0.2,
        root: 50,
        chords: [
            [0, 3, 7, 10],
            [-7, -4, 0, 3],
            [3, 7, 10, 14],
            [-5, -1, 2, 5]
        ],
        arp: [0, -1, 2, -1, 3, -1, 1, -1, 4, -1, 2, -1, 6, -1, 5, -1],
        arpWave: 'triangle',
        arpLevel: 0.07,
        bass: 'x.....x...x.....',
        kick: 'x.....x...x.....',
        snare: '....x.......x...',
        hat: 'x.x.x.x.x.x.x.x.',
        padLevel: 1.2,
        delay: 0.5
    },
    {
        id: 'pixel-rain',
        title: 'Pixel Rain',
        artist: 'After Hours OST',
        color: '#7dffb2',
        bpm: 110,
        bars: 32,
        swing: 0,
        root: 55,
        chords: [
            [0, 4, 7],
            [-3, 0, 4],
            [-7, -3, 0],
            [-5, -1, 2]
        ],
        arp: [0, 1, 2, 3, 4, 5, 4, 3, 0, 1, 2, 3, 4, 5, 4, 3],
        arpWave: 'triangle',
        arpLevel: 0.075,
        bass: 'x...x.x.x...x.x.',
        kick: 'x.......x.x.....',
        snare: '....x.......x...',
        hat: '..x...x...x...xx',
        padLevel: 0.9,
        delay: 0.75
    },
    {
        id: 'afterglow',
        title: 'Afterglow',
        artist: 'After Hours OST',
        color: '#ffb36b',
        bpm: 88,
        bars: 24,
        swing: 0.1,
        root: 53,
        chords: [
            [0, 4, 7, 11],
            [4, 7, 11, 14],
            [-3, 0, 4, 7],
            [5, 9, 12, 16]
        ],
        arp: [0, -1, -1, 2, -1, -1, 4, -1, 6, -1, -1, 4, -1, -1, 2, -1],
        arpWave: 'sine',
        arpLevel: 0.09,
        bass: 'x.......x.......',
        kick: 'x.........x.....',
        snare: '........x.......',
        hat: '....x.......x...',
        padLevel: 1.4,
        delay: 0.75
    }
];

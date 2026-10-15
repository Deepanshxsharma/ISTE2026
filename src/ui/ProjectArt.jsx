/* eslint-disable react/prop-types */

/*
 * Original, abstract illustrations for each project (no screenshots or stock art).
 * All share a 320×200 viewBox and the site palette.
 */

const C = {
    bg: '#080b22',
    line: 'rgba(150,165,255,0.22)',
    cyan: '#41f3ff',
    violet: '#8a5bff',
    magenta: '#ff2bd6',
    warm: '#ffb36b',
    mint: '#7dffb2',
    text: '#e8ecff',
    dim: '#5d6390'
};

function Frame({ children, label }) {
    return (
        <svg className="art" viewBox="0 0 320 200" role="img" aria-label={label} preserveAspectRatio="xMidYMid slice">
            <rect width="320" height="200" fill={C.bg} />
            <g stroke={C.line} strokeWidth="1">
                {Array.from({ length: 9 }, (_, i) => (
                    <line key={`v${i}`} x1={i * 40} y1="0" x2={i * 40} y2="200" />
                ))}
                {Array.from({ length: 6 }, (_, i) => (
                    <line key={`h${i}`} x1="0" y1={i * 40} x2="320" y2={i * 40} />
                ))}
            </g>
            {children}
        </svg>
    );
}

function Parking() {
    // Two rows of slots, a few taken, one being booked, and a QR ticket.
    const taken = new Set([1, 2, 5, 8, 9]);
    return (
        <Frame label="Illustration: parking slots and a QR ticket">
            {Array.from({ length: 12 }, (_, i) => {
                const row = Math.floor(i / 6);
                const x = 22 + (i % 6) * 34;
                const y = row ? 118 : 30;
                const booked = i === 3;
                return (
                    <g key={i}>
                        <rect
                            x={x}
                            y={y}
                            width="28"
                            height="52"
                            rx="3"
                            fill={booked ? 'rgba(65,243,255,0.16)' : 'none'}
                            stroke={booked ? C.cyan : taken.has(i) ? C.dim : C.mint}
                            strokeWidth={booked ? 2 : 1.2}
                            className={booked ? 'art-pulse' : undefined}
                        />
                        {taken.has(i) && <rect x={x + 6} y={y + 10} width="16" height="30" rx="5" fill={C.violet} opacity="0.75" />}
                    </g>
                );
            })}
            <path d="M14 100 H226" stroke={C.dim} strokeDasharray="6 6" />
            <g transform="translate(240 46)">
                <rect width="64" height="108" rx="8" fill="#0d1236" stroke={C.cyan} />
                <rect x="10" y="12" width="44" height="44" fill={C.text} />
                {[0, 1, 2, 3].map((r) =>
                    [0, 1, 2, 3].map((c) =>
                        (r * 3 + c * 5) % 3 ? <rect key={`${r}${c}`} x={12 + c * 10} y={14 + r * 10} width="9" height="9" fill={C.bg} /> : null
                    )
                )}
                <rect x="10" y="68" width="44" height="5" rx="2" fill={C.cyan} />
                <rect x="10" y="80" width="30" height="5" rx="2" fill={C.dim} />
                <rect x="10" y="92" width="36" height="5" rx="2" fill={C.dim} />
            </g>
        </Frame>
    );
}

function Anpr() {
    return (
        <Frame label="Illustration: camera frame with a detected number plate">
            <rect x="40" y="36" width="170" height="128" rx="6" fill="#0d1236" stroke={C.dim} />
            <path d="M70 140 l20 -46 h70 l20 46 z" fill="#151b4a" stroke={C.violet} />
            <rect x="96" y="124" width="58" height="16" rx="2" fill={C.text} />
            <rect x="90" y="118" width="70" height="28" fill="none" stroke={C.cyan} strokeWidth="2" className="art-pulse" />
            <rect x="90" y="108" width="34" height="10" fill={C.cyan} />
            <path d="M40 60 H210" stroke={C.cyan} strokeOpacity="0.5" className="art-scan" />
            <g transform="translate(224 70)" fontFamily="JetBrains Mono, monospace" fontSize="11">
                <rect width="82" height="60" rx="6" fill="#0d1236" stroke={C.line} />
                <text x="10" y="20" fill={C.dim}>
                    plate
                </text>
                <rect x="10" y="30" width="62" height="16" rx="3" fill="none" stroke={C.mint} />
                <rect x="16" y="36" width="50" height="4" rx="2" fill={C.mint} opacity="0.7" />
            </g>
        </Frame>
    );
}

function Occupancy() {
    const state = ['free', 'taken', 'taken', 'free', 'taken', 'free', 'taken', 'free'];
    return (
        <Frame label="Illustration: top-down parking slots marked free or occupied">
            {state.map((s, i) => {
                const x = 30 + (i % 4) * 66;
                const y = i < 4 ? 26 : 112;
                return (
                    <g key={i}>
                        <rect
                            x={x}
                            y={y}
                            width="56"
                            height="62"
                            rx="4"
                            fill={s === 'free' ? 'rgba(125,255,178,0.08)' : 'rgba(255,43,214,0.08)'}
                            stroke={s === 'free' ? C.mint : C.magenta}
                        />
                        {s === 'taken' && (
                            <>
                                <rect x={x + 12} y={y + 10} width="32" height="42" rx="8" fill={C.violet} opacity="0.8" />
                                <rect x={x + 8} y={y + 6} width="40" height="50" fill="none" stroke={C.cyan} strokeDasharray="4 3" />
                            </>
                        )}
                    </g>
                );
            })}
        </Frame>
    );
}

function Assistant() {
    return (
        <Frame label="Illustration: a chat between a person and an assistant">
            <rect x="40" y="34" width="150" height="34" rx="12" fill="#151b4a" stroke={C.line} />
            <rect x="54" y="47" width="100" height="6" rx="3" fill={C.dim} />
            <rect x="120" y="82" width="160" height="50" rx="12" fill="rgba(65,243,255,0.1)" stroke={C.cyan} />
            <rect x="134" y="96" width="120" height="6" rx="3" fill={C.cyan} opacity="0.8" />
            <rect x="134" y="110" width="84" height="6" rx="3" fill={C.cyan} opacity="0.5" />
            <rect x="40" y="146" width="110" height="28" rx="12" fill="#151b4a" stroke={C.line} />
            <circle cx="66" cy="160" r="3" fill={C.text} className="art-blink" />
            <circle cx="78" cy="160" r="3" fill={C.text} className="art-blink" style={{ animationDelay: '0.2s' }} />
            <circle cx="90" cy="160" r="3" fill={C.text} className="art-blink" style={{ animationDelay: '0.4s' }} />
        </Frame>
    );
}

function Voice() {
    return (
        <Frame label="Illustration: a voice waveform">
            <circle cx="160" cy="100" r="54" fill="none" stroke={C.violet} strokeOpacity="0.6" />
            <circle cx="160" cy="100" r="74" fill="none" stroke={C.violet} strokeOpacity="0.25" />
            {Array.from({ length: 23 }, (_, i) => {
                const h = 10 + Math.abs(Math.sin(i * 0.9) * 46) * (1 - Math.abs(i - 11) / 14);
                return (
                    <rect
                        key={i}
                        x={94 + i * 6}
                        y={100 - h / 2}
                        width="3"
                        height={h}
                        rx="1.5"
                        fill={i % 3 ? C.cyan : C.magenta}
                        className="art-wave"
                        style={{ animationDelay: `${i * 60}ms` }}
                    />
                );
            })}
        </Frame>
    );
}

function Iot() {
    return (
        <Frame label="Illustration: a microcontroller sending signals">
            <rect x="110" y="70" width="100" height="60" rx="6" fill="#151b4a" stroke={C.mint} />
            <rect x="140" y="88" width="40" height="24" rx="3" fill="#0d1236" stroke={C.dim} />
            {Array.from({ length: 8 }, (_, i) => (
                <g key={i} stroke={C.dim}>
                    <line x1={118 + i * 12} y1="70" x2={118 + i * 12} y2="60" />
                    <line x1={118 + i * 12} y1="130" x2={118 + i * 12} y2="140" />
                </g>
            ))}
            {[22, 38, 54].map((r, i) => (
                <path
                    key={r}
                    d={`M ${222 + r * 0.2} ${100 - r * 0.6} a ${r} ${r} 0 0 1 0 ${r * 1.2}`}
                    fill="none"
                    stroke={C.cyan}
                    className="art-blink"
                    style={{ animationDelay: `${i * 0.25}s` }}
                />
            ))}
        </Frame>
    );
}

const ART = { parking: Parking, anpr: Anpr, occupancy: Occupancy, assistant: Assistant, voice: Voice, iot: Iot };

export default function ProjectArt({ kind }) {
    const Art = ART[kind] || Parking;
    return <Art />;
}

import { useCallback, useEffect, useRef, useState } from 'react';

import { sfx } from '../../audio/engine';
import { useCameraStore } from '../../helper/CameraStore';
import { useRoomStore } from '../../helper/RoomStore';
import ScreenShell from './ScreenShell';

const W = 805;
const H = 426;
const ROW_COLORS = ['#ff2bd6', '#c04bff', '#8a5bff', '#5b7bff', '#41f3ff', '#7dffb2', '#ffb36b'];
const PIXEL = '"VT323", ui-monospace, monospace';
const HI_KEY = 'ah-breaker-hi';

function readHi() {
    try {
        return Number(localStorage.getItem(HI_KEY)) || 0;
    } catch {
        return 0;
    }
}

function buildLevel(level) {
    const rows = Math.min(4 + level, 7);
    const cols = 11;
    const margin = 28;
    const gap = 5;
    const bw = (W - margin * 2 - gap * (cols - 1)) / cols;
    const bh = 14;
    const bricks = [];
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            // Level patterns: gaps make later levels feel different.
            if (level % 2 === 0 && (r + c) % 5 === 0) continue;
            bricks.push({
                x: margin + c * (bw + gap),
                y: 52 + r * (bh + gap),
                w: bw,
                h: bh,
                row: r,
                hp: level > 1 && r === 0 ? 2 : 1
            });
        }
    }
    return bricks;
}

function newGame() {
    return {
        mode: 'title',
        score: 0,
        lives: 3,
        level: 1,
        hi: readHi(),
        paddle: { x: W / 2, w: 96 },
        ball: { x: W / 2, y: H - 40, vx: 0, vy: 0, r: 5, speed: 340 },
        bricks: buildLevel(1),
        particles: [],
        shake: 0,
        keys: { left: false, right: false },
        clearTimer: 0
    };
}

export default function NeonBreaker() {
    const canvasRef = useRef();
    const game = useRef(newGame());
    const [mode, setMode] = useState('title');
    const goHome = useCameraStore((s) => s.default);
    const reduced = useRoomStore((s) => s.reducedMotion);

    const setGameMode = useCallback((m) => {
        game.current.mode = m;
        setMode(m);
    }, []);

    const serve = useCallback(() => {
        const g = game.current;
        g.ball.vx = 0;
        g.ball.vy = 0;
        g.ball.speed = 330 + g.level * 30;
        setGameMode('serve');
    }, [setGameMode]);

    const launch = useCallback(() => {
        const g = game.current;
        const angle = (-Math.PI / 2) + (Math.random() - 0.5) * 0.6;
        g.ball.vx = Math.cos(angle) * g.ball.speed;
        g.ball.vy = Math.sin(angle) * g.ball.speed;
        sfx('launch');
        setGameMode('play');
    }, [setGameMode]);

    const restart = useCallback(() => {
        const hi = game.current.hi;
        game.current = { ...newGame(), hi };
        serve();
    }, [serve]);

    const action = useCallback(() => {
        const g = game.current;
        if (g.mode === 'title' || g.mode === 'over') restart();
        else if (g.mode === 'serve') launch();
        else if (g.mode === 'paused') setGameMode('play');
        else if (g.mode === 'play') setGameMode('paused');
    }, [launch, restart, setGameMode]);

    const togglePause = useCallback(() => {
        const g = game.current;
        if (g.mode === 'play') setGameMode('paused');
        else if (g.mode === 'paused') setGameMode('play');
    }, [setGameMode]);

    // Keyboard (capture phase so Esc can pause before the global "back" handler sees it).
    useEffect(() => {
        const onDown = (e) => {
            const g = game.current;
            const k = e.key;
            if (k === 'ArrowLeft' || k === 'a' || k === 'A') {
                g.keys.left = true;
                e.preventDefault();
            } else if (k === 'ArrowRight' || k === 'd' || k === 'D') {
                g.keys.right = true;
                e.preventDefault();
            } else if ((k === ' ' || k === 'Enter') && !(e.target instanceof HTMLButtonElement)) {
                e.preventDefault();
                action();
            } else if (k === 'p' || k === 'P') {
                togglePause();
            } else if (k === 'Escape' && g.mode === 'play') {
                e.preventDefault();
                e.stopPropagation();
                setGameMode('paused');
            }
        };
        const onUp = (e) => {
            const g = game.current;
            if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') g.keys.left = false;
            if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') g.keys.right = false;
        };
        const onHide = () => {
            if (document.hidden && game.current.mode === 'play') setGameMode('paused');
        };
        window.addEventListener('keydown', onDown, true);
        window.addEventListener('keyup', onUp, true);
        document.addEventListener('visibilitychange', onHide);
        return () => {
            window.removeEventListener('keydown', onDown, true);
            window.removeEventListener('keyup', onUp, true);
            document.removeEventListener('visibilitychange', onHide);
        };
    }, [action, togglePause, setGameMode]);

    // Game loop.
    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let raf = 0;
        let last = performance.now();

        const burst = (x, y, color) => {
            const g = game.current;
            const n = reduced ? 4 : 10;
            for (let i = 0; i < n; i++) {
                const a = Math.random() * Math.PI * 2;
                const s = 60 + Math.random() * 160;
                g.particles.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 0.5, color });
            }
        };

        const update = (dt) => {
            const g = game.current;
            const p = g.paddle;
            const b = g.ball;

            const keyDir = (g.keys.right ? 1 : 0) - (g.keys.left ? 1 : 0);
            p.x = Math.max(p.w / 2, Math.min(W - p.w / 2, p.x + keyDir * 520 * dt));

            g.particles.forEach((q) => {
                q.x += q.vx * dt;
                q.y += q.vy * dt;
                q.life -= dt;
            });
            g.particles = g.particles.filter((q) => q.life > 0);
            g.shake = Math.max(0, g.shake - dt * 20);

            if (g.mode === 'clear') {
                g.clearTimer -= dt;
                if (g.clearTimer <= 0) {
                    g.level += 1;
                    g.bricks = buildLevel(g.level);
                    serve();
                }
                return;
            }

            if (g.mode === 'serve') {
                b.x = p.x;
                b.y = H - 34 - b.r;
                return;
            }
            if (g.mode !== 'play') return;

            b.x += b.vx * dt;
            b.y += b.vy * dt;

            if (b.x < b.r) {
                b.x = b.r;
                b.vx = Math.abs(b.vx);
                sfx('bounce');
            } else if (b.x > W - b.r) {
                b.x = W - b.r;
                b.vx = -Math.abs(b.vx);
                sfx('bounce');
            }
            if (b.y < 36 + b.r) {
                b.y = 36 + b.r;
                b.vy = Math.abs(b.vy);
                sfx('bounce');
            }

            // Paddle: bounce angle depends on where the ball lands.
            const py = H - 30;
            if (b.vy > 0 && b.y + b.r >= py && b.y + b.r <= py + 12 && Math.abs(b.x - p.x) <= p.w / 2 + b.r) {
                const hit = (b.x - p.x) / (p.w / 2);
                const angle = -Math.PI / 2 + hit * (Math.PI / 3);
                b.vx = Math.cos(angle) * b.speed;
                b.vy = Math.sin(angle) * b.speed;
                b.y = py - b.r;
                sfx('bounce');
            }

            for (const br of g.bricks) {
                if (br.hp <= 0) continue;
                const nx = Math.max(br.x, Math.min(b.x, br.x + br.w));
                const ny = Math.max(br.y, Math.min(b.y, br.y + br.h));
                const dx = b.x - nx;
                const dy = b.y - ny;
                if (dx * dx + dy * dy > b.r * b.r) continue;

                const overlapX = Math.min(b.x + b.r - br.x, br.x + br.w - (b.x - b.r));
                const overlapY = Math.min(b.y + b.r - br.y, br.y + br.h - (b.y - b.r));
                if (overlapX < overlapY) b.vx = -b.vx;
                else b.vy = -b.vy;

                br.hp -= 1;
                if (br.hp <= 0) {
                    g.score += 10 * (7 - br.row) * g.level;
                    burst(br.x + br.w / 2, br.y + br.h / 2, ROW_COLORS[br.row % ROW_COLORS.length]);
                    if (!reduced) g.shake = 3;
                }
                sfx('brick');
                b.speed = Math.min(b.speed * 1.015, 640);
                const len = Math.hypot(b.vx, b.vy);
                b.vx = (b.vx / len) * b.speed;
                b.vy = (b.vy / len) * b.speed;
                break;
            }

            if (g.score > g.hi) {
                g.hi = g.score;
                try {
                    localStorage.setItem(HI_KEY, String(g.hi));
                } catch {
                    /* storage unavailable */
                }
            }

            if (g.bricks.every((br) => br.hp <= 0)) {
                sfx('win');
                g.clearTimer = 1.4;
                setGameMode('clear');
                return;
            }

            if (b.y - b.r > H) {
                g.lives -= 1;
                sfx('lose');
                if (!reduced) g.shake = 6;
                if (g.lives <= 0) setGameMode('over');
                else serve();
            }
        };

        const text = (str, x, y, size, color, align = 'center') => {
            ctx.font = `${size}px ${PIXEL}`;
            ctx.textAlign = align;
            ctx.textBaseline = 'middle';
            ctx.fillStyle = color;
            ctx.fillText(str, x, y);
        };

        const draw = () => {
            const g = game.current;
            ctx.save();
            if (g.shake > 0) ctx.translate((Math.random() - 0.5) * g.shake, (Math.random() - 0.5) * g.shake);

            ctx.fillStyle = '#05060f';
            ctx.fillRect(-10, -10, W + 20, H + 20);
            ctx.strokeStyle = 'rgba(65,243,255,0.06)';
            ctx.lineWidth = 1;
            for (let x = 0; x < W; x += 35) {
                ctx.beginPath();
                ctx.moveTo(x + 0.5, 36);
                ctx.lineTo(x + 0.5, H);
                ctx.stroke();
            }

            // HUD strip.
            ctx.fillStyle = 'rgba(138,91,255,0.12)';
            ctx.fillRect(0, 0, W, 34);
            text(`SCORE ${String(g.score).padStart(5, '0')}`, 16, 18, 26, '#e8ecff', 'left');
            text(`LEVEL ${g.level}`, W / 2, 18, 26, '#41f3ff');
            text(`HI ${String(g.hi).padStart(5, '0')}`, W - 110, 18, 26, '#8a90b8', 'right');
            for (let i = 0; i < g.lives; i++) {
                ctx.fillStyle = '#ff2bd6';
                ctx.fillRect(W - 86 + i * 24, 11, 16, 14);
            }

            for (const br of g.bricks) {
                if (br.hp <= 0) continue;
                const c = ROW_COLORS[br.row % ROW_COLORS.length];
                ctx.globalAlpha = 0.25;
                ctx.fillStyle = c;
                ctx.fillRect(br.x - 2, br.y - 2, br.w + 4, br.h + 4);
                ctx.globalAlpha = 1;
                ctx.fillRect(br.x, br.y, br.w, br.h);
                ctx.fillStyle = 'rgba(255,255,255,0.35)';
                ctx.fillRect(br.x, br.y, br.w, 3);
                if (br.hp > 1) {
                    ctx.strokeStyle = '#ffffff';
                    ctx.strokeRect(br.x + 2.5, br.y + 2.5, br.w - 5, br.h - 5);
                }
            }

            g.particles.forEach((q) => {
                ctx.globalAlpha = Math.max(0, q.life * 2);
                ctx.fillStyle = q.color;
                ctx.fillRect(q.x - 2, q.y - 2, 4, 4);
            });
            ctx.globalAlpha = 1;

            const p = g.paddle;
            ctx.fillStyle = 'rgba(65,243,255,0.25)';
            ctx.fillRect(p.x - p.w / 2 - 3, H - 33, p.w + 6, 16);
            ctx.fillStyle = '#41f3ff';
            ctx.fillRect(p.x - p.w / 2, H - 30, p.w, 10);

            const b = g.ball;
            ctx.fillStyle = 'rgba(255,255,255,0.25)';
            ctx.fillRect(b.x - b.r - 3, b.y - b.r - 3, b.r * 2 + 6, b.r * 2 + 6);
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(b.x - b.r, b.y - b.r, b.r * 2, b.r * 2);

            const panel = (title, sub, color) => {
                ctx.fillStyle = 'rgba(5,6,15,0.72)';
                ctx.fillRect(0, H / 2 - 70, W, 140);
                text(title, W / 2, H / 2 - 22, 64, color);
                text(sub, W / 2, H / 2 + 28, 26, '#e8ecff');
            };
            if (g.mode === 'title') {
                panel('NEON BREAKER', 'CLICK OR PRESS SPACE TO START', '#ff2bd6');
                text('MOUSE · TOUCH · ← → / A D TO MOVE   ·   P PAUSE   ·   ESC EXIT', W / 2, H - 70, 20, '#8a90b8');
            } else if (g.mode === 'serve') {
                text('CLICK OR SPACE TO LAUNCH', W / 2, H / 2 + 60, 24, '#41f3ff');
            } else if (g.mode === 'paused') {
                panel('PAUSED', 'SPACE / CLICK TO RESUME  ·  ESC TO LEAVE', '#41f3ff');
            } else if (g.mode === 'over') {
                panel('GAME OVER', `SCORE ${g.score}  ·  CLICK OR SPACE TO RETRY`, '#ff2bd6');
            } else if (g.mode === 'clear') {
                panel(`LEVEL ${g.level} CLEAR`, 'GET READY…', '#7dffb2');
            }
            ctx.restore();
        };

        const frame = (now) => {
            const dt = Math.min(1 / 30, (now - last) / 1000);
            last = now;
            update(dt);
            draw();
            raf = requestAnimationFrame(frame);
        };
        raf = requestAnimationFrame(frame);
        return () => cancelAnimationFrame(raf);
    }, [reduced, serve, setGameMode]);

    const onPointerMove = (e) => {
        const canvas = canvasRef.current;
        const x = (e.nativeEvent.offsetX / canvas.clientWidth) * W;
        const p = game.current.paddle;
        p.x = Math.max(p.w / 2, Math.min(W - p.w / 2, x));
    };

    useEffect(() => {
        canvasRef.current?.focus({ preventScroll: true });
    }, []);

    return (
        <ScreenShell className="arcade" width={1610} height={852} label="Neon Breaker arcade game">
            <canvas
                ref={canvasRef}
                width={W}
                height={H}
                className="arcade__canvas"
                tabIndex={0}
                aria-label="Neon Breaker. Move with mouse, touch or arrow keys. Space to launch or pause."
                onPointerMove={onPointerMove}
                onPointerDown={(e) => {
                    e.stopPropagation();
                    onPointerMove(e);
                    if (game.current.mode !== 'play') action();
                }}
            />
            <div className="arcade__controls">
                <button type="button" onClick={togglePause} disabled={mode !== 'play' && mode !== 'paused'}>
                    {mode === 'paused' ? 'Resume' : 'Pause'}
                </button>
                <button type="button" onClick={restart}>
                    Restart
                </button>
                <button type="button" onClick={goHome}>
                    Exit
                </button>
            </div>
            <div className="crt-overlay" aria-hidden="true" />
        </ScreenShell>
    );
}

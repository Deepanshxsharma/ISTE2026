/* Procedural artwork for in-room screens. Everything here is original and drawn in code. */

export const PALETTE = {
    ink: '#05060f',
    midnight: '#0a0e27',
    deep: '#141a46',
    cyan: '#41f3ff',
    violet: '#8a5bff',
    magenta: '#ff2bd6',
    warm: '#ffb36b',
    text: '#e8ecff',
    dim: '#8a90b8'
};

const DISPLAY = '"Space Grotesk", system-ui, sans-serif';
const MONO = '"JetBrains Mono", ui-monospace, monospace';
const PIXEL = '"VT323", ui-monospace, monospace';

function synthBackdrop(ctx, x, y, w, h, { horizon = 0.62, sun = true } = {}) {
    const sky = ctx.createLinearGradient(0, y, 0, y + h);
    sky.addColorStop(0, '#070a24');
    sky.addColorStop(horizon * 0.7, '#1c1450');
    sky.addColorStop(horizon, '#4a1764');
    sky.addColorStop(horizon + 0.001, '#070818');
    sky.addColorStop(1, '#03040c');
    ctx.fillStyle = sky;
    ctx.fillRect(x, y, w, h);

    // Stars (deterministic so redraws match).
    let seed = 7;
    const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    ctx.fillStyle = 'rgba(232,236,255,0.7)';
    for (let i = 0; i < 70; i++) {
        const sx = x + rand() * w;
        const sy = y + rand() * h * horizon * 0.75;
        const s = rand() < 0.15 ? 2 : 1;
        ctx.fillRect(sx, sy, s * (w / 600), s * (w / 600));
    }

    const hy = y + h * horizon;
    if (sun) {
        const r = Math.min(w, h) * 0.22;
        const cx = x + w / 2;
        const cy = hy - r * 0.35;
        ctx.save();
        ctx.beginPath();
        ctx.rect(x, y, w, hy - y);
        ctx.clip();
        const sg = ctx.createLinearGradient(0, cy - r, 0, cy + r);
        sg.addColorStop(0, PALETTE.warm);
        sg.addColorStop(0.55, PALETTE.magenta);
        sg.addColorStop(1, PALETTE.violet);
        ctx.shadowColor = PALETTE.magenta;
        ctx.shadowBlur = r * 0.5;
        ctx.fillStyle = sg;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        // Sun stripes.
        ctx.globalCompositeOperation = 'destination-out';
        for (let i = 0; i < 6; i++) {
            const t = i / 6;
            const sy = cy + r * (0.05 + t * 0.95);
            ctx.fillRect(cx - r, sy, r * 2, r * 0.03 + t * r * 0.07);
        }
        ctx.restore();
    }

    // Perspective grid.
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, hy, w, y + h - hy);
    ctx.clip();
    ctx.strokeStyle = 'rgba(65,243,255,0.55)';
    ctx.lineWidth = Math.max(1, w / 500);
    ctx.shadowColor = PALETTE.cyan;
    ctx.shadowBlur = 6;
    const vx = x + w / 2;
    for (let i = -14; i <= 14; i++) {
        ctx.beginPath();
        ctx.moveTo(vx + i * (w / 60), hy);
        ctx.lineTo(vx + i * (w / 6), y + h);
        ctx.stroke();
    }
    for (let i = 1; i < 10; i++) {
        const t = Math.pow(i / 10, 2.1);
        const ly = hy + (y + h - hy) * t;
        ctx.beginPath();
        ctx.moveTo(x, ly);
        ctx.lineTo(x + w, ly);
        ctx.stroke();
    }
    ctx.restore();
}

function scanlines(ctx, w, h, alpha = 0.18, gap = 4) {
    ctx.fillStyle = `rgba(0,0,0,${alpha})`;
    for (let y = 0; y < h; y += gap) ctx.fillRect(0, y, w, gap / 2);
}

function vignette(ctx, w, h, strength = 0.6) {
    const g = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.3, w / 2, h / 2, Math.max(w, h) * 0.75);
    g.addColorStop(0, 'rgba(0,0,0,0)');
    g.addColorStop(1, `rgba(0,0,0,${strength})`);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
}

function glowText(ctx, text, x, y, { font, color, glow = color, blur = 18, align = 'center' }) {
    ctx.font = font;
    ctx.textAlign = align;
    ctx.textBaseline = 'middle';
    ctx.shadowColor = glow;
    ctx.shadowBlur = blur;
    ctx.fillStyle = color;
    ctx.fillText(text, x, y);
    ctx.shadowBlur = 0;
}

export function drawMonitorIdle(ctx, w, h) {
    synthBackdrop(ctx, 0, 0, w, h, { horizon: 0.64 });
    glowText(ctx, 'DEEPANSH.SHARMA', w / 2, h * 0.19, {
        font: `700 ${w * 0.072}px ${DISPLAY}`,
        color: PALETTE.text,
        glow: PALETTE.cyan,
        blur: 30
    });
    glowText(ctx, 'BEYOND THE SCREEN', w / 2, h * 0.29, {
        font: `500 ${w * 0.02}px ${MONO}`,
        color: PALETTE.cyan,
        blur: 10
    });
    ctx.font = `${w * 0.024}px ${PIXEL}`;
    ctx.textAlign = 'left';
    ctx.fillStyle = 'rgba(232,236,255,0.85)';
    ['> ls ~/projects', '  parking   vision   ai   iot', '> open projects/  _'].forEach((l, i) =>
        ctx.fillText(l, w * 0.04, h * 0.8 + i * w * 0.027)
    );
    scanlines(ctx, w, h, 0.16);
    vignette(ctx, w, h, 0.7);
}

export function drawTvIdle(ctx, w, h) {
    ctx.fillStyle = PALETTE.ink;
    ctx.fillRect(0, 0, w, h);
    const colors = [PALETTE.magenta, PALETTE.violet, '#5b7bff', PALETTE.cyan, '#7dffb2'];
    const cols = 12;
    const bw = (w * 0.86) / cols;
    const bh = h * 0.045;
    const ox = w * 0.07;
    colors.forEach((c, r) => {
        for (let i = 0; i < cols; i++) {
            if ((r === 2 && i % 5 === 3) || (r === 4 && i % 4 === 1)) continue;
            ctx.fillStyle = c;
            ctx.shadowColor = c;
            ctx.shadowBlur = 12;
            ctx.fillRect(ox + i * bw + 3, h * 0.1 + r * (bh + 6), bw - 6, bh);
        }
    });
    ctx.shadowBlur = 0;
    glowText(ctx, 'NEON BREAKER', w / 2, h * 0.56, {
        font: `${w * 0.12}px ${PIXEL}`,
        color: PALETTE.text,
        glow: PALETTE.magenta,
        blur: 26
    });
    glowText(ctx, 'INSERT COIN  ·  CLICK THE TV TO PLAY', w / 2, h * 0.7, {
        font: `${w * 0.04}px ${PIXEL}`,
        color: PALETTE.cyan,
        blur: 12
    });
    // Paddle & ball.
    ctx.fillStyle = PALETTE.cyan;
    ctx.shadowColor = PALETTE.cyan;
    ctx.shadowBlur = 14;
    ctx.fillRect(w * 0.42, h * 0.88, w * 0.16, h * 0.025);
    ctx.fillStyle = PALETTE.text;
    ctx.fillRect(w * 0.55, h * 0.8, h * 0.03, h * 0.03);
    ctx.shadowBlur = 0;
    scanlines(ctx, w, h, 0.22, 4);
    vignette(ctx, w, h, 0.65);
}

export function drawPhoneIdle(ctx, w, h) {
    synthBackdrop(ctx, 0, 0, w, h, { horizon: 0.7 });
    glowText(ctx, timeString(), w / 2, h * 0.16, {
        font: `600 ${w * 0.2}px ${DISPLAY}`,
        color: PALETTE.text,
        glow: PALETTE.violet,
        blur: 24
    });
    glowText(ctx, 'SAY HELLO', w / 2, h * 0.24, {
        font: `600 ${w * 0.05}px ${MONO}`,
        color: PALETTE.cyan,
        blur: 8
    });
    glowText(ctx, 'contact · remote', w / 2, h * 0.29, {
        font: `400 ${w * 0.038}px ${MONO}`,
        color: PALETTE.dim,
        blur: 4
    });
    vignette(ctx, w, h, 0.5);
}

function timeString() {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

/** Laptop screen background. The mesh UVs are mirrored, so the canvas is too. */
export function drawLaptopScreen(ctx, w, h, { playing, track }) {
    ctx.translate(w, 0);
    ctx.scale(-1, 1);

    const bg = ctx.createLinearGradient(0, 0, w, h);
    bg.addColorStop(0, '#0b0f2c');
    bg.addColorStop(1, '#05060f');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    const side = w * 0.19;
    ctx.fillStyle = '#04050c';
    ctx.fillRect(0, 0, side, h);
    glowText(ctx, 'SYNTH.FM', side * 0.12, h * 0.07, {
        font: `700 ${w * 0.024}px ${DISPLAY}`,
        color: PALETTE.text,
        glow: PALETTE.cyan,
        blur: 12,
        align: 'left'
    });
    ctx.font = `500 ${w * 0.012}px ${MONO}`;
    ctx.textAlign = 'left';
    ['Now playing', 'Library', 'Moods', 'Visualizer'].forEach((l, i) => {
        ctx.fillStyle = i === 0 ? PALETTE.cyan : PALETTE.dim;
        ctx.fillText(l.toUpperCase(), side * 0.12, h * 0.16 + i * h * 0.055);
    });

    // Header strip above the track list.
    const accent = track?.color || PALETTE.cyan;
    const hg = ctx.createLinearGradient(side, 0, w, 0);
    hg.addColorStop(0, accent + '55');
    hg.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = hg;
    ctx.fillRect(side, 0, w - side, h * 0.08);
    ctx.font = `600 ${w * 0.016}px ${MONO}`;
    ctx.fillStyle = PALETTE.text;
    ctx.fillText(
        playing ? `ON AIR — ${track.title.toUpperCase()}` : 'AFTER HOURS OST — PICK A TRACK',
        side + w * 0.02,
        h * 0.045
    );
    scanlines(ctx, w, h, 0.1, 3);
}

/**
 * One row of the laptop track list. The tile meshes sample the canvas rotated and mirrored,
 * so we paint a normal landscape row and then transform it into the portrait canvas.
 */
export function drawTrackTile(ctx, w, h, { track, index, playing }) {
    // Portrait canvas (w < h). Paint in landscape space (u along the row, v across it):
    // x = v, y = h - u — the row starts at the bottom of the image.
    ctx.setTransform(0, -1, 1, 0, 0, h);
    const L = h;
    const S = w;

    ctx.fillStyle = playing ? '#1a1f4f' : '#10132e';
    ctx.fillRect(0, 0, L, S);
    if (playing) {
        ctx.fillStyle = track.color;
        ctx.fillRect(0, 0, L * 0.012, S);
    }

    // Cover art: geometric badge in the track colour.
    const c = S * 0.7;
    const cx = L * 0.03;
    const cy = (S - c) / 2;
    const cg = ctx.createLinearGradient(cx, cy, cx + c, cy + c);
    cg.addColorStop(0, track.color);
    cg.addColorStop(1, '#140a3a');
    ctx.fillStyle = cg;
    ctx.fillRect(cx, cy, c, c);
    ctx.strokeStyle = 'rgba(255,255,255,0.75)';
    ctx.lineWidth = S * 0.025;
    ctx.beginPath();
    ctx.arc(cx + c / 2, cy + c / 2, c * 0.24, 0, Math.PI * 2);
    ctx.stroke();

    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.font = `600 ${S * 0.26}px ${DISPLAY}`;
    ctx.fillStyle = playing ? track.color : PALETTE.text;
    ctx.fillText(`${String(index + 1).padStart(2, '0')}  ${track.title}`, cx + c + L * 0.035, S * 0.38);
    ctx.font = `500 ${S * 0.17}px ${MONO}`;
    ctx.fillStyle = PALETTE.dim;
    ctx.fillText(`${track.artist}  ·  ${track.bpm} BPM`, cx + c + L * 0.035, S * 0.7);

    // Play / pause glyph.
    const gx = L * 0.93;
    const gy = S / 2;
    const gs = S * 0.2;
    ctx.fillStyle = playing ? track.color : PALETTE.text;
    if (playing) {
        ctx.fillRect(gx - gs * 0.8, gy - gs, gs * 0.55, gs * 2);
        ctx.fillRect(gx + gs * 0.25, gy - gs, gs * 0.55, gs * 2);
        // Static EQ bars.
        [0.5, 0.9, 0.65, 1, 0.4].forEach((v, i) => {
            ctx.fillRect(L * 0.8 + i * S * 0.12, gy + gs - gs * 2 * v, S * 0.08, gs * 2 * v);
        });
    } else {
        ctx.beginPath();
        ctx.moveTo(gx - gs * 0.7, gy - gs);
        ctx.lineTo(gx + gs, gy);
        ctx.lineTo(gx - gs * 0.7, gy + gs);
        ctx.closePath();
        ctx.fill();
    }
}

/** Replacement art for the shelf photo frames (three panels, original geometric pieces). */
export function drawPhotoArt(ctx, w, h, { initials = '' } = {}) {
    const s = w / 512;
    ctx.fillStyle = '#d9d3cf';
    ctx.fillRect(0, 0, w, h);

    // Panel A: synth landscape. This UV island is stored rotated 180° in the frame model.
    ctx.save();
    ctx.translate(150 * s, 326 * s);
    ctx.rotate(Math.PI);
    ctx.translate(-150 * s, -326 * s);
    synthBackdrop(ctx, 0, 140 * s, 300 * s, 372 * s, { horizon: 0.58 });
    ctx.restore();

    // Panel B: monogram inside neon rings.
    ctx.fillStyle = '#0b0d26';
    ctx.fillRect(305 * s, 0, 182 * s, 225 * s);
    const bx = 396 * s;
    const by = 112 * s;
    [PALETTE.cyan, PALETTE.violet, PALETTE.magenta].forEach((c, i) => {
        ctx.strokeStyle = c;
        ctx.lineWidth = 5 * s;
        ctx.beginPath();
        ctx.arc(bx, by, (48 + i * 14) * s, 0, Math.PI * 2);
        ctx.stroke();
    });
    if (initials) {
        glowText(ctx, initials, bx, by + 4 * s, {
            font: `700 ${54 * s}px ${DISPLAY}`,
            color: PALETTE.text,
            glow: PALETTE.cyan,
            blur: 14 * s
        });
    }

    // Panel C: pixel mosaic.
    const cx0 = 303 * s;
    const cy0 = 228 * s;
    const cw = 197 * s;
    const ch = 284 * s;
    ctx.fillStyle = '#120a2e';
    ctx.fillRect(cx0, cy0, cw, ch);
    const cell = 14 * s;
    let seed = 11;
    const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    const tones = [PALETTE.magenta, PALETTE.violet, PALETTE.cyan, '#1d2370', '#2c1660'];
    for (let y = cy0 + cell; y < cy0 + ch - cell; y += cell) {
        for (let x = cx0 + cell; x < cx0 + cw - cell; x += cell) {
            const d = Math.hypot(x - (cx0 + cw / 2), y - (cy0 + ch / 2)) / (cw * 0.6);
            const k = Math.min(tones.length - 1, Math.floor(d * 3 + rand() * 1.4));
            ctx.fillStyle = tones[k];
            ctx.fillRect(x, y, cell - 2 * s, cell - 2 * s);
        }
    }
}

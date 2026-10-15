import { useEffect, useMemo } from 'react';
import * as THREE from 'three';

let fontsReady = null;
function whenFontsReady() {
    if (!fontsReady) {
        fontsReady =
            typeof document !== 'undefined' && document.fonts
                ? Promise.all([
                      document.fonts.load('700 40px "Space Grotesk"'),
                      document.fonts.load('500 40px "JetBrains Mono"'),
                      document.fonts.load('40px "VT323"')
                  ]).catch(() => null)
                : Promise.resolve();
    }
    return fontsReady;
}

/**
 * A CanvasTexture redrawn whenever `deps` change (and once web fonts have loaded).
 * `draw(ctx, width, height)` paints the full canvas.
 */
export function useCanvasTexture(draw, deps, { width, height, flipY = true, mirrorX = false }) {
    const texture = useMemo(() => {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const tex = new THREE.CanvasTexture(canvas);
        tex.flipY = flipY;
        tex.anisotropy = 4;
        if (mirrorX) {
            tex.repeat.x = -1;
            tex.offset.x = 1;
        }
        return tex;
    }, [width, height, flipY, mirrorX]);

    useEffect(() => {
        let alive = true;
        const paint = () => {
            if (!alive) return;
            const ctx = texture.image.getContext('2d');
            ctx.save();
            draw(ctx, width, height);
            ctx.restore();
            texture.needsUpdate = true;
        };
        paint();
        whenFontsReady().then(paint);
        return () => {
            alive = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [texture, ...deps]);

    useEffect(() => () => texture.dispose(), [texture]);

    return texture;
}

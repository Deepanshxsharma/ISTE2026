/* eslint-disable react/prop-types */
import { Html } from '@react-three/drei';
import { useMemo } from 'react';
import * as THREE from 'three';

import { sfx } from '../audio/engine';
import { destination, useCameraStore } from '../helper/CameraStore';
import { cycleMood, useRoomStore } from '../helper/RoomStore';

const BEACONS = [
    { id: 'about', position: [3.35, 4.75, 4.85] },
    { id: 'desktop', node: 'monitor', lift: 0.55 },
    { id: 'displayBoard', position: [-5.1, 3.95, -1.95] },
    { id: 'smartphone', node: 'smartphoneDisp', lift: 0.35 },
    { id: 'laptop', node: 'laptop', lift: 0.45 },
    { id: 'tv', node: 'tvdisplay', lift: 0.15 },
    { id: 'switch', node: 'Sphere', label: 'Lights', lift: 0.45 }
].map((b) => ({ ...b, label: b.label || destination(b.id).label }));

/** Small labelled markers on each interactive object (overview only). Keyboard focusable. */
export default function Beacons({ nodes, scene }) {
    const cameraState = useCameraStore((s) => s.cameraState);
    const go = useCameraStore((s) => s.go);
    const entered = useRoomStore((s) => s.entered);
    const hoverId = useRoomStore((s) => s.hover?.id);
    const mood = useRoomStore((s) => s.mood);

    const positions = useMemo(() => {
        scene.updateMatrixWorld(true);
        const box = new THREE.Box3();
        const center = new THREE.Vector3();
        return BEACONS.map((b) => {
            if (b.position) return b.position;
            box.setFromObject(nodes[b.node]);
            box.getCenter(center);
            return [center.x, box.max.y + (b.lift || 0.3), center.z];
        });
    }, [nodes, scene]);

    if (!entered || cameraState !== 'default') return null;

    return BEACONS.map((b, i) => (
        <Html key={b.id} position={positions[i]} center zIndexRange={[30, 20]}>
            <button
                type="button"
                className={`beacon ${hoverId === b.id ? 'is-hot' : ''}`}
                style={{ animationDelay: `${i * 70}ms` }}
                onClick={(e) => {
                    e.stopPropagation();
                    if (b.id === 'switch') {
                        sfx('toggle');
                        cycleMood();
                    } else {
                        go(b.id);
                    }
                }}
                onPointerEnter={() => sfx('hover')}
                aria-label={
                    b.id === 'switch'
                        ? `Change room lights (currently ${mood})`
                        : `${b.label}: ${destination(b.id).hint}`
                }
            >
                <span className="beacon__dot" aria-hidden="true" />
                <span className="beacon__label">{b.label}</span>
            </button>
        </Html>
    ));
}

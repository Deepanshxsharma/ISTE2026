import { CameraControls } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';

import { useCameraStore } from '../helper/CameraStore';
import { useRoomStore } from '../helper/RoomStore';

const PI = Math.PI;

/*
 * Camera presets. `fit` is the narrowest viewport aspect at which the framing still works;
 * on narrower screens the camera backs away proportionally so nothing is cropped.
 */
const PRESETS = {
    intro: {
        position: [27, 13, -27],
        target: [0, -1.5, 0],
        distance: [2, 60],
        polar: [0, PI],
        azimuth: [-Infinity, Infinity],
        truck: 0,
        fit: 1.4
    },
    default: {
        position: [14, 10, -14],
        target: [0, -1, 0],
        distance: [2, 25],
        polar: [PI * 0.1, PI * 0.45],
        azimuth: [PI * 0.5, PI],
        truck: 0.5,
        dollyToCursor: true,
        fit: 1.35
    },
    about: {
        // Shelf photo frames sit on the left third; the About panel takes the right.
        position: [2.95, 1.75, 1.3],
        target: [2.3, 1.45, 5],
        distance: [3.2, 4.6],
        polar: [PI * 0.44, PI * 0.5],
        azimuth: [PI * 0.9, PI],
        truck: 0,
        fit: 1.5
    },
    desktop: {
        position: [2.1, 0.3, 2],
        target: [2.1, 0.3, 8],
        distance: [5.65, 7.1],
        polar: [PI * 0.5, PI * 0.5],
        azimuth: [PI, PI],
        truck: 0,
        fit: 1.78
    },
    laptop: {
        position: [2, 0, 2.5],
        target: [-2, -1, 5.2],
        distance: [4.2, 6],
        polar: [PI * 0.435, PI * 0.435],
        azimuth: [PI * 0.689, PI * 0.689],
        truck: 0,
        fit: 1.5
    },
    tv: {
        position: [2.5, -0.1, 1],
        target: [2.5, -0.1, -5],
        distance: [5.6, 6.5],
        polar: [PI * 0.5, PI * 0.5],
        azimuth: [0, 0],
        truck: 0,
        fit: 1.9
    },
    smartphone: {
        position: [1.7, -0.3, -0.85],
        target: [1.25, -9, -0.1],
        distance: [8.8, 9.2],
        polar: [PI * 0.03, PI * 0.036],
        azimuth: [PI * 0.83, PI * 0.845],
        truck: 0,
        fit: 0.75
    },
    displayBoard: {
        position: [-2, 0.12, -1.5],
        target: [-8, 0.12, -1.5],
        distance: [4, 8],
        polar: [PI * 0.4999, PI * 0.5],
        azimuth: [PI * 0.5, PI * 0.50001],
        truck: 0,
        dollyToCursor: true,
        fit: 1.6
    }
};

export const CameraManager = () => {
    const controls = useRef();
    const cameraState = useCameraStore((s) => s.cameraState);
    const entered = useRoomStore((s) => s.entered);
    const reducedMotion = useRoomStore((s) => s.reducedMotion);
    const aspect = useThree((s) => s.size.width / s.size.height);
    const isFirst = useRef(true);

    const presetName = entered ? cameraState : 'intro';

    useEffect(() => {
        const c = controls.current;
        if (!c) return;
        const p = PRESETS[presetName];
        const factor = Math.max(1, p.fit / aspect);

        let [px, py, pz] = p.position;
        let [tx, ty, tz] = p.target;
        if (presetName === 'intro') {
            // Slide the view so the room sits beside the title (landscape) or above it (portrait).
            // For this azimuth, screen-right is world (-x, -z).
            const [dx, dy, dz] = aspect > 1.1 ? [4.6, 0, 4.6] : [0, -4.5, 0];
            px += dx;
            py += dy;
            pz += dz;
            tx += dx;
            ty += dy;
            tz += dz;
        }
        const pos = [
            tx + (px - tx) * factor,
            ty + (py - ty) * factor,
            tz + (pz - tz) * factor
        ];

        c.minDistance = p.distance[0] * factor;
        c.maxDistance = p.distance[1] * factor;
        c.minPolarAngle = p.polar[0];
        c.maxPolarAngle = p.polar[1];
        c.minAzimuthAngle = p.azimuth[0];
        c.maxAzimuthAngle = p.azimuth[1];
        c.truckSpeed = p.truck;
        c.dollyToCursor = !!p.dollyToCursor;

        c.setLookAt(...pos, tx, ty, tz, !isFirst.current);
        isFirst.current = false;
    }, [presetName, aspect]);

    // Gentle drift behind the intro screen.
    useFrame(({ clock }) => {
        const c = controls.current;
        if (!c || entered || reducedMotion) return;
        c.azimuthAngle = PI * 0.75 + Math.sin(clock.elapsedTime * 0.12) * 0.08;
    });

    return (
        <CameraControls
            makeDefault
            ref={controls}
            dollySpeed={1.2}
            smoothTime={reducedMotion ? 0.2 : 0.8}
            draggingSmoothTime={0.15}
            polarRotateSpeed={0.3}
            azimuthRotateSpeed={0.3}
            maxSpeed={20}
            boundaryFriction={0}
            boundaryEnclosesCamera
        />
    );
};

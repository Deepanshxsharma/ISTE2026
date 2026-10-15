/* eslint-disable react/display-name */
/* eslint-disable react/prop-types */
import { Select } from '@react-three/postprocessing';
import React, { useEffect, useState } from 'react';
import * as THREE from 'three';

import { useAudioStore } from '../audio/engine';
import { TRACKS } from '../audio/tracks';
import { destination, useCameraStore } from '../helper/CameraStore';
import { useRoomStore } from '../helper/RoomStore';
import { useInteractive } from '../helper/useInteractive';
import LaptopDisp from './laptopDisp';
import ArcadeTv from './screens/ArcadeTv';
import PhoneRemote from './screens/PhoneRemote';
import RetroComputer from './screens/RetroComputer';
import {
    drawLaptopScreen,
    drawMonitorIdle,
    drawPhoneIdle,
    drawTvIdle
} from './screens/screenArt';
import { useCanvasTexture } from './screens/useCanvasTexture';

const BOARD_HIT_AREA = {
    geometry: new THREE.PlaneGeometry(1, 1),
    position: [-5.2, 2.95, -1.95],
    rotation: [0, Math.PI / 2, 0],
    scale: [2.8, 1.6, 1]
};

function ScreenMesh({ node, id, label, hint, map, children }) {
    const cameraState = useCameraStore((s) => s.cameraState);
    const go = useCameraStore((s) => s.go);
    const entered = useRoomStore((s) => s.entered);
    const [hovered, handlers] = useInteractive({
        id,
        label,
        hint,
        enabled: entered && cameraState === 'default',
        onSelect: () => go(id)
    });

    return (
        <Select enabled={hovered}>
            <mesh
                geometry={node.geometry}
                position={node.position}
                rotation={node.rotation}
                scale={node.scale}
                {...handlers}
            >
                {children || <meshBasicMaterial map={map} toneMapped={false} />}
            </mesh>
        </Select>
    );
}

function useMinuteTick() {
    const [tick, setTick] = useState(0);
    useEffect(() => {
        const id = setInterval(() => setTick((t) => t + 1), 30000);
        return () => clearInterval(id);
    }, []);
    return tick;
}

const DispFrame = React.memo(({ nodes }) => {
    const playing = useAudioStore((s) => s.playing);
    const trackIndex = useAudioStore((s) => s.trackIndex);
    const minute = useMinuteTick();

    const monitorTex = useCanvasTexture(drawMonitorIdle, [], {
        width: 1024,
        height: 576,
        mirrorX: true
    });
    const tvTex = useCanvasTexture(drawTvIdle, [], {
        width: 1024,
        height: 542,
        mirrorX: true
    });
    const phoneTex = useCanvasTexture(drawPhoneIdle, [minute], { width: 560, height: 1000 });
    const laptopTex = useCanvasTexture(
        (ctx, w, h) => drawLaptopScreen(ctx, w, h, { playing, track: TRACKS[trackIndex] }),
        [playing, trackIndex],
        { width: 1254, height: 745 }
    );

    return (
        <>
            <LaptopDisp nodes={nodes} />
            <PhoneRemote />
            <RetroComputer />
            <ArcadeTv />

            <ScreenMesh
                node={nodes.monitor}
                id="desktop"
                label={destination('desktop').object}
                hint={destination('desktop').hint}
                map={monitorTex}
            />
            <ScreenMesh
                node={nodes.laptop}
                id="laptop"
                label={destination('laptop').object}
                hint={destination('laptop').hint}
                map={laptopTex}
            />
            <ScreenMesh
                node={nodes.tvdisplay}
                id="tv"
                label={destination('tv').object}
                hint={destination('tv').hint}
                map={tvTex}
            />
            <ScreenMesh
                node={nodes.smartphoneDisp}
                id="smartphone"
                label={destination('smartphone').object}
                hint={destination('smartphone').hint}
                map={phoneTex}
            />
            <ScreenMesh
                node={BOARD_HIT_AREA}
                id="displayBoard"
                label={destination('displayBoard').object}
                hint={destination('displayBoard').hint}
            >
                <meshBasicMaterial transparent opacity={0} depthWrite={false} />
            </ScreenMesh>
        </>
    );
});

export default DispFrame;

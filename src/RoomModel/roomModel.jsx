/* eslint-disable react/display-name */
import { Center, useGLTF, useTexture } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import React, { useCallback, useMemo, useRef, useState } from 'react';

import { useCameraStore } from '../helper/CameraStore';
import { useRoomStore } from '../helper/RoomStore';
import TheamSwitch from '../Switch/TheamSwitch';
import Beacons from './Beacons';
import Clock from './clock';
import DispFrame from './DispFrame';
import DispItem from './dispItem';
import NeonGrid from './mood/NeonGrid';
import PhotoFrame from './photoFrame';
import { prepareBakedTexture, useBakedMaterial } from './textures/TextureMaterial';
import Windows from './Windows';

const ROOM_TEXTURES = [
    './assets/bakedTextureDaycmp.webp',
    './assets/roomTextureNightcmp.webp',
    './assets/roomTextureLightMapcmp.webp'
];

const RoomModel = React.memo(() => {
    const chairTop = useRef();
    const reducedMotion = useRoomStore((s) => s.reducedMotion);

    useFrame(({ clock }) => {
        if (chairTop.current && !reducedMotion) {
            chairTop.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.3);
        }
    });

    const roomModel = useGLTF('./assets/RoomModel.glb');
    const chair = useGLTF('./assets/chairtopDraco.glb');

    const [day, night, lightMap] = useTexture(ROOM_TEXTURES);
    useMemo(() => [day, night, lightMap].forEach((t) => prepareBakedTexture(t)), [day, night, lightMap]);
    const material = useBakedMaterial({ day, night, lightMap });

    const cameraState = useCameraStore((s) => s.cameraState);
    const goHome = useCameraStore((s) => s.default);

    // Clicking the room itself while zoomed in returns to the overview.
    const backOnClick = useCallback(
        (e) => {
            if (e.delta > 6) return;
            e.stopPropagation();
            goHome();
        },
        [goHome]
    );
    const furnitureBack = ['default', 'displayBoard', 'laptop'].includes(cameraState)
        ? undefined
        : backOnClick;
    const deskBack = cameraState === 'default' ? undefined : backOnClick;

    const [floorY, setFloorY] = useState(-3);
    const onCentered = useCallback(({ height }) => setFloorY(-height / 2 - 0.02), []);

    return (
        <group>
            <NeonGrid y={floorY} />
            <Center onCentered={onCentered}>
                <mesh
                    geometry={roomModel.nodes.roomFurniture.geometry}
                    position={roomModel.nodes.roomFurniture.position}
                    rotation={roomModel.nodes.roomFurniture.rotation}
                    material={material}
                    onClick={furnitureBack}
                />
                <mesh
                    geometry={roomModel.nodes.deskShelfStuf.geometry}
                    position={roomModel.nodes.deskShelfStuf.position}
                    rotation={roomModel.nodes.deskShelfStuf.rotation}
                    material={material}
                    onClick={deskBack}
                />
                <mesh
                    ref={chairTop}
                    geometry={chair.nodes.chairTop.geometry}
                    position={chair.nodes.chairTop.position}
                    rotation={chair.nodes.chairTop.rotation}
                    material={material}
                    onClick={deskBack}
                />
                <PhotoFrame nodes={roomModel.nodes} />
                <DispFrame nodes={roomModel.nodes} />
                <DispItem nodes={roomModel.nodes} />
                <Clock />
                <Windows nodes={roomModel.nodes} />
                <TheamSwitch nodes={roomModel.nodes} />
                <Beacons nodes={roomModel.nodes} scene={roomModel.scene} />
            </Center>
        </group>
    );
});

export default RoomModel;

useGLTF.preload('./assets/RoomModel.glb');
useGLTF.preload('./assets/chairtopDraco.glb');
useTexture.preload(ROOM_TEXTURES);

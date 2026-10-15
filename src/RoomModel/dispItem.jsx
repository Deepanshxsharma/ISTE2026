/* eslint-disable react/display-name */
/* eslint-disable react/prop-types */
import { useTexture } from '@react-three/drei';
import React, { useMemo } from 'react';

import WorkWall from './screens/WorkWall';
import { prepareBakedTexture, useBakedMaterial } from './textures/TextureMaterial';

// Polaroid cards hanging from the board's rope (separate nodes in the model).
const CARD_NODES = ['desktop', 'music', 'tv', 'smartphone', 'home'];

const DispItem = React.memo(({ nodes }) => {
    const [day, night, lightMap] = useTexture([
        './assets/boardPixelDay.png',
        './assets/boardPixelNight.png',
        './assets/boardBakedLMAPcmp.webp'
    ]);
    useMemo(() => {
        prepareBakedTexture(day, { pixelated: true });
        prepareBakedTexture(night, { pixelated: true });
        prepareBakedTexture(lightMap);
    }, [day, night, lightMap]);

    const material = useBakedMaterial({ day, night, lightMap, lightAmount: 0 });

    return (
        <>
            {['dispItem', ...CARD_NODES].map((name) => (
                <mesh
                    key={name}
                    geometry={nodes[name].geometry}
                    position={nodes[name].position}
                    rotation={nodes[name].rotation}
                    material={material}
                />
            ))}
            <mesh geometry={nodes.rope.geometry} position={nodes.rope.position} rotation={nodes.rope.rotation}>
                <meshBasicMaterial color={'#160000'} />
            </mesh>
            <WorkWall />
        </>
    );
});

export default DispItem;

useTexture.preload([
    './assets/boardPixelDay.png',
    './assets/boardPixelNight.png',
    './assets/boardBakedLMAPcmp.webp'
]);

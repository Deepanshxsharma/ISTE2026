/* eslint-disable react/display-name */
/* eslint-disable react/prop-types */
import { useTexture } from '@react-three/drei';
import { Select } from '@react-three/postprocessing';
import React, { useMemo } from 'react';

import { profile } from '../config/profile';
import { destination, useCameraStore } from '../helper/CameraStore';
import { useRoomStore } from '../helper/RoomStore';
import { useInteractive } from '../helper/useInteractive';
import { drawPhotoArt } from './screens/screenArt';
import { useCanvasTexture } from './screens/useCanvasTexture';
import { prepareBakedTexture, useBakedMaterial } from './textures/TextureMaterial';

const PhotoFrame = React.memo(({ nodes }) => {
    const art = useCanvasTexture((ctx, w, h) => drawPhotoArt(ctx, w, h, { initials: profile.initials }), [], {
        width: 512,
        height: 512,
        flipY: false
    });
    const lightMapFrame = useTexture('./assets/bakeFrameLightMapcmp.webp');
    useMemo(() => prepareBakedTexture(lightMapFrame), [lightMapFrame]);
    const material = useBakedMaterial({ day: art, night: art, lightMap: lightMapFrame });

    const cameraState = useCameraStore((s) => s.cameraState);
    const go = useCameraStore((s) => s.go);
    const entered = useRoomStore((s) => s.entered);
    const [hovered, handlers] = useInteractive({
        id: 'about',
        label: destination('about').object,
        hint: destination('about').hint,
        enabled: entered && cameraState === 'default',
        onSelect: () => go('about')
    });

    return (
        <Select enabled={hovered}>
            <mesh
                geometry={nodes.frame.geometry}
                position={nodes.frame.position}
                rotation={nodes.frame.rotation}
                material={material}
                {...handlers}
            />
        </Select>
    );
});

export default PhotoFrame;

useTexture.preload('./assets/bakeFrameLightMapcmp.webp');

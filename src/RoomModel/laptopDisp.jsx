/* eslint-disable react/display-name */
/* eslint-disable react/prop-types */
import { Select } from '@react-three/postprocessing';
import React, { useCallback, useLayoutEffect } from 'react';

import { musicSelect, useAudioStore } from '../audio/engine';
import { TRACKS } from '../audio/tracks';
import { useCameraStore } from '../helper/CameraStore';
import { useInteractive } from '../helper/useInteractive';
import { drawTrackTile } from './screens/screenArt';
import { useCanvasTexture } from './screens/useCanvasTexture';

function TrackTile({ node, index }) {
    const track = TRACKS[index];
    const playing = useAudioStore((s) => s.playing && s.trackIndex === index);
    const cameraState = useCameraStore((s) => s.cameraState);

    const texture = useCanvasTexture(
        (ctx, w, h) => drawTrackTile(ctx, w, h, { track, index, playing }),
        [playing],
        { width: 150, height: 1000 }
    );
    // The tiles were UV-unwrapped in two different orientations (1–3 vs 4–5).
    useLayoutEffect(() => {
        const axis = index < 3 ? 'x' : 'y';
        texture.repeat[axis] = -1;
        texture.offset[axis] = 1;
    }, [texture, index]);

    const onSelect = useCallback(() => musicSelect(index), [index]);
    const [hovered, handlers] = useInteractive({
        id: `track-${index}`,
        label: track.title,
        hint: playing ? 'Click to pause' : `Play · ${track.bpm} BPM`,
        enabled: cameraState === 'laptop',
        onSelect
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
                <meshBasicMaterial map={texture} toneMapped={false} />
            </mesh>
        </Select>
    );
}

const LaptopDisp = React.memo(({ nodes }) => (
    <>
        {['music1', 'music2', 'music3', 'music4', 'music5'].map((name, i) => (
            <TrackTile key={name} node={nodes[name]} index={i} />
        ))}
    </>
));

export default LaptopDisp;

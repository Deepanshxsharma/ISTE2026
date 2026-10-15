import { useEffect, useMemo, useState } from 'react';

import { sfx } from '../audio/engine';
import { useRoomStore } from './RoomStore';

// Pointer travel (px) above which a release counts as an orbit drag, not a click.
const DRAG_TOLERANCE = 6;

/**
 * Pointer handlers for a clickable 3D object: hover label, outline flag,
 * hover sound, and drag-safe click.
 */
export function useInteractive({ id, label, hint, enabled, onSelect }) {
    const [hovered, setHovered] = useState(false);

    useEffect(() => {
        if (!enabled && hovered) {
            setHovered(false);
            if (useRoomStore.getState().hover?.id === id) {
                useRoomStore.setState({ hover: null });
            }
        }
    }, [enabled, hovered, id]);

    const handlers = useMemo(() => {
        if (!enabled) return {};
        return {
            onPointerOver: (e) => {
                e.stopPropagation();
                setHovered(true);
                useRoomStore.setState({ hover: { id, label, hint } });
                sfx('hover');
            },
            onPointerOut: () => {
                setHovered(false);
                if (useRoomStore.getState().hover?.id === id) {
                    useRoomStore.setState({ hover: null });
                }
            },
            onClick: (e) => {
                e.stopPropagation();
                if (e.delta > DRAG_TOLERANCE) return;
                setHovered(false);
                useRoomStore.setState({ hover: null });
                onSelect?.();
            }
        };
    }, [enabled, id, label, hint, onSelect]);

    return [hovered, handlers];
}

/* eslint-disable react/prop-types */

const stop = (e) => e.stopPropagation();

/**
 * Root for HTML rendered onto an in-room screen. Stops pointer/wheel events from
 * reaching the 3D canvas so the camera doesn't orbit and objects behind aren't clicked.
 */
export default function ScreenShell({ className = '', width, height, label, children }) {
    return (
        <div
            className={`screen ${className}`}
            style={{ width, height }}
            role="region"
            aria-label={label}
            onPointerDown={stop}
            onPointerUp={stop}
            onPointerMove={stop}
            onClick={stop}
            onDoubleClick={stop}
            onWheel={stop}
            onContextMenu={stop}
        >
            {children}
        </div>
    );
}

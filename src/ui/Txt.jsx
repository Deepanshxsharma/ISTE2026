/* eslint-disable react/prop-types */

/** Renders config text, visibly flagging any `[placeholder]` segments so they get replaced. */
export default function Txt({ children }) {
    if (typeof children !== 'string' || !children.includes('[')) return children;
    return children.split(/(\[[^\]]*\])/g).map((part, i) =>
        part.startsWith('[') && part.endsWith(']') ? (
            <span key={i} className="placeholder" title="Placeholder — edit src/config/profile.js">
                {part.slice(1, -1)}
            </span>
        ) : (
            part
        )
    );
}

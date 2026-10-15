/* eslint-disable react/prop-types */
const Svg = ({ children, size = 18 }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        focusable="false"
    >
        {children}
    </svg>
);

export const IconSound = (p) => (
    <Svg {...p}>
        <path d="M4 9v6h4l5 4V5L8 9H4z" />
        <path d="M16.5 8.5a5 5 0 0 1 0 7" />
        <path d="M19 6a8.5 8.5 0 0 1 0 12" />
    </Svg>
);

export const IconMute = (p) => (
    <Svg {...p}>
        <path d="M4 9v6h4l5 4V5L8 9H4z" />
        <path d="M17 9l5 6M22 9l-5 6" />
    </Svg>
);

export const IconPlay = (p) => (
    <Svg {...p}>
        <path d="M7 5l12 7-12 7V5z" fill="currentColor" stroke="none" />
    </Svg>
);

export const IconPause = (p) => (
    <Svg {...p}>
        <rect x="6" y="5" width="4" height="14" rx="1" fill="currentColor" stroke="none" />
        <rect x="14" y="5" width="4" height="14" rx="1" fill="currentColor" stroke="none" />
    </Svg>
);

export const IconNext = (p) => (
    <Svg {...p}>
        <path d="M6 5l9 7-9 7V5z" fill="currentColor" stroke="none" />
        <path d="M18 5v14" />
    </Svg>
);

export const IconPrev = (p) => (
    <Svg {...p}>
        <path d="M18 5l-9 7 9 7V5z" fill="currentColor" stroke="none" />
        <path d="M6 5v14" />
    </Svg>
);

export const IconBack = (p) => (
    <Svg {...p}>
        <path d="M15 5l-7 7 7 7" />
    </Svg>
);

export const IconHelp = (p) => (
    <Svg {...p}>
        <circle cx="12" cy="12" r="9" />
        <path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6v.6" />
        <path d="M12 17.5h.01" />
    </Svg>
);

export const IconClose = (p) => (
    <Svg {...p}>
        <path d="M6 6l12 12M18 6L6 18" />
    </Svg>
);

export const IconMusic = (p) => (
    <Svg {...p}>
        <path d="M9 18V6l11-2v12" />
        <circle cx="6.5" cy="18" r="2.5" />
        <circle cx="17.5" cy="16" r="2.5" />
    </Svg>
);

/*
 * Everything personal on the site lives in this file.
 *
 * Rules for editing:
 *  - Text wrapped in [square brackets] is a placeholder. In `npm run dev` it is highlighted
 *    so you can spot it; in a production build any entry that still contains a placeholder
 *    (or an empty url) is hidden, so visitors never see dead links or template text.
 *  - `evidence` on each project records where its description came from, so it stays honest.
 *    'code'      → checked against the project's source code on this Mac.
 *    'described' → from Deepansh's own description; no source was available to check.
 *  - Do not add numbers (accuracy, users, speed) unless you can back them up.
 */

export const profile = {
    name: 'Deepansh Sharma',
    handle: 'DEEPANSH.SHARMA',
    initials: 'DS',
    title: 'Beyond the screen',
    tagline: 'Building applications, intelligent systems, and interactive experiences.',
    kicker: 'Interactive 3D portfolio',
    role: 'CSE student · app developer',
    headline: 'I build things that connect code to the real world.',
    intro: "I'm Deepansh Sharma, a Computer Science student exploring application development, intelligent systems, computer vision, and interactive experiences. I enjoy turning ideas into projects that combine software, design, and technology.",

    education: {
        degree: 'B.Tech, Computer Science and Engineering',
        school: 'SRM University',
        campus: '[Campus — e.g. Delhi-NCR]',
        years: '[Years — e.g. 2023 – 2027]'
    },

    about: [
        "I'm a B.Tech Computer Science and Engineering student at SRM University. I learn best by building things that have to work outside a tutorial — an app needs an API, the API needs data, and sometimes the data has to come from a camera.",
        "Right now most of that is parking: the TechXPark booking flow in the TechXpert Flutter app, the API behind it, and camera experiments that read number plates and work out which slots are free.",
        "On the side I experiment with AI assistants on the Gemini API, and I'm exploring how small boards like the ESP8266 can feed real-world signals into the software I write."
    ],

    interests: ['Full-stack apps', 'Mobile UI', 'Computer vision', 'AI assistants', 'IoT'],

    now: [
        { k: 'Building', v: 'The TechXPark parking flow and its ANPR gate pipeline' },
        { k: 'Exploring', v: 'Voice assistants with Gemini native audio' },
        { k: 'Next', v: '[What do you want to build next?]' }
    ],

    categories: [
        { id: 'apps', label: 'Application Development' },
        { id: 'vision', label: 'Smart Parking & Vision' },
        { id: 'ai', label: 'AI Experiments' },
        { id: 'iot', label: 'Hardware & IoT' }
    ],

    /*
     * tier: 'featured' (one), 'secondary', or 'experiment'.
     * art:  which original illustration to draw (see src/ui/ProjectArt.jsx).
     * links: [{ label, url }] — leave url empty until you have a real, public link.
     */
    projects: [
        {
            id: 'my-parking',
            title: 'TechXpert My Parking',
            subtitle: 'The TechXPark parking module of the TechXpert Flutter app',
            category: 'apps',
            tier: 'featured',
            status: 'In development',
            art: 'parking',
            evidence: 'code',
            summary:
                'Find a parking lot, pick a slot and a time, choose how to pay, and walk away with a QR ticket and a live timer you can extend.',
            story: "This is where my projects meet. The app is the front door; the vision experiments are how the parking lot itself could see who arrives and which slots are free.",
            highlights: [
                'Lot search and details with Google Maps',
                'Slot selection, booking time and payment selection',
                'QR ticket, scan confirmation and a live parking timer with time extension',
                'My bookings, saved vehicles and an indoor navigation screen'
            ],
            stack: ['Flutter', 'Dart', 'Riverpod', 'GoRouter', 'Dio', 'Google Maps', 'QR', 'Firebase Messaging', 'Node.js API'],
            notes: 'The parking API is a Node.js + Express + TypeScript service that is replacing an older PHP back end. An earlier version of the app was built with Ionic and Angular.',
            links: [
                { label: 'Source', url: '' },
                { label: 'App Store / Play Store', url: '' }
            ]
        },
        {
            id: 'anpr',
            title: 'TechXPark ANPR',
            subtitle: 'Number-plate recognition for parking gates',
            category: 'vision',
            tier: 'secondary',
            status: 'Prototype',
            art: 'anpr',
            evidence: 'code',
            summary:
                'A camera at the gate grabs frames, YOLOv8 finds the plate, PaddleOCR reads it, and the result goes to the parking API.',
            pipeline: [
                { stage: 'Camera', tool: 'OpenCV stream + capture' },
                { stage: 'Detect', tool: 'YOLOv8 (vehicle + plate)' },
                { stage: 'Read', tool: 'PaddleOCR' },
                { stage: 'Result', tool: 'Sent to the parking API' }
            ],
            highlights: ['Separate entry and exit runners', 'Annotated captures saved for debugging'],
            stack: ['Python', 'OpenCV', 'YOLOv8', 'PaddleOCR', 'REST API'],
            links: [{ label: 'Source', url: '' }]
        },
        {
            id: 'occupancy',
            title: 'Parking Occupancy Detector',
            subtitle: 'Which slots are free, from one camera',
            category: 'vision',
            tier: 'secondary',
            status: 'Prototype',
            art: 'occupancy',
            evidence: 'code',
            summary:
                'YOLOv8 finds vehicles, ByteTrack follows them between frames, and a calibrated slot map turns that into free / occupied status for the API.',
            pipeline: [
                { stage: 'Camera', tool: 'Frame capture' },
                { stage: 'Track', tool: 'YOLOv8 + ByteTrack' },
                { stage: 'Map', tool: 'Calibrated slot zones' },
                { stage: 'Publish', tool: 'Smoothed status → API' }
            ],
            highlights: ['Slot calibration tool for a new camera angle', 'Temporal smoothing so a passing car does not flip a slot'],
            stack: ['Python', 'YOLOv8', 'ByteTrack', 'OpenCV'],
            links: [{ label: 'Source', url: '' }]
        },
        {
            id: 'hi-techxpert',
            title: 'Hi TechXPert',
            subtitle: 'An assistant for employee-facing workflows',
            category: 'ai',
            tier: 'secondary',
            status: 'Prototype',
            art: 'assistant',
            evidence: 'described',
            summary:
                'An AI assistant prototype for employee-facing workflows, built on the Gemini API while I experiment with different Gemini models.',
            highlights: [],
            stack: ['Gemini API'],
            links: [{ label: 'Source', url: '' }]
        },
        {
            id: 'jarvis',
            title: 'Jarvis',
            subtitle: 'A personal voice assistant on my Mac',
            category: 'ai',
            tier: 'experiment',
            status: 'Experiment · in progress',
            art: 'voice',
            evidence: 'described',
            summary:
                'A personal assistant I run locally, experimenting with Gemini native audio for voice conversation and connecting it to tools it can use.',
            highlights: [],
            stack: ['Gemini native audio', 'Tool integration', 'macOS'],
            links: [{ label: 'Source', url: '' }]
        },
        {
            id: 'iot',
            title: '[Your ESP8266 / IoT project]',
            subtitle: '[One line about it]',
            category: 'iot',
            tier: 'experiment',
            status: '[Status]',
            art: 'iot',
            evidence: 'described',
            summary: '[What did you connect, and what did it do?]',
            highlights: [],
            stack: ['ESP8266', 'Sensors', 'MQTT'],
            links: [{ label: 'Source', url: '' }]
        }
    ],

    /*
     * level: 'used'     → used in a project listed here (see `where`)
     *        'explored' → tried / learning, no finished project to point to yet
     */
    skills: [
        {
            group: 'Apps & frontend',
            items: [
                { name: 'Flutter · Dart', level: 'used', where: 'My Parking app' },
                { name: 'Riverpod · GoRouter', level: 'used', where: 'My Parking app' },
                { name: 'Ionic · Angular', level: 'used', where: 'Earlier TechXpert app' },
                { name: 'React · Three.js', level: 'used', where: 'This portfolio' },
                { name: 'HTML · CSS · JavaScript', level: 'used', where: 'This portfolio' }
            ]
        },
        {
            group: 'Back end & data',
            items: [
                { name: 'Node.js · Express · TypeScript', level: 'used', where: 'TechXPark API' },
                { name: 'PHP · MySQL', level: 'used', where: 'Older parking back end' },
                { name: 'Firebase', level: 'used', where: 'Push notifications' },
                { name: 'REST APIs', level: 'used', where: 'App ⇄ API ⇄ ANPR' }
            ]
        },
        {
            group: 'AI & computer vision',
            items: [
                { name: 'Python', level: 'used', where: 'ANPR, occupancy' },
                { name: 'OpenCV', level: 'used', where: 'Camera capture' },
                { name: 'YOLOv8', level: 'used', where: 'Plate & vehicle detection' },
                { name: 'ByteTrack', level: 'used', where: 'Occupancy tracking' },
                { name: 'PaddleOCR', level: 'used', where: 'Plate reading' },
                { name: 'Gemini API', level: 'used', where: 'Assistant experiments' }
            ]
        },
        {
            group: 'IoT & hardware',
            items: [
                { name: 'ESP8266', level: 'explored' },
                { name: 'Sensor integration', level: 'explored' },
                { name: 'MQTT', level: 'explored' }
            ]
        }
    ],

    contact: [
        { label: 'Email', value: 'deepanshsharma622@gmail.com', url: 'mailto:deepanshsharma622@gmail.com' },
        { label: 'GitHub', value: '[github.com/your-username]', url: '' },
        { label: 'LinkedIn', value: '[linkedin.com/in/your-profile]', url: '' }
    ],

    /** Mood the room fades into after "Enter": 'day' | 'night' | 'overdrive'. */
    defaultMood: 'night',

    credits: [
        {
            what: 'Design, interface, DS//OS, Work wall, mood lighting, Neon Breaker and the synth soundtrack',
            who: 'Deepansh Sharma',
            url: '',
            note: 'Drawn and generated in code — no third-party images, ROMs or music.'
        },
        {
            what: '3D room model and baked lighting',
            who: 'Ashutosh Tripathi — Room Portfolio',
            url: 'https://github.com/AT010303/Room_Portfolio',
            note: ''
        },
        {
            what: 'Typefaces: Space Grotesk, JetBrains Mono, VT323',
            who: 'SIL Open Font License 1.1, via Fontsource',
            url: 'https://fontsource.org',
            note: ''
        }
    ]
};

const PLACEHOLDER = /\[[^\]]*\]/;
export const SHOW_DRAFTS = import.meta.env.DEV;

/** True when a value is real content (not empty, not a [placeholder]). */
export const isFilled = (value) => typeof value === 'string' && value.trim() !== '' && !PLACEHOLDER.test(value);

/** Drafts (placeholder entries) are shown in dev so you can fill them in, hidden in production. */
export const visible = (value) => SHOW_DRAFTS || isFilled(value);

export const projectsVisible = () => profile.projects.filter((p) => visible(p.title) && visible(p.summary));
export const projectById = (id) => profile.projects.find((p) => p.id === id);
export const categoryLabel = (id) => profile.categories.find((c) => c.id === id)?.label ?? id;
export const contactVisible = () => profile.contact.filter((c) => (SHOW_DRAFTS ? true : isFilled(c.value) && isFilled(c.url)));
export const linksOf = (project) => project.links.filter((l) => isFilled(l.url));

/* eslint-disable react/display-name */
/* eslint-disable react/prop-types */
import { Html } from '@react-three/drei';
import React, { useEffect, useRef, useState } from 'react';

import { musicNext, musicSelect, musicToggle, sfx, useAudioStore } from '../../audio/engine';
import { TRACKS } from '../../audio/tracks';
import { MOOD_ORDER, MOODS } from '../../config/moods';
import {
    categoryLabel,
    linksOf,
    profile,
    projectById,
    projectsVisible,
    visible
} from '../../config/profile';
import { useCameraStore } from '../../helper/CameraStore';
import { useOsStore } from '../../helper/OsStore';
import { useRoomStore } from '../../helper/RoomStore';
import ContactList from '../../ui/ContactList';
import ProjectArt from '../../ui/ProjectArt';
import Txt from '../../ui/Txt';
import ScreenShell from './ScreenShell';

const APPS = [
    { id: 'projects', label: 'Projects', file: 'projects/' },
    { id: 'skills', label: 'Stack', file: 'stack.cfg' },
    { id: 'about', label: 'About', file: 'readme.md' },
    { id: 'contact', label: 'Contact', file: 'contact.lnk' },
    { id: 'lights', label: 'Lights', file: 'mood.ctl' },
    { id: 'radio', label: 'Radio', file: 'synth.fm' },
    { id: 'credits', label: 'Credits', file: 'credits.md' }
];

const BOOT_LINES = [
    `DS//OS — ${profile.name.toLowerCase()}`,
    'mounting /projects ........... ok',
    'loading /stack ............... ok',
    'warming CRT phosphor ......... ok',
    'welcome.'
];

let bootedThisSession = false;

function useClock() {
    const [now, setNow] = useState(() => new Date());
    useEffect(() => {
        const id = setInterval(() => setNow(new Date()), 15000);
        return () => clearInterval(id);
    }, []);
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function Status({ children }) {
    return (
        <span className="os-status">
            <Txt>{children}</Txt>
        </span>
    );
}

function Pipeline({ steps }) {
    return (
        <ol className="os-pipeline" aria-label="Pipeline">
            {steps.map((s, i) => (
                <li key={s.stage} className="os-stage" style={{ '--i': i }}>
                    <span className="os-stage__n">{String(i + 1).padStart(2, '0')}</span>
                    <span className="os-stage__name">{s.stage}</span>
                    <span className="os-stage__tool">{s.tool}</span>
                </li>
            ))}
        </ol>
    );
}

function ProjectDetail({ project, onBack }) {
    const links = linksOf(project);
    return (
        <article className="os-detail">
            <button type="button" className="os-back" onClick={onBack}>
                ← All projects
            </button>
            <div className="os-detail__head">
                <div className="os-detail__art">
                    <ProjectArt kind={project.art} />
                </div>
                <div>
                    <p className="os-eyebrow">{categoryLabel(project.category)}</p>
                    <h2 className="os-title">
                        <Txt>{project.title}</Txt>
                    </h2>
                    <p className="os-meta">
                        <Txt>{project.subtitle}</Txt>
                    </p>
                    <Status>{project.status}</Status>
                </div>
            </div>
            <p className="os-body os-body--lead">
                <Txt>{project.summary}</Txt>
            </p>
            {project.story && <p className="os-body">{project.story}</p>}
            {project.pipeline && <Pipeline steps={project.pipeline} />}
            {project.highlights.length > 0 && (
                <ul className="os-highlights">
                    {project.highlights.map((h) => (
                        <li key={h}>{h}</li>
                    ))}
                </ul>
            )}
            <p className="os-tags">
                {project.stack.map((t) => (
                    <span key={t} className="os-tag">
                        {t}
                    </span>
                ))}
            </p>
            {project.notes && <p className="os-note">{project.notes}</p>}
            {links.length > 0 && (
                <p className="os-row">
                    {links.map((l) => (
                        <a key={l.label} className="os-btn" href={l.url} target="_blank" rel="noreferrer">
                            {l.label} ↗
                        </a>
                    ))}
                </p>
            )}
        </article>
    );
}

function Projects() {
    const projectId = useOsStore((s) => s.projectId);
    const category = useOsStore((s) => s.category);
    const setProject = useOsStore((s) => s.setProject);
    const setCategory = useOsStore((s) => s.setCategory);
    const all = projectsVisible();
    const project = projectId && projectById(projectId);

    if (project) return <ProjectDetail project={project} onBack={() => setProject(null)} />;

    const shown = category === 'all' ? all : all.filter((p) => p.category === category);
    const filters = [{ id: 'all', label: 'All' }, ...profile.categories.filter((c) => all.some((p) => p.category === c.id))];

    return (
        <div className="os-doc">
            <p className="os-eyebrow">projects/ — things I&apos;ve built and things I&apos;m testing</p>
            <div className="os-filters" role="group" aria-label="Filter projects">
                {filters.map((c) => (
                    <button
                        key={c.id}
                        type="button"
                        className={`os-filter ${category === c.id ? 'is-on' : ''}`}
                        aria-pressed={category === c.id}
                        onClick={() => setCategory(c.id)}
                    >
                        {c.label}
                    </button>
                ))}
            </div>
            <ul className="os-grid">
                {shown.map((p) => (
                    <li key={p.id} className={`os-card os-card--${p.tier}`}>
                        <button type="button" className="os-card__btn" onClick={() => setProject(p.id)}>
                            <span className="os-card__art">
                                <ProjectArt kind={p.art} />
                            </span>
                            <span className="os-card__body">
                                <span className="os-card__top">
                                    <span className="os-card__cat">{categoryLabel(p.category)}</span>
                                    {p.tier === 'featured' && <span className="os-card__flag">Featured</span>}
                                </span>
                                <span className="os-card__title">
                                    <Txt>{p.title}</Txt>
                                </span>
                                <span className="os-card__sum">
                                    <Txt>{p.summary}</Txt>
                                </span>
                                <span className="os-card__foot">
                                    <Status>{p.status}</Status>
                                    <span className="os-card__open">Open →</span>
                                </span>
                            </span>
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
}

function Skills() {
    return (
        <div className="os-doc">
            <p className="os-eyebrow">stack.cfg — what I&apos;ve used, and where</p>
            <h2 className="os-title">Tools I build with.</h2>
            <p className="os-body">
                Grouped by what they do. Each one points to the project I used it in; the ones marked
                &nbsp;<span className="os-level os-level--explored">exploring</span>&nbsp; I&apos;m still learning.
            </p>
            <div className="os-skills">
                {profile.skills.map((g) => (
                    <section key={g.group} className="os-skillgroup">
                        <h3>{g.group}</h3>
                        <ul>
                            {g.items.map((s) => (
                                <li key={s.name}>
                                    <span className="os-skill__name">{s.name}</span>
                                    {s.level === 'explored' ? (
                                        <span className="os-level os-level--explored">exploring</span>
                                    ) : (
                                        <span className="os-skill__where">{s.where}</span>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </section>
                ))}
            </div>
        </div>
    );
}

function About() {
    const go = useCameraStore((s) => s.go);
    const { education } = profile;
    return (
        <article className="os-doc">
            <p className="os-eyebrow">readme.md</p>
            <h2 className="os-title">{profile.name}</h2>
            <p className="os-meta">
                {education.degree} · {education.school}
                {visible(education.campus) && (
                    <>
                        {' '}
                        · <Txt>{education.campus}</Txt>
                    </>
                )}
            </p>
            {profile.about.map((line) => (
                <p key={line} className="os-body">
                    {line}
                </p>
            ))}
            <p className="os-row">
                <button type="button" className="os-btn os-btn--ghost" onClick={() => go('about')}>
                    Read the longer version on the shelf →
                </button>
            </p>
        </article>
    );
}

function Lights() {
    const mood = useRoomStore((s) => s.mood);
    const setMood = useRoomStore((s) => s.setMood);
    const transitioning = useRoomStore((s) => s.moodTransitioning);
    return (
        <div className="os-doc">
            <p className="os-eyebrow">mood.ctl — {transitioning ? 'wave in progress…' : 'standing by'}</p>
            <h2 className="os-title">Repaint the room with light.</h2>
            <p className="os-body">
                Pick a mood. A wave of light leaves the switch by the TV and rewrites every surface it touches.
            </p>
            <div className="os-moods" role="radiogroup" aria-label="Room mood">
                {MOOD_ORDER.map((id) => (
                    <button
                        key={id}
                        type="button"
                        role="radio"
                        aria-checked={mood === id}
                        className={`os-mood os-mood--${id} ${mood === id ? 'is-on' : ''}`}
                        onClick={() => setMood(id)}
                    >
                        <span className="os-mood__swatch" aria-hidden="true" />
                        <span className="os-mood__name">{MOODS[id].label}</span>
                        <span className="os-mood__desc">{MOODS[id].description}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}

function Radio() {
    const playing = useAudioStore((s) => s.playing);
    const index = useAudioStore((s) => s.trackIndex);
    return (
        <div className="os-doc">
            <p className="os-eyebrow">synth.fm — original, generated live in your browser</p>
            <ol className="os-tracks">
                {TRACKS.map((t, i) => (
                    <li key={t.id}>
                        <button
                            type="button"
                            className={`os-track ${index === i && playing ? 'is-on' : ''}`}
                            onClick={() => musicSelect(i)}
                            style={{ '--accent': t.color }}
                        >
                            <span className="os-track__n">{String(i + 1).padStart(2, '0')}</span>
                            <span className="os-track__t">{t.title}</span>
                            <span className="os-track__b">{t.bpm} BPM</span>
                            <span className="os-track__s" aria-hidden="true">
                                {index === i && playing ? '❚❚' : '▶'}
                            </span>
                        </button>
                    </li>
                ))}
            </ol>
            <div className="os-row">
                <button type="button" className="os-btn" onClick={musicToggle}>
                    {playing ? 'Pause' : 'Play'}
                </button>
                <button type="button" className="os-btn" onClick={musicNext}>
                    Next track
                </button>
            </div>
        </div>
    );
}

function Contact() {
    return (
        <div className="os-doc">
            <p className="os-eyebrow">contact.lnk</p>
            <h2 className="os-title">Let&apos;s talk.</h2>
            <p className="os-body">
                Questions about a project, an idea to build together, or an internship — email is the fastest way to reach me.
            </p>
            <ContactList className="os-contact" />
        </div>
    );
}

function Credits() {
    return (
        <div className="os-doc">
            <p className="os-eyebrow">credits.md</p>
            <ul className="os-credits">
                {profile.credits.map((c) => (
                    <li key={c.what}>
                        <p className="os-credits__what">{c.what}</p>
                        <p className="os-body">
                            {c.url ? (
                                <a href={c.url} target="_blank" rel="noreferrer" className="os-link">
                                    {c.who}
                                </a>
                            ) : (
                                c.who
                            )}
                        </p>
                        {c.note && <p className="os-note">{c.note}</p>}
                    </li>
                ))}
            </ul>
        </div>
    );
}

const VIEWS = {
    projects: Projects,
    skills: Skills,
    about: About,
    contact: Contact,
    lights: Lights,
    radio: Radio,
    credits: Credits
};

function DeepOS() {
    const reduced = useRoomStore((s) => s.reducedMotion);
    const goHome = useCameraStore((s) => s.default);
    const [booting, setBooting] = useState(!bootedThisSession && !reduced);
    const app = useOsStore((s) => s.app);
    const projectId = useOsStore((s) => s.projectId);
    const open = useOsStore((s) => s.open);
    const clock = useClock();
    const mood = useRoomStore((s) => s.mood);
    const firstTab = useRef();
    const main = useRef();

    useEffect(() => {
        if (!booting) return;
        const id = setTimeout(() => {
            bootedThisSession = true;
            setBooting(false);
        }, 1400);
        return () => clearTimeout(id);
    }, [booting]);

    useEffect(() => {
        if (!booting) firstTab.current?.focus({ preventScroll: true });
    }, [booting]);

    useEffect(() => {
        main.current?.scrollTo(0, 0);
    }, [app, projectId]);

    const View = VIEWS[app] || Projects;
    const file = APPS.find((a) => a.id === app)?.file;

    return (
        <ScreenShell className="os" width={1511} height={852} label={`${profile.name}'s computer`}>
            {booting ? (
                <div className="os-boot" aria-live="polite">
                    {BOOT_LINES.map((l, i) => (
                        <p key={l} style={{ animationDelay: `${i * 220}ms` }}>
                            {l}
                        </p>
                    ))}
                </div>
            ) : (
                <div className="os-desktop">
                    <header className="os-bar">
                        <span className="os-brand">
                            <span className="os-brand__mark" aria-hidden="true" />
                            DS//OS
                        </span>
                        <span className="os-bar__mid">
                            ~/{profile.handle.toLowerCase()}/{file}
                            {app === 'projects' && projectId ? projectId : ''}
                        </span>
                        <span className="os-bar__right">
                            <span className={`os-chip os-chip--${mood}`}>{MOODS[mood]?.label}</span>
                            <span>{clock}</span>
                            <button type="button" className="os-close" onClick={goHome} aria-label="Close computer and return to the room">
                                ✕
                            </button>
                        </span>
                    </header>
                    <nav className="os-side" aria-label="Apps">
                        {APPS.map((a, i) => (
                            <button
                                key={a.id}
                                ref={i === 0 ? firstTab : undefined}
                                type="button"
                                className={`os-app ${app === a.id ? 'is-on' : ''}`}
                                aria-current={app === a.id ? 'page' : undefined}
                                onClick={() => {
                                    sfx('click');
                                    open(a.id);
                                }}
                            >
                                <span className="os-app__glyph" aria-hidden="true">
                                    {String(i + 1).padStart(2, '0')}
                                </span>
                                {a.label}
                            </button>
                        ))}
                        <p className="os-side__foot">Esc · back to room</p>
                    </nav>
                    <main className="os-main" key={`${app}-${projectId}`} ref={main}>
                        <View />
                    </main>
                </div>
            )}
            <div className="crt-overlay" aria-hidden="true" />
        </ScreenShell>
    );
}

const RetroComputer = React.memo(() => {
    const isDesktop = useCameraStore((s) => s.cameraState === 'desktop');
    if (!isDesktop) return null;
    return (
        <Html
            rotation-y={Math.PI}
            transform
            wrapperClass="htmlScreen"
            distanceFactor={0.52}
            occlude="blending"
            position={[2.125, 3.03, 3.69]}
            zIndexRange={[2, 1]}
        >
            <DeepOS />
        </Html>
    );
});

export default RetroComputer;

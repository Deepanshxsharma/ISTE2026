/* eslint-disable react/prop-types */
import React from 'react';

import { categoryLabel, linksOf, profile, projectsVisible } from '../config/profile';
import ContactList from './ContactList';
import Txt from './Txt';

/** Text-only version of the portfolio for browsers without WebGL (or after a crash). */
export function StaticPortfolio({ title, message, action }) {
    return (
        <main className="fallback">
            <p className="intro__kicker">{profile.kicker}</p>
            <h1 className="fallback__title">{profile.handle}</h1>
            <div className="fallback__notice" role="alert">
                <p className="fallback__notice-title">{title}</p>
                <p>{message}</p>
                {action}
            </div>

            <section>
                <h2>About</h2>
                <p className="fallback__lead">{profile.headline}</p>
                <p className="fallback__muted">
                    {profile.education.degree} · {profile.education.school}
                </p>
                {profile.about.map((p) => (
                    <p key={p}>{p}</p>
                ))}
            </section>

            <section>
                <h2>Projects</h2>
                <ul className="fallback__list">
                    {projectsVisible().map((p) => (
                        <li key={p.id}>
                            <strong>
                                <Txt>{p.title}</Txt>
                            </strong>{' '}
                            <span className="fallback__muted">
                                {categoryLabel(p.category)} · <Txt>{p.status}</Txt>
                            </span>
                            <p>
                                <Txt>{p.summary}</Txt>
                            </p>
                            <p className="fallback__muted">{p.stack.join(' · ')}</p>
                            {linksOf(p).map((l) => (
                                <a key={l.label} href={l.url}>
                                    {l.label}
                                </a>
                            ))}
                        </li>
                    ))}
                </ul>
            </section>

            <section>
                <h2>Contact</h2>
                <ContactList className="fallback__list" keyClass="fallback__muted" linkClass="" />
            </section>
        </main>
    );
}

export class SceneErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { error: null };
    }

    static getDerivedStateFromError(error) {
        return { error };
    }

    componentDidCatch(error) {
        console.error('[portfolio] scene failed:', error);
    }

    render() {
        if (this.state.error) {
            return (
                <div className="fallback-layer">
                    <StaticPortfolio
                        title="The room couldn’t load."
                        message="A 3D asset failed to load or the graphics context was lost. You can retry, or read everything below."
                        action={
                            <button type="button" className="intro__enter is-small" onClick={() => window.location.reload()}>
                                <span className="intro__enter-label">Reload</span>
                            </button>
                        }
                    />
                </div>
            );
        }
        return this.props.children;
    }
}

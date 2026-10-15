/* eslint-disable react/display-name */
/* eslint-disable react/prop-types */
import { Html } from '@react-three/drei';
import React from 'react';

import { categoryLabel, profile, projectsVisible } from '../../config/profile';
import { useCameraStore } from '../../helper/CameraStore';
import { useOsStore } from '../../helper/OsStore';
import ProjectArt from '../../ui/ProjectArt';
import Txt from '../../ui/Txt';
import ScreenShell from './ScreenShell';

function openOnComputer(id) {
    useOsStore.getState().open('projects', id);
    useCameraStore.getState().go('desktop');
}

function Card({ project, size }) {
    return (
        <article className={`wall-card wall-card--${size}`}>
            <div className="wall-card__art">
                <ProjectArt kind={project.art} />
            </div>
            <div className="wall-card__body">
                <p className="wall-card__cat">
                    {categoryLabel(project.category)} · <Txt>{project.status}</Txt>
                </p>
                <h3 className="wall-card__title">
                    <Txt>{project.title}</Txt>
                </h3>
                <p className="wall-card__sum">
                    <Txt>{project.summary}</Txt>
                </p>
                <p className="wall-card__stack">{project.stack.slice(0, size === 'feature' ? 6 : 3).join(' · ')}</p>
                <button type="button" className="wall-card__open" onClick={() => openOnComputer(project.id)}>
                    Details on the computer →
                </button>
            </div>
        </article>
    );
}

function Wall() {
    const go = useCameraStore((s) => s.go);
    const all = projectsVisible();
    const featured = all.find((p) => p.tier === 'featured');
    const secondary = all.filter((p) => p.tier === 'secondary');
    const experiments = all.filter((p) => p.tier === 'experiment');

    return (
        <ScreenShell className="wall" width={1400} height={800} label="Work wall: featured projects">
            <header className="wall__head">
                <div>
                    <p className="wall__eyebrow">Work wall</p>
                    <h2 className="wall__title">What I&apos;m building</h2>
                </div>
                <button type="button" className="wall__back" onClick={() => go('default')}>
                    Back to room
                </button>
            </header>
            <div className="wall__grid">
                {featured && <Card project={featured} size="feature" />}
                <div className="wall__col">
                    {secondary.map((p) => (
                        <Card key={p.id} project={p} size="small" />
                    ))}
                </div>
            </div>
            {experiments.length > 0 && (
                <footer className="wall__lab">
                    <span className="wall__lab-k">In the lab</span>
                    {experiments.map((p) => (
                        <button key={p.id} type="button" className="wall__chip" onClick={() => openOnComputer(p.id)}>
                            <Txt>{p.title}</Txt>
                            <span>
                                <Txt>{p.status}</Txt>
                            </span>
                        </button>
                    ))}
                    <span className="wall__lab-note">{profile.categories.length} areas · all details on the computer</span>
                </footer>
            )}
        </ScreenShell>
    );
}

const WorkWall = React.memo(() => {
    const active = useCameraStore((s) => s.cameraState === 'displayBoard');
    if (!active) return null;
    return (
        <Html
            transform
            position={[-5.12, 2.9, -1.95]}
            rotation-y={Math.PI / 2}
            distanceFactor={0.7}
            zIndexRange={[2, 1]}
        >
            <Wall />
        </Html>
    );
});

export default WorkWall;

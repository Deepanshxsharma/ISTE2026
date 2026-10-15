import { useEffect, useRef } from 'react';

import { profile, visible } from '../config/profile';
import { useCameraStore } from '../helper/CameraStore';
import { useOsStore } from '../helper/OsStore';
import ContactList from './ContactList';
import { IconClose } from './icons';
import Txt from './Txt';

/** "Who I am" card that sits beside the shelf photo frames. */
export default function AboutPanel() {
    const open = useCameraStore((s) => s.cameraState === 'about');
    const go = useCameraStore((s) => s.go);
    const heading = useRef();
    const { education } = profile;

    useEffect(() => {
        if (open) heading.current?.focus({ preventScroll: true });
    }, [open]);

    if (!open) return null;

    const showProjects = () => {
        useOsStore.getState().open('projects');
        go('desktop');
    };

    return (
        <aside className="about" aria-labelledby="about-title">
            <button type="button" className="about__close icon-btn" onClick={() => go('default')} aria-label="Close and return to the room">
                <IconClose size={16} />
            </button>
            <div className="about__id">
                <span className="about__mono" aria-hidden="true">
                    {profile.initials}
                </span>
                <div>
                    <h2 id="about-title" className="about__name" tabIndex={-1} ref={heading}>
                        {profile.name}
                    </h2>
                    <p className="about__edu">
                        {education.degree}
                        <br />
                        {education.school}
                        {visible(education.campus) && (
                            <>
                                {' · '}
                                <Txt>{education.campus}</Txt>
                            </>
                        )}
                        {visible(education.years) && (
                            <>
                                {' · '}
                                <Txt>{education.years}</Txt>
                            </>
                        )}
                    </p>
                </div>
            </div>

            <p className="about__headline">{profile.headline}</p>
            {profile.about.map((p) => (
                <p key={p} className="about__p">
                    {p}
                </p>
            ))}

            <dl className="about__now">
                {profile.now
                    .filter((n) => visible(n.v))
                    .map((n) => (
                        <div key={n.k}>
                            <dt>{n.k}</dt>
                            <dd>
                                <Txt>{n.v}</Txt>
                            </dd>
                        </div>
                    ))}
            </dl>

            <ul className="about__tags" aria-label="Interests">
                {profile.interests.map((t) => (
                    <li key={t}>{t}</li>
                ))}
            </ul>

            <ContactList className="about__contact" keyClass="about__contact-k" linkClass="about__link" />

            <div className="about__actions">
                <button type="button" className="about__cta" onClick={showProjects}>
                    See my projects
                </button>
                <button type="button" className="about__ghost" onClick={() => go('displayBoard')}>
                    Work wall
                </button>
            </div>
        </aside>
    );
}

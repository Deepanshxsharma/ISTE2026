/* eslint-disable react/prop-types */
import { contactVisible } from '../config/profile';
import Txt from './Txt';

/** Contact rows from the profile. Unfilled entries only appear in dev, as highlighted placeholders. */
export default function ContactList({ className, keyClass = 'os-contact__k', linkClass = 'os-link' }) {
    return (
        <ul className={className}>
            {contactVisible().map((c) => (
                <li key={c.label}>
                    <span className={keyClass}>{c.label}</span>
                    {c.url ? (
                        <a
                            href={c.url}
                            target={c.url.startsWith('mailto:') ? undefined : '_blank'}
                            rel="noreferrer"
                            className={linkClass}
                        >
                            <Txt>{c.value}</Txt>
                        </a>
                    ) : (
                        <span>
                            <Txt>{c.value}</Txt>
                        </span>
                    )}
                </li>
            ))}
        </ul>
    );
}

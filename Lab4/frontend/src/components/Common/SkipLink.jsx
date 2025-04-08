import React from 'react';
import styles from './SkipLink.module.css';

const SkipLink = ({ targetId, children }) => {
    const handleClick = (e) => {
        e.preventDefault();
        const target = document.getElementById(targetId);
        if (target) {
            target.focus();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    return (
        <a 
            href={`#${targetId}`}
            className={styles.skipLink}
            onClick={handleClick}
            onKeyPress={(e) => {
                if (e.key === 'Enter') handleClick(e);
            }}
            aria-label={`Skip to ${children}`}
            role="link"
            tabIndex="0"
        >
            {children}
        </a>
    );
};

export default SkipLink;

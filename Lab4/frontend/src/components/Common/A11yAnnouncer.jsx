import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

const A11yAnnouncer = ({ message, assertive = false }) => {
    const ariaLive = assertive ? 'assertive' : 'polite';

    useEffect(() => {
        // Clear the announcer after 3 seconds to prevent screen readers
        // from re-reading the message when focusing back
        const timeoutId = setTimeout(() => {
            if (announcerElement) {
                announcerElement.textContent = '';
            }
        }, 3000);

        return () => clearTimeout(timeoutId);
    }, [message]);

    // Create or reuse the announcer element
    let announcerElement = document.getElementById('a11y-announcer');
    if (!announcerElement) {
        announcerElement = document.createElement('div');
        announcerElement.id = 'a11y-announcer';
        announcerElement.setAttribute('aria-live', ariaLive);
        announcerElement.setAttribute('aria-atomic', 'true');
        announcerElement.style.position = 'absolute';
        announcerElement.style.width = '1px';
        announcerElement.style.height = '1px';
        announcerElement.style.padding = '0';
        announcerElement.style.margin = '-1px';
        announcerElement.style.overflow = 'hidden';
        announcerElement.style.clip = 'rect(0, 0, 0, 0)';
        announcerElement.style.whiteSpace = 'nowrap';
        announcerElement.style.border = '0';
        document.body.appendChild(announcerElement);
    }

    return createPortal(
        <div aria-live={ariaLive} aria-atomic="true">
            {message}
        </div>,
        announcerElement
    );
};

export default A11yAnnouncer;

import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './Dialog.module.css';

const Dialog = ({ 
    isOpen, 
    onClose, 
    title, 
    children, 
    primaryAction,
    secondaryAction,
    type = 'info'
}) => {
    const dialogRef = useRef(null);

    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            // Lock scroll
            document.body.style.overflow = 'hidden';
            // Focus dialog
            dialogRef.current?.focus();
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = '';
        };
    }, [isOpen, onClose]);

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div 
                className={styles.overlay} 
                onClick={handleOverlayClick}
                role="presentation"
            >
                <motion.div
                    ref={dialogRef}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="dialog-title"
                    className={`${styles.dialog} ${styles[type]}`}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    transition={{ type: 'spring', duration: 0.3 }}
                    tabIndex={-1}
                >
                    <header className={styles.header}>
                        <h2 id="dialog-title" className={styles.title}>
                            {title}
                        </h2>
                        <button
                            className={styles.closeButton}
                            onClick={onClose}
                            aria-label="Close dialog"
                        >
                            ✕
                        </button>
                    </header>

                    <div className={styles.content}>
                        {children}
                    </div>

                    <footer className={styles.footer}>
                        {secondaryAction && (
                            <button
                                className={`${styles.button} ${styles.secondaryButton}`}
                                onClick={secondaryAction.onClick}
                                aria-label={secondaryAction.label}
                            >
                                {secondaryAction.label}
                            </button>
                        )}
                        {primaryAction && (
                            <button
                                className={`${styles.button} ${styles.primaryButton}`}
                                onClick={primaryAction.onClick}
                                aria-label={primaryAction.label}
                            >
                                {primaryAction.label}
                            </button>
                        )}
                    </footer>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default Dialog;

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './Notification.module.css';

const Notification = ({ message, type = 'success', isVisible, onClose }) => (
    <AnimatePresence>
        {isVisible && (
            <motion.div
                className={`${styles.notification} ${styles[type]}`}
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -50 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
                {message}
                <motion.button
                    className={styles.closeButton}
                    onClick={onClose}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                >
                    ✕
                </motion.button>
            </motion.div>
        )}
    </AnimatePresence>
);

export default Notification;

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './Notification.module.css';

const NotificationStack = ({ notifications, onRemove }) => (
    <div className={styles.notificationStack}>
        <AnimatePresence>
            {notifications.map(({ id, message, type }) => (
                <motion.div
                    key={id}
                    className={`${styles.notification} ${styles[type]}`}
                    initial={{ opacity: 0, y: -50, scale: 0.3 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
                    layout
                    transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 40,
                        mass: 1
                    }}
                >
                    {message}
                    <motion.button
                        className={styles.closeButton}
                        onClick={() => onRemove(id)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        ✕
                    </motion.button>
                </motion.div>
            ))}
        </AnimatePresence>
    </div>
);

export default NotificationStack;

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './ProgressIndicator.module.css';

const ProgressIndicator = ({ 
    isVisible, 
    progress = 0, 
    status = '', 
    type = 'determinate',
    color = 'primary'
}) => {
    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    className={styles.container}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    role="progressbar"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={type === 'determinate' ? progress : undefined}
                    aria-label={status}
                >
                    <div className={`${styles.bar} ${styles[color]}`}>
                        {type === 'determinate' ? (
                            <motion.div 
                                className={styles.progress}
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 0.3 }}
                            />
                        ) : (
                            <motion.div 
                                className={styles.indeterminate}
                                animate={{
                                    x: ['0%', '100%'],
                                    scaleX: [0.5, 1, 0.5]
                                }}
                                transition={{
                                    duration: 1.5,
                                    repeat: Infinity,
                                    ease: 'easeInOut'
                                }}
                            />
                        )}
                    </div>
                    {status && (
                        <motion.div 
                            className={styles.status}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                        >
                            {status}
                        </motion.div>
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ProgressIndicator;

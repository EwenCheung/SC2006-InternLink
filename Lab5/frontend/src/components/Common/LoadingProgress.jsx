import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import ProgressIndicator from './ProgressIndicator';
import styles from './LoadingProgress.module.css';

const LoadingProgress = ({
    isLoading,
    progress,
    status,
    type = 'determinate',
    color = 'primary',
    position = 'top',
    onCancel
}) => {
    return (
        <AnimatePresence>
            {isLoading && (
                <>
                    <ProgressIndicator
                        isVisible={true}
                        progress={progress}
                        status={status}
                        type={type}
                        color={color}
                    />
                    <motion.div
                        className={`${styles.backdrop} ${styles[position]}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        role="dialog"
                        aria-modal="true"
                        aria-label="Loading progress"
                    >
                        <motion.div 
                            className={styles.loadingContent}
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            transition={{ type: 'spring', damping: 20 }}
                        >
                            <div 
                                className={styles.spinnerContainer} 
                                role="progressbar"
                                aria-valuemin={0}
                                aria-valuemax={100}
                                aria-valuenow={progress}
                                aria-label={status || 'Loading...'}
                            >
                                <div className={styles.spinner} />
                            </div>
                            {status && (
                                <motion.p 
                                    className={styles.status}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    role="status"
                                >
                                    {status}
                                </motion.p>
                            )}
                            {onCancel && (
                                <motion.button
                                    className={styles.cancelButton}
                                    onClick={onCancel}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    aria-label="Cancel operation"
                                >
                                    Cancel
                                </motion.button>
                            )}
                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default LoadingProgress;

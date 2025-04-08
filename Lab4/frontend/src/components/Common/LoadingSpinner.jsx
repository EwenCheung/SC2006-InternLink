import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './LoadingSpinner.module.css';

export const LoadingSpinner = ({ 
    text = 'Loading...', 
    progress, 
    onCancel,
    type = 'default' // 'default' | 'overlay' | 'inline'
}) => (
    <AnimatePresence>
        <motion.div 
            className={`${styles.spinnerOverlay} ${styles[type]}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            role="progressbar"
            aria-valuemin="0"
            aria-valuemax="100"
            aria-valuenow={progress}
            aria-label={text}
        >
            <motion.div 
                className={styles.spinner}
                animate={{ rotate: 360 }}
                transition={{ 
                    duration: 1,
                    repeat: Infinity,
                    ease: "linear"
                }}
            />
            <motion.div 
                className={styles.loadingText}
                animate={{ opacity: [0.6, 1, 0.6] }}
                transition={{ 
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                role="status"
            >
                {text}
                {progress !== undefined && (
                    <span className={styles.progressText}>
                        {` (${Math.round(progress)}%)`}
                    </span>
                )}
            </motion.div>
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
    </AnimatePresence>
);

export const ShimmerBox = ({ height, width, className, style }) => (
    <div 
        className={`${styles.shimmer} ${className || ''}`}
        style={{ 
            height: height || '100px', 
            width: width || '100%', 
            borderRadius: '8px',
            ...style
        }}
        role="presentation"
        aria-hidden="true"
    />
);

export const ShimmerProfile = () => (
    <div role="status" aria-label="Loading profile content">
        <div style={{ display: 'flex', gap: '40px', marginBottom: '30px' }}>
            <ShimmerBox height="200px" width="200px" style={{ borderRadius: '50%' }} />
            <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '25px' }}>
                    <ShimmerBox height="40px" width="200px" />
                    <ShimmerBox height="40px" width="120px" />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                    {[1, 2, 3, 4, 5].map(i => (
                        <ShimmerBox key={i} height="80px" />
                    ))}
                </div>
            </div>
        </div>
        
        <div>
            <ShimmerBox height="40px" width="200px" style={{ marginBottom: '30px' }} />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '30px' }}>
                {[1, 2, 3].map(i => (
                    <ShimmerBox key={i} height="300px" />
                ))}
            </div>
        </div>
    </div>
);

export default LoadingSpinner;

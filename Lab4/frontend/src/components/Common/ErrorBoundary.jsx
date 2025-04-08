import React from 'react';
import { motion } from 'framer-motion';
import styles from './ErrorBoundary.module.css';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { 
            hasError: false,
            error: null,
            errorInfo: null
        };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({
            error: error,
            errorInfo: errorInfo
        });
        
        // Log error to error reporting service
        console.error('Error caught by boundary:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <motion.div 
                    className={styles.errorContainer}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    role="alert"
                    aria-live="assertive"
                >
                    <div className={styles.errorContent}>
                        <h2>Something went wrong</h2>
                        <p>We're sorry, but something went wrong. Please try refreshing the page.</p>
                        
                        <div className={styles.buttonGroup}>
                            <button
                                onClick={() => window.location.reload()}
                                className={styles.primaryButton}
                                aria-label="Refresh page"
                            >
                                Refresh Page
                            </button>
                            <button
                                onClick={() => window.history.back()}
                                className={styles.secondaryButton}
                                aria-label="Go back to previous page"
                            >
                                Go Back
                            </button>
                        </div>

                        {process.env.NODE_ENV === 'development' && (
                            <details className={styles.errorDetails}>
                                <summary>Error Details</summary>
                                <pre>
                                    {this.state.error && this.state.error.toString()}
                                    {this.state.errorInfo && this.state.errorInfo.componentStack}
                                </pre>
                            </details>
                        )}
                    </div>
                </motion.div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;

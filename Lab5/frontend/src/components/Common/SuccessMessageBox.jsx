import React from 'react';
import styles from './SuccessMessageBox.module.css';

const SuccessMessageBox = ({ show, message, subMessage, onClose }) => {
  if (!show) return null;
  
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.messageBox} onClick={(e) => e.stopPropagation()}>
        <div className={styles.icon}>✓</div>
        <h3>{message}</h3>
        {subMessage && <p>{subMessage}</p>}
      </div>
    </div>
  );
};

export default SuccessMessageBox;

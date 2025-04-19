import { useState, useCallback } from 'react';

const useNotification = () => {
    const [notifications, setNotifications] = useState([]);

    const showNotification = useCallback((message, type = 'success', duration = 3000) => {
        const id = Date.now();
        setNotifications(prev => [...prev, { id, message, type }]);

        setTimeout(() => {
            setNotifications(prev => prev.filter(notif => notif.id !== id));
        }, duration);
    }, []);

    const removeNotification = useCallback((id) => {
        setNotifications(prev => prev.filter(notif => notif.id !== id));
    }, []);

    return {
        notifications,
        showNotification,
        removeNotification
    };
};

export default useNotification;

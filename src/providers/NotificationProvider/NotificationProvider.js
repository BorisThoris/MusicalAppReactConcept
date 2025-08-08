/* eslint-disable react-perf/jsx-no-new-function-as-prop */
/* eslint-disable max-len */
import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import styled from 'styled-components';

const NotificationContext = createContext(null);

const NotificationContainer = styled.div`
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 10000;
    display: flex;
    flex-direction: column;
    gap: 10px;
`;

const NotificationItem = styled.div`
    color: white;
    padding: 12px 20px;
    border-radius: 4px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    min-width: 300px;
    max-width: 400px;
    animation: slideIn 0.3s ease-out;
    position: relative;

    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
`;

const CloseButton = styled.button`
    position: absolute;
    top: 8px;
    right: 8px;
    background: none;
    border: none;
    color: white;
    cursor: pointer;
    font-size: 16px;
    font-weight: bold;
    padding: 0;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
        opacity: 0.8;
    }
`;

const NotificationMessage = styled.div`
    margin-right: 25px;
    word-wrap: break-word;
`;

const ConfirmationButtons = styled.div`
    margin-top: 10px;
    display: flex;
    gap: 10px;
`;

const ConfirmationButton = styled.button`
    color: white;
    border: none;
    padding: 5px 15px;
    border-radius: 3px;
    cursor: pointer;
    font-size: 12px;

    &:hover {
        opacity: 0.8;
    }
`;

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);

    const removeNotification = useCallback((id) => {
        setNotifications((prev) => prev.filter((notification) => notification.id !== id));
    }, []);

    const addNotification = useCallback(
        (message, type = 'info', duration = 3000, onConfirm = null) => {
            const id = Date.now() + Math.random();
            const newNotification = { duration, id, message, onConfirm, type };

            setNotifications((prev) => [...prev, newNotification]);

            if (duration > 0 && !onConfirm) {
                setTimeout(() => {
                    removeNotification(id);
                }, duration);
            }

            return id;
        },
        [removeNotification]
    );

    const showSuccess = useCallback(
        (message, duration = 3000) => {
            return addNotification(message, 'success', duration);
        },
        [addNotification]
    );

    const showError = useCallback(
        (message, duration = 5000) => {
            return addNotification(message, 'error', duration);
        },
        [addNotification]
    );

    const showWarning = useCallback(
        (message, duration = 4000) => {
            return addNotification(message, 'warning', duration);
        },
        [addNotification]
    );

    const showInfo = useCallback(
        (message, duration = 3000) => {
            return addNotification(message, 'info', duration);
        },
        [addNotification]
    );

    const handleConfirm = useCallback(
        (id, result) => {
            const notification = notifications.find((n) => n.id === id);
            if (notification && notification.onConfirm) {
                notification.onConfirm(result);
            }
            removeNotification(id);
        },
        [notifications, removeNotification]
    );

    const confirm = useCallback(
        (message) => {
            return new Promise((resolve) => {
                const notificationId = Date.now() + Math.random();

                const handleConfirmCallback = (result) => {
                    removeNotification(notificationId);
                    resolve(result);
                };

                const newNotification = {
                    duration: 0,
                    id: notificationId,
                    message,
                    onConfirm: handleConfirmCallback,
                    type: 'warning'
                };

                setNotifications((prev) => [...prev, newNotification]);
            });
        },
        [removeNotification]
    );

    const styles = useMemo(
        () => ({
            cancel: { backgroundColor: '#f44336' },
            confirm: { backgroundColor: '#4caf50' },
            error: { backgroundColor: '#f44336' },
            info: { backgroundColor: '#2196f3' },
            success: { backgroundColor: '#4caf50' },
            warning: { backgroundColor: '#ff9800' }
        }),
        []
    );

    const value = useMemo(
        () => ({
            addNotification,
            confirm,
            removeNotification,
            showError,
            showInfo,
            showSuccess,
            showWarning
        }),
        [addNotification, confirm, removeNotification, showError, showInfo, showSuccess, showWarning]
    );

    const handleConfirmClick = useCallback(
        (id, result) => {
            handleConfirm(id, result);
        },
        [handleConfirm]
    );

    const handleCloseClick = useCallback(
        (id) => {
            removeNotification(id);
        },
        [removeNotification]
    );

    return (
        <NotificationContext.Provider value={value}>
            {children}
            <NotificationContainer>
                {notifications.map((notification) => (
                    // eslint-disable-next-line react-perf/jsx-no-new-object-as-prop, react-perf/jsx-no-new-function-as-prop
                    <NotificationItem key={notification.id} style={styles[notification.type] || styles.info}>
                        <NotificationMessage>{notification.message}</NotificationMessage>
                        {notification.onConfirm ? (
                            <ConfirmationButtons>
                                {/* eslint-disable-next-line react-perf/jsx-no-new-function-as-prop */}
                                <ConfirmationButton
                                    style={styles.confirm}
                                    onClick={() => handleConfirmClick(notification.id, true)}
                                >
                                    Yes
                                </ConfirmationButton>
                                {/* eslint-disable-next-line react-perf/jsx-no-new-function-as-prop */}
                                <ConfirmationButton
                                    style={styles.cancel}
                                    onClick={() => handleConfirmClick(notification.id, false)}
                                >
                                    No
                                </ConfirmationButton>
                            </ConfirmationButtons>
                        ) : (
                            // eslint-disable-next-line react-perf/jsx-no-new-function-as-prop
                            <CloseButton onClick={() => handleCloseClick(notification.id)}>×</CloseButton>
                        )}
                    </NotificationItem>
                ))}
            </NotificationContainer>
        </NotificationContext.Provider>
    );
};

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
};

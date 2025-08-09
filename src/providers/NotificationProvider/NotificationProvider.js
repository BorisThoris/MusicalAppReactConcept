/* eslint-disable react-perf/jsx-no-new-function-as-prop */
/* eslint-disable max-len */
import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import styled from 'styled-components';

const NotificationContext = createContext(null);

const NotificationContainer = styled.div`
    position: fixed;
    top: ${({ theme }) => theme.spacing[5]};
    right: ${({ theme }) => theme.spacing[5]};
    z-index: ${({ theme }) => theme.zIndex.toast};
    display: flex;
    flex-direction: column;
    gap: ${({ theme }) => theme.spacing[2]};
`;

const BaseNotificationItem = styled.div`
    color: ${({ theme }) => theme.colors.semantic.text.inverse};
    padding: ${({ theme }) => theme.spacing[3]} ${({ theme }) => theme.spacing[5]};
    border-radius: ${({ theme }) => theme.borderRadius.base};
    box-shadow: ${({ theme }) => theme.shadows.lg};
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

const InfoNotificationItem = styled(BaseNotificationItem)`
    background-color: ${({ theme }) => theme.colors.semantic.interactive.primary};
`;

const SuccessNotificationItem = styled(BaseNotificationItem)`
    background-color: ${({ theme }) => theme.colors.semantic.interactive.success};
`;

const WarningNotificationItem = styled(BaseNotificationItem)`
    background-color: ${({ theme }) => theme.colors.semantic.interactive.warning};
`;

const ErrorNotificationItem = styled(BaseNotificationItem)`
    background-color: ${({ theme }) => theme.colors.semantic.interactive.error};
`;

const getNotificationComponent = (type) => {
    switch (type) {
        case 'success':
            return SuccessNotificationItem;
        case 'warning':
            return WarningNotificationItem;
        case 'error':
            return ErrorNotificationItem;
        default:
            return InfoNotificationItem;
    }
};

const CloseButton = styled.button`
    position: absolute;
    top: ${({ theme }) => theme.spacing[2]};
    right: ${({ theme }) => theme.spacing[2]};
    background: none;
    border: none;
    color: ${({ theme }) => theme.colors.semantic.text.inverse};
    cursor: pointer;
    font-size: ${({ theme }) => theme.typography.fontSize.base};
    font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
    padding: 0;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: ${({ theme }) => theme.borderRadius.full};
    transition: all ${({ theme }) => theme.transitions.duration.fast} ${({ theme }) => theme.transitions.easing.ease};

    &:hover {
        background-color: ${({ theme }) => theme.colors.semantic.background.overlay};
        opacity: 0.8;
    }
`;

const NotificationMessage = styled.div`
    margin-right: 25px;
    word-wrap: break-word;
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
    line-height: ${({ theme }) => theme.typography.lineHeight.normal};
`;

const ConfirmationButtons = styled.div`
    margin-top: ${({ theme }) => theme.spacing[2]};
    display: flex;
    gap: ${({ theme }) => theme.spacing[2]};
`;

const ConfirmationButton = styled.button`
    color: ${({ theme }) => theme.colors.semantic.text.inverse};
    border: none;
    padding: ${({ theme }) => theme.spacing[1]} ${({ theme }) => theme.spacing[3]};
    border-radius: ${({ theme }) => theme.borderRadius.base};
    cursor: pointer;
    font-size: ${({ theme }) => theme.typography.fontSize.xs};
    font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
    background-color: ${({ theme }) => theme.colors.semantic.background.overlay};
    transition: all ${({ theme }) => theme.transitions.duration.fast} ${({ theme }) => theme.transitions.easing.ease};

    &:hover {
        background-color: ${({ theme }) => theme.colors.semantic.surface.secondary};
        opacity: 0.9;
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

    const confirm = useCallback(
        (message, onConfirm, onCancel) => {
            return addNotification(message, 'info', 0, { onCancel, onConfirm });
        },
        [addNotification]
    );

    const value = useMemo(
        () => ({
            addNotification,
            confirm,
            notifications,
            removeNotification,
            showError,
            showInfo,
            showSuccess,
            showWarning
        }),
        [addNotification, confirm, notifications, removeNotification, showError, showInfo, showSuccess, showWarning]
    );

    return (
        <NotificationContext.Provider value={value}>
            {children}
            <NotificationContainer>
                {notifications.map((notification) => {
                    const NotificationComponent = getNotificationComponent(notification.type);
                    return (
                        <NotificationComponent key={notification.id}>
                            <CloseButton onClick={() => removeNotification(notification.id)}>×</CloseButton>
                            <NotificationMessage>{notification.message}</NotificationMessage>
                            {notification.onConfirm && (
                                <ConfirmationButtons>
                                    <ConfirmationButton
                                        onClick={() => {
                                            const handleConfirmCallback = (result) => {
                                                if (notification.onConfirm.onConfirm) {
                                                    notification.onConfirm.onConfirm(result);
                                                }
                                                removeNotification(notification.id);
                                            };

                                            handleConfirmCallback(true);
                                        }}
                                    >
                                        Confirm
                                    </ConfirmationButton>
                                    <ConfirmationButton
                                        onClick={() => {
                                            const handleCancelCallback = (result) => {
                                                if (notification.onConfirm.onCancel) {
                                                    notification.onConfirm.onCancel(result);
                                                }
                                                removeNotification(notification.id);
                                            };

                                            handleCancelCallback(false);
                                        }}
                                    >
                                        Cancel
                                    </ConfirmationButton>
                                </ConfirmationButtons>
                            )}
                        </NotificationComponent>
                    );
                })}
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

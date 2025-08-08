import { useCallback } from 'react';
import { useNotification } from '../../NotificationProvider/NotificationProvider';

export const useLocalStorage = ({ overlapGroups, setHasChanged, setOverlapGroups }) => {
    const { showInfo, showSuccess } = useNotification();

    const saveToLocalStorage = useCallback(() => {
        localStorage.setItem('overlapGroups', JSON.stringify(overlapGroups));
        setHasChanged(false);
        showSuccess('Overlap groups saved to local storage.');
    }, [overlapGroups, setHasChanged, showSuccess]);

    const loadFromLocalStorage = useCallback(() => {
        const storedOverlapGroups = JSON.parse(localStorage.getItem('overlapGroups'));
        if (storedOverlapGroups) {
            setOverlapGroups(storedOverlapGroups);
            showSuccess('Overlap groups loaded from local storage.');
        } else {
            showInfo('No saved overlap groups found in local storage.');
        }
    }, [setOverlapGroups, showSuccess, showInfo]);

    const clearLocalStorage = useCallback(() => {
        localStorage.removeItem('overlapGroups');
        setOverlapGroups({});
        showSuccess('Local storage cleared.');
    }, [setOverlapGroups, showSuccess]);

    return {
        clearLocalStorage,
        loadFromLocalStorage,
        saveToLocalStorage
    };
};

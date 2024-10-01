import { useCallback } from 'react';

export const useLocalStorage = ({ overlapGroups, setHasChanged, setOverlapGroups }) => {
    const saveToLocalStorage = useCallback(() => {
        localStorage.setItem('overlapGroups', JSON.stringify(overlapGroups));
        setHasChanged(false);
        alert('Overlap groups saved to local storage.');
    }, [overlapGroups, setHasChanged]);

    const loadFromLocalStorage = useCallback(() => {
        const storedOverlapGroups = JSON.parse(localStorage.getItem('overlapGroups'));
        if (storedOverlapGroups) {
            setOverlapGroups(storedOverlapGroups);
            alert('Overlap groups loaded from local storage.');
        } else {
            alert('No saved overlap groups found in local storage.');
        }
    }, [setOverlapGroups]);

    const clearLocalStorage = useCallback(() => {
        localStorage.removeItem('overlapGroups');
        setOverlapGroups({});
        alert('Local storage cleared.');
    }, [setOverlapGroups]);

    return {
        clearLocalStorage,
        loadFromLocalStorage,
        saveToLocalStorage
    };
};

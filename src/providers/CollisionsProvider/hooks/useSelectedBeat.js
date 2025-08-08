import { useCallback, useState } from 'react';
import { useNotification } from '../../NotificationProvider/NotificationProvider';

export const useSelectedBeat = ({ beats, overlapGroups, saveBeatsToLocalStorage, setHasChanged }) => {
    const [selectedBeat, setSelectedBeat] = useState(null);
    const { showError, showSuccess } = useNotification();

    const updateCurrentBeat = useCallback(() => {
        if (selectedBeat && selectedBeat.name) {
            const updatedBeat = {
                ...selectedBeat,
                data: overlapGroups,
                date: new Date().toLocaleString()
            };
            const updatedBeats = beats.map((beat) => (beat.name === updatedBeat.name ? updatedBeat : beat));
            saveBeatsToLocalStorage(updatedBeats);
            showSuccess('Beat updated successfully.');
            setHasChanged(false);
        } else {
            showError('No beat selected to update.');
        }
    }, [selectedBeat, overlapGroups, beats, saveBeatsToLocalStorage, setHasChanged, showSuccess, showError]);

    const changeBeatName = useCallback(
        (newName) => {
            if (!newName.trim()) {
                showError('New name cannot be empty.');
                return;
            }

            if (!selectedBeat || !selectedBeat.name) {
                showError('No beat selected to rename.');
                return;
            }

            const nameExists = beats.some((beat) => beat.name === newName.trim());
            if (nameExists) {
                showError('A beat with this name already exists.');
                return;
            }

            const updatedBeats = beats.map((beat) =>
                beat.name === selectedBeat.name ? { ...beat, name: newName.trim() } : beat
            );
            saveBeatsToLocalStorage(updatedBeats);
            setSelectedBeat((prev) => ({ ...prev, name: newName.trim() })); // Update UI state for the renamed beat
            showSuccess('Beat renamed successfully.');
            setHasChanged(false);
        },
        [selectedBeat, beats, saveBeatsToLocalStorage, setHasChanged, showError, showSuccess]
    );

    return {
        beats,
        changeBeatName,
        selectedBeat,
        setSelectedBeat,
        updateCurrentBeat // Expose beats for UI updates if needed
    };
};

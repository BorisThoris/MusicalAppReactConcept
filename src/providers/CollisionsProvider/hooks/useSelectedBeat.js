/* eslint-disable no-alert */
import { useCallback, useState } from 'react';

export const useSelectedBeat = ({ beats, overlapGroups, saveBeatsToLocalStorage, setHasChanged }) => {
    const [selectedBeat, setSelectedBeat] = useState(null);

    const updateCurrentBeat = useCallback(() => {
        if (selectedBeat && selectedBeat.name) {
            const updatedBeat = {
                ...selectedBeat,
                data: overlapGroups,
                date: new Date().toLocaleString()
            };
            const updatedBeats = beats.map((beat) => (beat.name === updatedBeat.name ? updatedBeat : beat));
            saveBeatsToLocalStorage(updatedBeats);
            alert('Beat updated successfully.');
            setHasChanged(false);
        } else {
            alert('No beat selected to update.');
        }
    }, [selectedBeat, overlapGroups, beats, saveBeatsToLocalStorage, setHasChanged]);

    const changeBeatName = useCallback(
        (newName) => {
            if (!newName.trim()) {
                alert('New name cannot be empty.');
                return;
            }

            if (!selectedBeat || !selectedBeat.name) {
                alert('No beat selected to rename.');
                return;
            }

            const nameExists = beats.some((beat) => beat.name === newName.trim());
            if (nameExists) {
                alert('A beat with this name already exists.');
                return;
            }

            const updatedBeats = beats.map((beat) =>
                beat.name === selectedBeat.name ? { ...beat, name: newName.trim() } : beat
            );
            saveBeatsToLocalStorage(updatedBeats);
            setSelectedBeat((prev) => ({ ...prev, name: newName.trim() })); // Update UI state for the renamed beat
            alert('Beat renamed successfully.');
            setHasChanged(false);
        },
        [selectedBeat, beats, saveBeatsToLocalStorage, setHasChanged]
    );

    console.log('selectedBeat', selectedBeat);

    return {
        beats,
        changeBeatName,
        selectedBeat,
        setSelectedBeat,
        updateCurrentBeat // Expose beats for UI updates if needed
    };
};

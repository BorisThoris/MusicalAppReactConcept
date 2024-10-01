import { useCallback, useState } from 'react';

export const useSelectedBeat = ({ overlapGroups, setHasChanged }) => {
    const [selectedBeat, setSelectedBeat] = useState(null);

    const updateCurrentBeat = useCallback(() => {
        if (selectedBeat && selectedBeat.name) {
            const updatedBeat = {
                ...selectedBeat,
                data: overlapGroups,
                date: new Date().toLocaleString()
            };
            const savedBeats = JSON.parse(localStorage.getItem('beats')) || [];
            const updatedBeats = savedBeats.map((beat) => (beat.name === updatedBeat.name ? updatedBeat : beat));
            localStorage.setItem('beats', JSON.stringify(updatedBeats));
            alert('Beat updated successfully.');

            setHasChanged(false);
        } else {
            alert('No beat selected to update.');
        }
    }, [selectedBeat, overlapGroups, setHasChanged]);

    return {
        selectedBeat,
        setSelectedBeat,
        updateCurrentBeat
    };
};

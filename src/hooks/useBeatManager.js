import { useCallback, useState } from 'react';
import { useBeats } from '../providers/CollisionsProvider/hooks/useBeats';
import { useSelectedBeat } from '../providers/CollisionsProvider/hooks/useSelectedBeat';

export const useBeatManager = (overlapGroups = {}, setHasChanged = () => {}) => {
    const [beats, saveBeatsToLocalStorage] = useBeats();
    const [currentBeat, setCurrentBeat] = useState(null);

    const { changeBeatName, selectedBeat, setSelectedBeat, updateCurrentBeat } = useSelectedBeat({
        beats,
        overlapGroups,
        saveBeatsToLocalStorage,
        setHasChanged
    });

    const updateCurrentBeatData = useCallback((newBeat) => {
        setCurrentBeat(newBeat);
    }, []);

    return {
        beats,
        changeBeatName,
        currentBeat,
        saveBeatsToLocalStorage,
        selectedBeat,
        setCurrentBeat: updateCurrentBeatData,
        setSelectedBeat,
        updateCurrentBeat
    };
};

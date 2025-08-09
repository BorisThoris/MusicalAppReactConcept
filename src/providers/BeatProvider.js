import React, { createContext, useContext, useState } from 'react';
import { useBeats } from './CollisionsProvider/hooks/useBeats';
import { useSelectedBeat } from './CollisionsProvider/hooks/useSelectedBeat';

const BeatContext = createContext();

export const useBeatContext = () => {
    const context = useContext(BeatContext);
    if (!context) {
        throw new Error('useBeatContext must be used within a BeatProvider');
    }
    return context;
};

export const BeatProvider = ({ children }) => {
    const [beats, saveBeatsToLocalStorage] = useBeats();
    const [currentBeat, setCurrentBeat] = useState(null);

    // These will be provided by other providers
    const { overlapGroups = {}, setHasChanged = () => {} } =
        useContext(require('./OverlapProvider').OverlapContext) || {};

    const { changeBeatName, selectedBeat, setSelectedBeat, updateCurrentBeat } = useSelectedBeat({
        beats,
        overlapGroups,
        saveBeatsToLocalStorage,
        setHasChanged
    });

    const value = {
        beats,
        changeBeatName,
        currentBeat,
        saveBeatsToLocalStorage,
        selectedBeat,
        setCurrentBeat,
        setSelectedBeat,
        updateCurrentBeat
    };

    return <BeatContext.Provider value={value}>{children}</BeatContext.Provider>;
};

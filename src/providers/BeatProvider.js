import React, { createContext, useContext, useMemo, useState } from 'react';
import { useBeats } from './CollisionsProvider/hooks/useBeats';
import { useSelectedBeat } from './CollisionsProvider/hooks/useSelectedBeat';
import { OverlapContext } from './OverlapProvider';

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
    const { overlapGroups = {}, setHasChanged = () => {} } = useContext(OverlapContext) || {};

    const contextValue = useMemo(
        () => ({
            beats,
            currentBeat,
            overlapGroups,
            saveBeatsToLocalStorage,
            setCurrentBeat,
            setHasChanged
        }),
        [beats, currentBeat, overlapGroups, saveBeatsToLocalStorage, setCurrentBeat, setHasChanged]
    );

    return <BeatContext.Provider value={contextValue}>{children}</BeatContext.Provider>;
};

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { PanelContext } from '../../hooks/usePanelState';
import { useHistory } from './hooks/useHistory';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useSelectedBeat } from './hooks/useSelectedBeat';
import { useTimelineRefs } from './hooks/useTimelineRefs';

export const CollisionsContext = createContext();

function findDifferences(obj1, obj2, parentKey = '') {
    if (obj1 === obj2) return;

    if (typeof obj1 !== 'object' || typeof obj2 !== 'object' || obj1 == null || obj2 == null) {
        console.log(`Difference at ${parentKey}:`, obj1, obj2);
        return;
    }

    const allKeys = new Set([...Object.keys(obj1), ...Object.keys(obj2)]);
    // eslint-disable-next-line no-restricted-syntax
    for (const key of allKeys) {
        const newKey = parentKey ? `${parentKey}.${key}` : key;
        findDifferences(obj1[key], obj2[key], newKey);
    }
}

export const CollisionsProvider = ({ children }) => {
    const [overlapGroups, setOverlapGroups] = useState({});
    const [hasChanged, setHasChanged] = useState(false);
    const [copiedEvents, setCopiedEvents] = useState([]);
    const { openLoadPanel } = useContext(PanelContext);

    const {
        addStageRef,
        addTimelineRef,
        deleteAllElements,
        deleteAllTimelines,
        findAllSoundEventElements,
        getProcessedElements,
        getSoundEventById,
        removeTimelineRef,
        stageRef,
        timelineRefs
    } = useTimelineRefs({ setHasChanged });

    const { clearLocalStorage, loadFromLocalStorage, saveToLocalStorage } = useLocalStorage({
        overlapGroups,
        setHasChanged,
        setOverlapGroups
    });

    // Function to group recordings by instrumentName
    const processBeat = useCallback(() => {
        const processedElements = getProcessedElements();

        // Create the object to save
        const objToSave = processedElements.reduce((acc, { recording }) => {
            const { id, instrumentName } = recording;

            // Initialize instrumentName if it doesn't exist
            if (!acc[instrumentName]) {
                acc[instrumentName] = {};
            }

            // Add recording under the relevant instrumentName
            acc[instrumentName][id] = recording;

            return acc;
        }, {});

        return objToSave;
    }, [getProcessedElements]);

    const { history, pushToHistory, redo, redoHistory, undo } = useHistory({
        overlapGroups,
        processBeat,
        setOverlapGroups,
        stageRef
    });

    const { selectedBeat, setSelectedBeat, updateCurrentBeat } = useSelectedBeat({ overlapGroups, setHasChanged });

    const previousOverlapGroupsRef = useRef({});

    console.log(overlapGroups);

    useEffect(() => {
        if (Object.values(overlapGroups).length === 0) {
            openLoadPanel();

            previousOverlapGroupsRef.current = {};
        }
    }, [openLoadPanel, overlapGroups]);

    const copyEvents = useCallback((events) => {
        setCopiedEvents(events);
    }, []);

    const contextValue = useMemo(
        () => ({
            addStageRef,
            addTimelineRef,
            clearLocalStorage,
            copiedEvents,
            copyEvents,
            deleteAllElements,
            deleteAllTimelines,
            findAllSoundEventElements,
            getProcessedElements,
            getSoundEventById,
            hasChanged,
            history,
            loadFromLocalStorage,
            overlapGroups,
            processBeat,
            pushToHistory,
            redo,
            redoHistory,
            removeTimelineRef,
            saveToLocalStorage,
            selectedBeat,
            setCopiedEvents,
            setHasChanged,
            setOverlapGroups,
            setSelectedBeat,
            stageRef,
            timelineRefs,
            undo,
            updateCurrentBeat
        }),
        [
            addStageRef,
            addTimelineRef,
            processBeat,
            clearLocalStorage,
            copiedEvents,
            copyEvents,
            deleteAllElements,
            deleteAllTimelines,
            findAllSoundEventElements,
            getProcessedElements,
            getSoundEventById,
            hasChanged,
            history,
            loadFromLocalStorage,
            overlapGroups,
            pushToHistory,
            redo,
            redoHistory,
            removeTimelineRef,
            saveToLocalStorage,
            selectedBeat,
            setOverlapGroups,
            setSelectedBeat,
            stageRef,
            timelineRefs,
            undo,
            updateCurrentBeat
        ]
    );

    return <CollisionsContext.Provider value={contextValue}>{children}</CollisionsContext.Provider>;
};

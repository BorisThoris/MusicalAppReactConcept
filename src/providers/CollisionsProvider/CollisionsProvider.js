import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { createEvent } from '../../globalHelpers/createSound';
import { PanelContext } from '../../hooks/usePanelState';
import { useHistory } from './hooks/useHistory';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useOverlapGroups } from './hooks/useOverlapGroups';
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
    const [hasChanged, setHasChanged] = useState(false);
    const [copiedEvents, setCopiedEvents] = useState([]);
    const { openLoadPanel } = useContext(PanelContext);

    const {
        addStageRef,
        addTimelineRef,
        deleteAllElements,
        deleteAllTimelines,
        getProcessedElements,
        getSoundEventById,
        removeTimelineRef,
        stageRef,
        timelineRefs
    } = useTimelineRefs({ setHasChanged });

    const {
        calculateCollisions,
        calculateOverlapsForAllInstruments,

        overlapGroups,
        setOverlapGroups
    } = useOverlapGroups({ getProcessedElements, setHasChanged, timelineRefs });

    const { clearLocalStorage, loadFromLocalStorage, saveToLocalStorage } = useLocalStorage({
        overlapGroups,
        setHasChanged,
        setOverlapGroups
    });

    const { history, pushToHistory, redo, redoHistory, undo } = useHistory({
        calculateOverlapsForAllInstruments,
        overlapGroups,
        setOverlapGroups
    });

    const { selectedBeat, setSelectedBeat, updateCurrentBeat } = useSelectedBeat({ overlapGroups, setHasChanged });

    const previousOverlapGroupsRef = useRef({});

    useEffect(() => {
        if (Object.values(overlapGroups).length === 0) {
            openLoadPanel();

            previousOverlapGroupsRef.current = JSON.stringify({});
        }
    }, [openLoadPanel, overlapGroups]);

    useEffect(() => {
        const stringifyOverlapGroups = JSON.stringify(overlapGroups);

        if (previousOverlapGroupsRef.current !== stringifyOverlapGroups) {
            // findDifferences(overlapGroups, JSON.parse(previousOverlapGroupsRef.current));
            calculateCollisions();
            previousOverlapGroupsRef.current = stringifyOverlapGroups;
        }
    }, [calculateCollisions, openLoadPanel, overlapGroups, timelineRefs]);

    const insertRecording = useCallback(
        ({ instrumentName, startTime }) => {
            const sortedEvents = [...copiedEvents].sort((a, b) => a.startTime - b.startTime);

            const updatedGroups = { ...overlapGroups };

            const initialStart = startTime;
            const firstEvent = sortedEvents[0];
            const offset = initialStart - firstEvent.startTime;

            sortedEvents.forEach((event, index) => {
                const newStartTime = index === 0 ? initialStart : event.startTime + offset;
                const newEvent = createEvent({
                    instrumentName: event.instrumentName,
                    parentId: null,
                    passedStartTime: newStartTime,
                    recording: event
                });

                if (!updatedGroups[newEvent.instrumentName]) {
                    updatedGroups[newEvent.instrumentName] = {};
                }
                updatedGroups[newEvent.instrumentName][newEvent.id] = newEvent;
            });

            pushToHistory(updatedGroups);
            setOverlapGroups(updatedGroups);
        },
        [copiedEvents, overlapGroups, pushToHistory, setOverlapGroups]
    );

    const copyEvents = useCallback((events) => {
        setCopiedEvents(events);
    }, []);

    const contextValue = useMemo(
        () => ({
            addStageRef,
            addTimelineRef,
            calculateCollisions,
            calculateOverlapsForAllInstruments,
            clearLocalStorage,
            copiedEvents,
            copyEvents,
            deleteAllElements,
            deleteAllTimelines,

            getProcessedElements,
            getSoundEventById,
            hasChanged,
            history,
            insertRecording,
            loadFromLocalStorage,
            overlapGroups,
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
            getSoundEventById,
            calculateCollisions,
            addStageRef,
            deleteAllTimelines,
            addTimelineRef,
            timelineRefs,
            deleteAllElements,
            removeTimelineRef,
            overlapGroups,

            calculateOverlapsForAllInstruments,
            history,
            redoHistory,
            getProcessedElements,
            setOverlapGroups,
            saveToLocalStorage,
            loadFromLocalStorage,
            clearLocalStorage,
            pushToHistory,
            undo,
            redo,
            stageRef,
            selectedBeat,
            setSelectedBeat,
            updateCurrentBeat,
            setHasChanged,
            hasChanged,
            insertRecording,
            copyEvents,
            copiedEvents,
            setCopiedEvents
        ]
    );

    return <CollisionsContext.Provider value={contextValue}>{children}</CollisionsContext.Provider>;
};

import { createEvent } from '@testing-library/react';
import cloneDeep from 'lodash/cloneDeep';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { PanelContext } from '../../hooks/usePanelState';
import { useHistory } from './hooks/useHistory';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useOverlapGroups } from './hooks/useOverlapGroups';
import { useSelectedBeat } from './hooks/useSelectedBeat';
import { useTimelineRefs } from './hooks/useTimelineRefs';

export const CollisionsContext = createContext();

const useCollisions = () => useContext(CollisionsContext);

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
        removeTimelineRef,
        stageRef,
        timelineRefs
    } = useTimelineRefs({ setHasChanged });

    const {
        calculateCollisions,
        calculateOverlapsForAllInstruments,
        flatOverlapGroups,
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
        calculateCollisions();
    }, [calculateCollisions, timelineRefs]);

    useEffect(() => {
        const stringifyOverlapGroups = JSON.stringify(overlapGroups);

        if (Object.values(overlapGroups).length === 0) {
            openLoadPanel();

            previousOverlapGroupsRef.current = cloneDeep(overlapGroups);
        }

        if (previousOverlapGroupsRef.current !== stringifyOverlapGroups) {
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
                const newEvent = createEvent(event, instrumentName, null, newStartTime);

                if (!updatedGroups[instrumentName]) {
                    updatedGroups[instrumentName] = {};
                }
                updatedGroups[instrumentName][newEvent.id] = newEvent;
            });

            pushToHistory(updatedGroups);
            setOverlapGroups(updatedGroups);
        },
        [copiedEvents, overlapGroups, pushToHistory, setOverlapGroups]
    );

    const copyEvents = useCallback((events) => {
        setCopiedEvents(events);
    }, []);

    console.log(overlapGroups);

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
            flatOverlapGroups,
            getProcessedElements,
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
            calculateCollisions,
            addStageRef,
            deleteAllTimelines,
            addTimelineRef,
            timelineRefs,
            deleteAllElements,
            removeTimelineRef,
            overlapGroups,
            flatOverlapGroups,
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

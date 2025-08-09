import isEqual from 'lodash/isEqual';
import React, { createContext, useCallback, useContext, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { recreateEvents } from '../../globalHelpers/createSound';
import { PanelContext } from '../../hooks/usePanelState';
import { useBeatRefresher } from './hooks/useBeatRefresher';
import { useBeats } from './hooks/useBeats';
import { useFurthestEndTime } from './hooks/useFurthestEndTime';
import { useHistory } from './hooks/useHistory';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useProcessBeat } from './hooks/useProcessBeat';
import { useSelectedBeat } from './hooks/useSelectedBeat';
import { useTimelineManager } from './hooks/useTimelineManager';
import { useTimelineRefs } from './hooks/useTimelineRefs';
import { findOverlaps, processOverlaps } from './overlapHelpers';

export const CollisionsContext = createContext();

// Extracted helper function
const calculateOverlapGroups = (currentBeat, isDragging, prevBeat) => {
    if (!currentBeat || isDragging) return null;

    const beatDiff = !isEqual(prevBeat, currentBeat);
    if (!beatDiff) return null;

    return findOverlaps(currentBeat);
};

// Extracted helper function
const processCopyEvents = (events) => {
    const list = Array.isArray(events) ? events : [events];
    const overlaps = recreateEvents(processOverlaps(list));
    return Object.values(overlaps).flatMap((instGroup) => Object.values(instGroup));
};

export const CollisionsProvider = ({ children }) => {
    /** * STATE & REFS ** */
    const [processedItems, setProcessedItems] = useState([]);
    const [overlapGroups, setOverlapGroups] = useState({});
    const [hasChanged, setHasChanged] = useState(false);
    const [copiedEvents, setCopiedEvents] = useState([]);
    const [dragging, setDragging] = useState({});
    const [currentBeat, setCurrentBeat] = useState(null);
    const prevProcessBeatResultRef = useRef(null);

    /** * CONTEXT & HOOKS ** */
    const { openLoadPanel } = useContext(PanelContext);

    const {
        addStageRef,
        addTimelineRef,
        deleteAllTimelines,
        findAllSoundEventElements,
        getGroupById,
        getProcessedElements,
        getProcessedGroups,
        getProcessedItems,
        getSoundEventById,
        removeStageRef,
        removeTimelineRef,
        stageRef,
        timelineRefs
    } = useTimelineRefs({ setHasChanged });

    const { clearLocalStorage, loadFromLocalStorage, saveToLocalStorage } = useLocalStorage({
        overlapGroups,
        setHasChanged,
        setOverlapGroups
    });

    const { processBeat } = useProcessBeat({ getProcessedElements, getProcessedGroups, timelineRefs });
    const [beats, saveBeatsToLocalStorage] = useBeats();

    const { history, pushToHistory, redo, redoHistory, undo } = useHistory({
        calculateOverlapsForAllInstruments: processBeat,
        overlapGroups,
        setOverlapGroups
    });

    const { changeBeatName, selectedBeat, setSelectedBeat, updateCurrentBeat } = useSelectedBeat({
        beats,
        overlapGroups,
        saveBeatsToLocalStorage,
        setHasChanged
    });

    /** * DERIVED VALUES ** */
    const isDragging = useMemo(() => Object.keys(dragging).length >= 1, [dragging]);

    // Use extracted beat refresher hook
    const { refreshBeat, updateBeatRef } = useBeatRefresher(
        currentBeat,
        processedItems,
        processBeat,
        getProcessedItems,
        isDragging,
        setCurrentBeat,
        setProcessedItems
    );

    const copyEvents = useCallback((events) => {
        const eventGroups = processCopyEvents(events);
        setCopiedEvents(eventGroups);
    }, []);

    // Use extracted timeline manager hook
    const { addTimeline } = useTimelineManager(setOverlapGroups);

    /** * OVERLAP GROUPS CALCULATION ** */
    const newOverlapGroups = calculateOverlapGroups(currentBeat, isDragging, prevProcessBeatResultRef.current);
    if (newOverlapGroups) {
        setOverlapGroups(newOverlapGroups);
        prevProcessBeatResultRef.current = currentBeat;
    }

    // Use extracted furthest end time hook
    const { furthestEndTime, totalDurationInPixels } = useFurthestEndTime(findAllSoundEventElements);

    /** * SIDE EFFECTS ** */
    useLayoutEffect(() => {
        if (Object.values(overlapGroups).length === 0) {
            openLoadPanel();
        }
    }, [openLoadPanel, overlapGroups]);

    /** * CONTEXT VALUE ** */
    const contextValue = useMemo(
        () => ({
            addStageRef,
            addTimeline,
            addTimelineRef,
            beats,
            changeBeatName,
            clearLocalStorage,
            copiedEvents,
            copyEvents,
            deleteAllTimelines,
            dragging,
            findAllSoundEventElements,
            furthestEndTime,
            getGroupById,
            getProcessedElements,
            getSoundEventById,
            hasChanged,
            history,
            isDragging,
            loadFromLocalStorage,
            overlapGroups,
            processBeat,
            processedItems,
            pushToHistory,
            redo,
            redoHistory,
            refreshBeat,
            removeStageRef,
            removeTimelineRef,
            saveBeatsToLocalStorage,
            saveToLocalStorage,
            selectedBeat,
            setCopiedEvents,
            setDragging,
            setHasChanged,
            setOverlapGroups,
            setSelectedBeat,
            stageRef: stageRef?.current,
            timelineRefs,
            totalDurationInPixels,
            undo,
            updateBeatRef,
            updateCurrentBeat
        }),
        [
            addStageRef,
            addTimeline,
            addTimelineRef,
            beats,
            changeBeatName,
            clearLocalStorage,
            copiedEvents,
            copyEvents,
            deleteAllTimelines,
            dragging,
            findAllSoundEventElements,
            furthestEndTime,
            getGroupById,
            getProcessedElements,
            getSoundEventById,
            hasChanged,
            history,
            isDragging,
            loadFromLocalStorage,
            overlapGroups,
            processBeat,
            processedItems,
            pushToHistory,
            redo,
            redoHistory,
            refreshBeat,
            removeStageRef,
            removeTimelineRef,
            saveBeatsToLocalStorage,
            saveToLocalStorage,
            selectedBeat,
            setSelectedBeat,
            stageRef,
            timelineRefs,
            totalDurationInPixels,
            undo,
            updateBeatRef,
            updateCurrentBeat
        ]
    );

    return <CollisionsContext.Provider value={contextValue}>{children}</CollisionsContext.Provider>;
};

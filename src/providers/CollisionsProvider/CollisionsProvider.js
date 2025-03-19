import isEqual from 'lodash/isEqual';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import pixelToSecondRatio from '../../globalConstants/pixelToSeconds';
import { PanelContext } from '../../hooks/usePanelState';
import { useBeats } from './hooks/useBeats';
import { useHistory } from './hooks/useHistory';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useProcessBeat } from './hooks/useProcessBeat';
import { useSelectedBeat } from './hooks/useSelectedBeat';
import { useTimelineRefs } from './hooks/useTimelineRefs';
import { findOverlaps } from './overlapHelpers';

export const CollisionsContext = createContext();

export const CollisionsProvider = ({ children }) => {
    const [processedItems, setProcessedItems] = useState([]);
    const [overlapGroups, setOverlapGroups] = useState({});
    const [hasChanged, setHasChanged] = useState(false);
    const [copiedEvents, setCopiedEvents] = useState([]);
    const { openLoadPanel } = useContext(PanelContext);
    const [dragging, setDragging] = useState({});

    const {
        addStageRef,
        addTimelineRef,
        deleteAllElements,
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

    const prevProcessBeatResultRef = useRef(null);

    const { processBeat } = useProcessBeat({ getProcessedElements, getProcessedGroups, timelineRefs });

    const [beats, saveBeatsToLocalStorage] = useBeats();

    const [currentBeat, setCurrentBeat] = useState(null);

    const isDragging = useMemo(() => Object.keys(dragging).length >= 1, [dragging]);

    // Only process beats when no dragging is active.

    const refreshBeat = useCallback(() => {
        const newData = processBeat();
        const newProcessedItems = getProcessedItems();

        if (!isEqual(currentBeat, newData)) {
            setCurrentBeat({ ...newData });

            if (!isEqual(processedItems, newProcessedItems)) {
                setProcessedItems(newProcessedItems);
            }
        }
    }, [currentBeat, processedItems, getProcessedItems, processBeat]);

    const updateBeatRef = useCallback(() => {
        if (isDragging) return;

        refreshBeat();
    }, [isDragging, refreshBeat]);

    const prevBeat = prevProcessBeatResultRef.current;
    const beatDiff = !isEqual(prevBeat, currentBeat);

    // Only recalc overlap groups if there's a beat change AND no dragging.
    if (beatDiff && !isDragging) {
        // alert('beatDiff && !isDragging');
        const newOverlapGroups = findOverlaps(currentBeat);
        setOverlapGroups(newOverlapGroups);

        console.log('OVERLAP GROUPS: ', newOverlapGroups);
        prevProcessBeatResultRef.current = currentBeat;
    }

    // Function to calculate the furthest end time by finding elements in the Konva stage
    const calculateFurthestEndTime = () => {
        const soundEventElements = findAllSoundEventElements();
        let maxEndX = 0;

        soundEventElements.forEach((element) => {
            const elementRect = element.getClientRect();
            const elementEndX = elementRect.x + elementRect.width;

            if (elementEndX > maxEndX) {
                maxEndX = elementEndX;
            }
        });

        // Convert the maximum X position back into seconds based on the pixelToSecondRatio
        return maxEndX / pixelToSecondRatio;
    };

    const furthestEndTime = calculateFurthestEndTime();

    const totalDurationInPixels = useMemo(() => furthestEndTime * pixelToSecondRatio, [furthestEndTime]);

    const { history, pushToHistory, redo, redoHistory, undo } = useHistory({
        overlapGroups,
        processBeat: () => {},
        setOverlapGroups,
        stageRef
    });

    const { changeBeatName, selectedBeat, setSelectedBeat, updateCurrentBeat } = useSelectedBeat({
        beats,
        overlapGroups,
        saveBeatsToLocalStorage,
        setHasChanged
    });

    const previousOverlapGroupsRef = useRef({});

    useEffect(() => {
        if (Object.values(overlapGroups).length === 0) {
            openLoadPanel();

            previousOverlapGroupsRef.current = {};
        }
    }, [openLoadPanel, overlapGroups]);

    const copyEvents = useCallback((events) => {
        const sortedEvents = events.sort((ev1, ev2) => ev1.startTime - ev2.startTime);
        setCopiedEvents(sortedEvents);
    }, []);

    const addTimeline = useCallback((passedName) => {
        setOverlapGroups((prevGroups) => {
            let newTimelineName = passedName ?? `Additional Timeline ${Object.keys(prevGroups).length + 1}`;

            // Ensure the name is unique
            let counter = 1;
            while (prevGroups[newTimelineName]) {
                newTimelineName = passedName
                    ? `${passedName} (${counter})`
                    : `Additional Timeline ${Object.keys(prevGroups).length + counter}`;
                counter += 1;
            }

            return {
                ...prevGroups,
                [newTimelineName]: {}
            };
        });
    }, []);

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
            deleteAllElements,
            deleteAllTimelines,
            dragging,
            findAllSoundEventElements,
            furthestEndTime,
            getGroupById,
            getProcessedElements,
            getProcessedItems,
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
            changeBeatName,
            addStageRef,
            addTimeline,
            addTimelineRef,
            clearLocalStorage,
            copiedEvents,
            copyEvents,
            deleteAllElements,
            deleteAllTimelines,
            findAllSoundEventElements,
            furthestEndTime,
            getProcessedElements,
            getSoundEventById,
            getGroupById,
            updateBeatRef,
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
            setSelectedBeat,
            stageRef,
            timelineRefs,
            totalDurationInPixels,
            undo,
            updateCurrentBeat,
            beats,
            saveBeatsToLocalStorage,
            removeStageRef,
            processBeat,
            getProcessedItems,
            processedItems,
            isDragging,
            dragging,
            setDragging,
            refreshBeat
        ]
    );

    return <CollisionsContext.Provider value={contextValue}>{children}</CollisionsContext.Provider>;
};

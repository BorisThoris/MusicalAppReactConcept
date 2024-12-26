import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import pixelToSecondRatio from '../../globalConstants/pixelToSeconds';
import { PanelContext } from '../../hooks/usePanelState';
import { useBeats } from './hooks/useBeats';
import { useCalculateRenderChanges } from './hooks/useCalculateRenderChanges';
import { useHistory } from './hooks/useHistory';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useOverlaps } from './hooks/useOverlaps';
import { useProcessBeat } from './hooks/useProcessBeat';
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
        getElementsForTimeline,
        getProcessedElements,
        getProcessedGroups,
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

    const previousBeat = useRef(overlapGroups);

    const { processBeat } = useProcessBeat({ getProcessedElements, getProcessedGroups, timelineRefs });

    const { findGroupForEvent, findOverlaps } = useOverlaps({
        overlapGroups,
        previousBeat,
        processBeat,
        setOverlapGroups
    });

    const [beats, saveBeatsToLocalStorage] = useBeats();

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
        processBeat,
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

    const addTimeline = useCallback(
        (passedName) => {
            const newTimelineName = passedName ?? `Additional Timeline ${Object.keys(overlapGroups).length + 1}`;

            setOverlapGroups((prevGroups) => ({
                ...prevGroups,
                [newTimelineName]: {}
            }));
        },
        [overlapGroups]
    );

    useCalculateRenderChanges({ findOverlaps, getProcessedElements, getProcessedGroups });

    console.log('OVERLAP GROUPS ');
    console.log(overlapGroups);

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
            findAllSoundEventElements,
            findGroupForEvent,
            furthestEndTime,
            getElementsForTimeline,
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
            saveBeatsToLocalStorage,
            saveToLocalStorage,
            selectedBeat,
            setCopiedEvents,
            setHasChanged,
            setOverlapGroups,
            setSelectedBeat,
            stageRef,
            timelineRefs,
            totalDurationInPixels,
            undo,
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
            findGroupForEvent,
            furthestEndTime,
            getElementsForTimeline,
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
            setSelectedBeat,
            stageRef,
            timelineRefs,
            totalDurationInPixels,
            undo,
            updateCurrentBeat,
            beats,
            saveBeatsToLocalStorage
        ]
    );

    return <CollisionsContext.Provider value={contextValue}>{children}</CollisionsContext.Provider>;
};

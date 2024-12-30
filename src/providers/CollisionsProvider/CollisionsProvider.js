import isEqual from 'lodash/isEqual';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import pixelToSecondRatio from '../../globalConstants/pixelToSeconds';
import { PanelContext } from '../../hooks/usePanelState';
import { useBeats } from './hooks/useBeats';
import { useHistory } from './hooks/useHistory';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useOverlaps } from './hooks/useOverlaps';
import { useProcessBeat } from './hooks/useProcessBeat';
import { useSelectedBeat } from './hooks/useSelectedBeat';
import { useTimelineRefs } from './hooks/useTimelineRefs';

export const CollisionsContext = createContext();

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
    const prevProcessBeatResultRef = useRef(null);

    const { processBeat } = useProcessBeat({ getProcessedElements, getProcessedGroups, timelineRefs });
    const currentBeat = processBeat();

    const { findGroupForEvent, findOverlaps } = useOverlaps({
        currentBeat,
        overlapGroups,
        previousBeat,
        setOverlapGroups
    });

    const [beats, saveBeatsToLocalStorage] = useBeats();

    useEffect(() => {
        const prevBeat = prevProcessBeatResultRef.current;

        if (!isEqual(prevBeat, currentBeat)) {
            findOverlaps();
            prevProcessBeatResultRef.current = currentBeat;
        }
    }, [currentBeat, findOverlaps]);

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

    console.log('OVERLAP GROUPS: ', overlapGroups);

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

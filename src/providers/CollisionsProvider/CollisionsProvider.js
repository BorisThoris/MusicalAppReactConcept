import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import pixelToSecondRatio from '../../globalConstants/pixelToSeconds';
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

    // Assuming timelineRefs is accessible in this scope or passed as an argument
    const processBeat = useCallback(() => {
        const processedElements = getProcessedElements();

        // Sort processedElements alphabetically by instrumentName and numerically by id within each instrumentName
        const sortedElements = processedElements.sort((a, b) => {
            // First, compare by instrumentName alphabetically
            if (a.recording.instrumentName < b.recording.instrumentName) return -1;
            if (a.recording.instrumentName > b.recording.instrumentName) return 1;

            // If instrumentNames are the same, compare by id numerically
            return a.recording.id - b.recording.id;
        });

        // Create the object to save with ordered instrument names
        const objToSave = sortedElements.reduce((acc, { recording }) => {
            const { id, instrumentName } = recording;

            // Initialize instrumentName if it doesn't exist
            if (!acc[instrumentName]) {
                acc[instrumentName] = {};
            }

            // Add recording under the relevant instrumentName
            acc[instrumentName][id] = recording;

            return acc;
        }, {});

        // Get all timeline names from timelineRefs, sorted alphabetically
        const timelineNames = Object.keys(timelineRefs).sort();

        // Ensure each timelineName is included in objToSave with an empty object if not already present
        timelineNames.forEach((timelineName) => {
            if (!objToSave[timelineName]) {
                objToSave[timelineName] = {};
            }
        });

        // Sort objToSave to keep timelines in alphabetical order, and each timeline's ids in numerical order
        const orderedObjToSave = Object.keys(objToSave)
            .sort()
            .reduce((acc, timelineName) => {
                // Sort each timeline's recordings by numeric id
                acc[timelineName] = Object.keys(objToSave[timelineName])
                    .sort((a, b) => Number(a) - Number(b))
                    .reduce((recordAcc, id) => {
                        // eslint-disable-next-line no-param-reassign
                        recordAcc[id] = objToSave[timelineName][id];
                        return recordAcc;
                    }, {});
                return acc;
            }, {});

        return orderedObjToSave;
    }, [getProcessedElements, timelineRefs]);

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

    const { selectedBeat, setSelectedBeat, updateCurrentBeat } = useSelectedBeat({ overlapGroups, setHasChanged });

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

    const elements = getProcessedElements();

    // Memoize element rects to avoid recalculating on each render
    const elementRects = useMemo(() => {
        return elements.map((el) => ({
            id: el.element.attrs['data-recording'].id,
            rect: el.element.getClientRect()
        }));
    }, [elements]);

    const previousBeat = useRef(overlapGroups);

    useEffect(() => {
        const currentBeat = processBeat();

        if (JSON.stringify(previousBeat.current) !== JSON.stringify(currentBeat)) {
            setOverlapGroups(processBeat());
            previousBeat.current = currentBeat;
        }
    }, [elementRects, processBeat]);

    const contextValue = useMemo(
        () => ({
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
            totalDurationInPixels,
            undo,
            updateCurrentBeat
        }),
        [
            addTimeline,
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
            furthestEndTime,
            totalDurationInPixels,
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

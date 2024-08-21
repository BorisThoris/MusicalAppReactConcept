import { createEvent } from '@testing-library/react';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useHistory } from './hooks/useHistory';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useOverlapGroups } from './hooks/useOverlapGroups';
import { useSelectedBeat } from './hooks/useSelectedBeat';
import { useTimelineRefs } from './hooks/useTimelineRefs';

export const CollisionsContext = createContext();

export const useCollisions = () => useContext(CollisionsContext);

export const CollisionsProvider = ({ children }) => {
    const [hasChanged, setHasChanged] = useState(false);
    const [copiedEvents, setCopiedEvents] = useState([]); // Add copiedEvents state

    const { addTimelineRef, removeTimelineRef, timelineRefs } = useTimelineRefs();

    const getProcessedElements = useCallback(() => {
        const processedElements = [];

        timelineRefs.forEach(({ instrumentName, ref }) => {
            if (ref && ref.children && ref.children.length > 0) {
                const elements = ref.find((node) => node.id().startsWith('element-'));

                if (!elements || elements.length === 0) {
                    console.warn(`No elements found for instrument ${instrumentName}, possible ref issue.`);
                    return;
                }

                elements.forEach((element) => {
                    const { height, width, x, y } = element.getClientRect();
                    const elementData = {
                        element,
                        height,
                        instrumentName,
                        recording: element.attrs['data-recording'],
                        timelineY: ref.timelineY,
                        width,
                        x,
                        y // Assuming ref contains timelineY
                    };

                    processedElements.push(elementData);
                });
            } else {
                console.log(`No children found in ref for instrument ${instrumentName}, skipping update.`);
            }
        });

        return processedElements;
    }, [timelineRefs]);

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
    const previousTimelineRefsRef = useRef({});

    useEffect(() => {
        const stringifyOverlapGroups = JSON.stringify(overlapGroups);
        const stringifyTimelineRefs = JSON.stringify(timelineRefs);

        if (
            previousOverlapGroupsRef.current !== stringifyOverlapGroups ||
            previousTimelineRefsRef.current !== stringifyTimelineRefs
        ) {
            console.log('Recalculating collisions due to changes in overlapGroups or timelineRefs');
            calculateCollisions();
            previousOverlapGroupsRef.current = stringifyOverlapGroups;
            previousTimelineRefsRef.current = stringifyTimelineRefs;
        }
    }, [calculateCollisions, overlapGroups, timelineRefs]);

    // Implement the insertRecording function
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

    // Implement the copyEvents function
    const copyEvents = useCallback((events) => {
        setCopiedEvents(events);
    }, []);

    const contextValue = useMemo(
        () => ({
            addTimelineRef,
            calculateCollisions,
            calculateOverlapsForAllInstruments,
            clearLocalStorage,
            copiedEvents,
            copyEvents,
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
            // Expose copiedEvents through the context
            setCopiedEvents,
            setHasChanged,
            setOverlapGroups,
            setSelectedBeat,
            timelineRefs,
            undo,
            updateCurrentBeat
        }),
        [
            calculateCollisions,
            addTimelineRef,
            timelineRefs,
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

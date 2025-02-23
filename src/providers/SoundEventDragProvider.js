import cloneDeep from 'lodash/cloneDeep';
import React, { createContext, useCallback, useContext, useMemo, useRef } from 'react';
import { ELEMENT_ID_PREFIX } from '../globalConstants/elementIds';
import pixelToSecondRatio from '../globalConstants/pixelToSeconds';
import { CollisionsContext } from './CollisionsProvider/CollisionsProvider';
import { SelectionContext } from './SelectionsProvider';

export const SoundEventDragContext = createContext();

export const SoundEventDragProvider = ({ children }) => {
    // ----- Contexts for collision and selection handling -----
    const { dragging, refreshBeat, setDragging } = useContext(CollisionsContext);
    const { clearSelection, isItemSelected, selectedItems } = useContext(SelectionContext);

    // Memoize selected element IDs so we don't recalculate on every drag event
    const selectedElementIds = useMemo(() => {
        return Object.values(selectedItems).map(({ id }) => id);
    }, [selectedItems]);

    // ----- Refs for tracking positions and drag requests -----
    const currentYRef = useRef(0);
    const previousXRef = useRef(null);
    const dragRequestRef = useRef(null);
    const highlightedTimelinesRef = useRef(new Set());

    // ===== Utility Functions =====

    // Force update the element's position by syncing its attributes
    const forceUpdatePosition = useCallback((element) => {
        element.setAttrs({
            x: element.x(),
            y: element.y()
        });
    }, []);

    // Update the start time (and end time based on event length) for the element's recording
    const updateStartTimeForElement = useCallback(({ element }) => {
        const recording = cloneDeep(element.attrs?.['data-recording']);
        const newStartTime = element.x() / pixelToSecondRatio;
        const newEndTime = newStartTime + recording.eventLength;

        // Only update if there is an actual change
        if (recording.startTime === newStartTime && recording.endTime === newEndTime) {
            return;
        }

        const updatedRecording = {
            ...recording,
            endTime: newEndTime,
            startTime: newStartTime
        };

        // If the element belongs to a group, update the group's recording data too
        const group = element.attrs?.['data-group-child'];
        if (group) {
            const groupElement = { ...group.attrs?.['data-overlap-group'] };
            const groupElements = { ...groupElement?.elements };
            if (groupElements) {
                const foundRecording = groupElements[recording.id];
                if (foundRecording) {
                    groupElements[recording.id] = updatedRecording;
                }
            }
            // group.setAttr('data-overlap-group', { ...groupElement, elements: groupElements });
            // group.getLayer().draw();
        }

        element.setAttr('data-recording', updatedRecording);
        console.log(
            `Updated element: ${element.attrs.id}, new start time: ${newStartTime}, new end time: ${newEndTime}`
        );
    }, []);

    // ===== Timeline Highlighting Functions =====

    // Apply a yellow fill to highlight a timeline
    const applyHighlightToTimeline = (timeline) => {
        if (timeline) {
            timeline.fill('yellow');
            timeline.getLayer().draw();
        }
    };

    // Remove the highlight by resetting the fill to white
    const removeHighlightFromTimeline = (timeline) => {
        if (timeline) {
            timeline.fill('white');
            timeline.getLayer().draw();
        }
    };

    // ===== Timeline Search Functions =====

    // Finds the closest timeline rectangle based on vertical distance
    const findClosestTimelineRect = useCallback((element) => {
        const stage = element.getStage();
        const elementBox = element.getClientRect();
        let closestTimeline = null;
        let minDistance = Infinity;

        const allTimelineElements = stage.find((node) => node.attrs?.id?.includes('timelineRect'));

        allTimelineElements.forEach((timelineElement) => {
            const timelineBox = timelineElement.getClientRect();
            const distance = Math.abs(elementBox.y - timelineBox.y);
            if (distance < minDistance) {
                minDistance = distance;
                closestTimeline = timelineElement;
            }
        });

        return closestTimeline;
    }, []);

    // Finds the closest timeline event container for an element
    const findClosestTimelineEvents = useCallback((element) => {
        const stage = element.getStage();
        const elementBox = element.getAbsolutePosition();
        let closestTimeline = null;
        let minDistance = Infinity;

        const allTimelineElements = stage.find((node) => node.attrs?.id?.includes('-events'));

        allTimelineElements.forEach((timelineElement) => {
            const timelineBox = timelineElement.parent.getAbsolutePosition();
            const distance = Math.abs(elementBox.y - timelineBox.y);
            if (distance < minDistance) {
                minDistance = distance;
                closestTimeline = timelineElement;
            }
        });

        return closestTimeline;
    }, []);

    // Inserts the element into the timeline by updating its instrument name
    const insertElementIntoTimeline = useCallback(({ closestTimeline, element }) => {
        const closestTimelineInstrumentName = closestTimeline?.attrs?.id.split('-')[0] || 'Unknown Timeline';
        const recording = cloneDeep(element.attrs['data-recording']);
        recording.instrumentName = closestTimelineInstrumentName;

        element.setAttr('data-recording', recording);
        console.log('UPDATED RECORDING', element.attrs['data-recording'].instrumentName);
    }, []);

    // ===== Reusable Function for Processing Selected Elements =====
    // This function iterates over the memoized selectedElementIds and applies the provided action callback to each element.
    const processSelectedElements = useCallback(
        (stage, action) => {
            selectedElementIds.forEach((id) => {
                const targetElement = stage.findOne(`#${ELEMENT_ID_PREFIX}${id}`);
                if (targetElement) {
                    action(targetElement);
                }
            });
        },
        [selectedElementIds]
    );

    // ===== Drag Event Handlers =====

    // Handle drag start: bring the element to the top and set the initial positions
    const handleDragStart = useCallback(
        (el) => {
            el.evt.stopPropagation();
            el.target.moveToTop();

            const recordingId = el.target.attrs['data-recording']?.id;
            if (recordingId && !isItemSelected(recordingId)) {
                clearSelection();
            }
            previousXRef.current = el.target.x();
            currentYRef.current = el.evt.y;

            const processId = (id) => (id.startsWith(ELEMENT_ID_PREFIX) ? id.split(ELEMENT_ID_PREFIX)[1] : id);
            const newDragging = { [processId(el.target.attrs.id)]: true };

            // Use the memoized selectedElementIds array for processing
            if (selectedElementIds.length > 0) {
                selectedElementIds.forEach((id) => {
                    newDragging[processId(id)] = true;
                });
            }
            setDragging((prevDragging) => ({ ...prevDragging, ...newDragging }));
        },
        [clearSelection, isItemSelected, selectedElementIds, setDragging]
    );

    const handleDragMove = useCallback(
        (e) => {
            e.evt.stopPropagation();
            const stage = e.target.getStage();
            if (!stage) return;

            if (dragRequestRef.current) {
                cancelAnimationFrame(dragRequestRef.current);
            }

            dragRequestRef.current = requestAnimationFrame(() => {
                const currentX = e.target.x();
                const deltaY = e.evt.y - currentYRef.current;
                const deltaX = previousXRef.current !== null ? currentX - previousXRef.current : 0;

                previousXRef.current = currentX;
                currentYRef.current = e.evt.y;

                const newHighlightedTimelines = new Set();

                const processElement = (element) => {
                    // Move the element by the delta amounts
                    element.move({ x: deltaX, y: deltaY });
                    forceUpdatePosition(element);

                    // Highlight the closest timeline rectangle
                    const closestTimeline = findClosestTimelineRect(element);
                    if (closestTimeline) {
                        newHighlightedTimelines.add(closestTimeline);
                    }

                    // Update its timeline association as the element moves
                    const closestTimelineEvents = findClosestTimelineEvents(element);
                    if (closestTimelineEvents) {
                        console.log('yoooo');
                        insertElementIntoTimeline({ closestTimeline: closestTimelineEvents, element });
                    }
                };

                if (selectedElementIds.length > 0) {
                    processSelectedElements(stage, processElement);
                } else {
                    processElement(e.target);
                }

                // Update timeline highlights
                highlightedTimelinesRef.current.forEach((timeline) => {
                    if (!newHighlightedTimelines.has(timeline)) {
                        removeHighlightFromTimeline(timeline);
                    }
                });
                newHighlightedTimelines.forEach((timeline) => {
                    if (!highlightedTimelinesRef.current.has(timeline)) {
                        applyHighlightToTimeline(timeline);
                    }
                });
                highlightedTimelinesRef.current = newHighlightedTimelines;
            });
        },
        [
            findClosestTimelineRect,
            findClosestTimelineEvents,
            insertElementIntoTimeline,
            selectedElementIds,
            forceUpdatePosition,
            processSelectedElements
        ]
    );

    // Finalize the drag by inserting the element into its closest timeline and updating its time
    const finalizeDrag = useCallback(
        (element) => {
            const closestTimeline = findClosestTimelineEvents(element);

            console.log('Finalizing Drag for Element', element);
            console.log('ClosestTimeline ', closestTimeline);

            insertElementIntoTimeline({ closestTimeline, element });
            updateStartTimeForElement({ element });
        },
        [findClosestTimelineEvents, insertElementIntoTimeline, updateStartTimeForElement]
    );

    // Handle drag end: finalize position updates, clear highlights, and reset dragging state
    const handleDragEnd = useCallback(
        (e) => {
            const stage = e.target.getStage();
            if (!stage) return;

            if (selectedElementIds.length > 0) {
                processSelectedElements(stage, finalizeDrag);
            } else {
                finalizeDrag(e.target);
            }

            highlightedTimelinesRef.current.forEach((timeline) => {
                removeHighlightFromTimeline(timeline);
            });
            highlightedTimelinesRef.current = new Set();
            previousXRef.current = null;
            setDragging({});
            refreshBeat();
        },
        [finalizeDrag, selectedElementIds, setDragging, refreshBeat, processSelectedElements]
    );

    // Utility to check if an element is currently being dragged
    const isElementBeingDragged = useCallback((id) => !!dragging[id], [dragging]);

    // ----- Context Value -----
    const contextValue = useMemo(
        () => ({
            applyHighlightToTimeline,
            handleDragEnd,
            handleDragMove,
            handleDragStart,
            insertElementIntoTimeline,
            isElementBeingDragged,
            removeHighlightFromTimeline
        }),
        [handleDragEnd, handleDragMove, handleDragStart, insertElementIntoTimeline, isElementBeingDragged]
    );

    return <SoundEventDragContext.Provider value={contextValue}>{children}</SoundEventDragContext.Provider>;
};

const useDrag = () => useContext(SoundEventDragContext);

export default useDrag;

import React, { createContext, useCallback, useContext, useMemo, useRef } from 'react';
import { ELEMENT_ID_PREFIX } from '../globalConstants/elementIds';
import pixelToSecondRatio from '../globalConstants/pixelToSeconds';
import { CollisionsContext } from './CollisionsProvider/CollisionsProvider';
import { SelectionContext } from './SelectionsProvider';

export const SoundEventDragContext = createContext();

export const SoundEventDragProvider = ({ children }) => {
    const { dragging, refreshBeat, setDragging, stageRef } = useContext(CollisionsContext);
    const { clearSelection, isItemSelected, selectedItems } = useContext(SelectionContext);

    // Memoize selected element IDs so we don't recalculate on every drag event
    const selectedElementIds = useMemo(() => {
        return Object.values(selectedItems).map(({ id }) => id);
    }, [selectedItems]);

    // ----- Refs for tracking positions and drag requests -----
    // For tracking the main element’s starting position
    const initialXRef = useRef(null);
    const initialMainYRef = useRef(null);
    // For requestAnimationFrame and timeline highlights
    const dragRequestRef = useRef(null);
    const highlightedTimelinesRef = useRef(new Set());
    // Map to store the initial positions of all selected elements
    const initialPositionsRef = useRef(new Map());

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
        const recording = { ...element.attrs?.['data-recording'] };
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
    const findClosestTimelineRect = useCallback(
        (element) => {
            const elementBox = element.getClientRect();
            let closestTimeline = null;
            let minDistance = Infinity;

            const allTimelineElements = stageRef.find((node) => node.attrs?.id?.includes('timelineRect'));

            allTimelineElements.forEach((timelineElement) => {
                const timelineBox = timelineElement.getClientRect();
                const distance = Math.abs(elementBox.y - timelineBox.y);
                if (distance < minDistance) {
                    minDistance = distance;
                    closestTimeline = timelineElement;
                }
            });

            return closestTimeline;
        },
        [stageRef]
    );

    // Finds the closest timeline event container for an element
    const findClosestTimelineEvents = useCallback(
        (element) => {
            const stage = stageRef;
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
        },
        [stageRef]
    );

    // Inserts the element into the timeline by updating its instrument name
    const insertElementIntoTimeline = useCallback(({ closestTimeline, element }) => {
        const closestTimelineInstrumentName = closestTimeline?.attrs?.id.split('-')[0] || 'Unknown Timeline';
        const recording = { ...element.attrs['data-recording'] };
        recording.instrumentName = closestTimelineInstrumentName;

        element.setAttr('data-recording', recording);
    }, []);

    // ===== Reusable Function for Processing Selected Elements =====
    // This function iterates over the memoized selectedElementIds
    // and applies the provided action callback to each element.
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

    const handleDragStart = useCallback(
        (el) => {
            el.evt.stopPropagation();
            el.target.moveToTop();

            const recordingId = el.target.attrs['data-recording']?.id;
            if (recordingId && !isItemSelected(recordingId)) {
                clearSelection();
            }

            // Store the main element's initial positions
            initialXRef.current = el.target.x();
            initialMainYRef.current = el.target.y();

            // Store the initial positions for all selected elements
            const stage = stageRef;
            processSelectedElements(stage, (element) => {
                initialPositionsRef.current.set(element.attrs.id, { x: element.x(), y: element.y() });
            });

            const processId = (id) => (id.startsWith(ELEMENT_ID_PREFIX) ? id.split(ELEMENT_ID_PREFIX)[1] : id);
            const newDragging = { [processId(el.target.attrs.id)]: true };

            // Ensure dragging state is set for ALL selected items
            selectedElementIds.forEach((id) => {
                newDragging[processId(id)] = true;
            });

            setDragging((prevDragging) => ({ ...prevDragging, ...newDragging }));
        },
        [clearSelection, isItemSelected, selectedElementIds, setDragging, stageRef, processSelectedElements]
    );

    const handleDragMove = useCallback(
        (e) => {
            e.evt.stopPropagation();
            const stage = stageRef;
            if (!stage) return;

            if (dragRequestRef.current) {
                cancelAnimationFrame(dragRequestRef.current);
            }

            dragRequestRef.current = requestAnimationFrame(() => {
                // Calculate total displacement from the main element's initial position
                const mainCurrentX = e.target.x();
                const mainCurrentY = e.target.y();
                const totalDeltaX = mainCurrentX - initialXRef.current;
                const totalDeltaY = mainCurrentY - initialMainYRef.current;

                const newHighlightedTimelines = new Set();

                const processElement = (element) => {
                    const { id } = element.attrs;
                    const initialPos = initialPositionsRef.current.get(id);
                    if (initialPos) {
                        // Set the element's new position based on its own initial position plus the total displacement
                        const newX = initialPos.x + totalDeltaX;
                        const newY = initialPos.y + totalDeltaY;
                        element.setAttrs({ x: newX, y: newY });
                        forceUpdatePosition(element);
                    }

                    const closestTimeline = findClosestTimelineRect(element);
                    if (closestTimeline) {
                        newHighlightedTimelines.add(closestTimeline);
                    }
                };

                processSelectedElements(stage, processElement);

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
        [stageRef, forceUpdatePosition, findClosestTimelineRect, processSelectedElements]
    );

    // Finalize the drag by inserting the element into its closest timeline and updating its time
    const finalizeDrag = useCallback(
        (element) => {
            const closestTimeline = findClosestTimelineEvents(element);
            insertElementIntoTimeline({ closestTimeline, element });
            updateStartTimeForElement({ element });
        },
        [findClosestTimelineEvents, insertElementIntoTimeline, updateStartTimeForElement]
    );

    // Handle drag end: finalize position updates, clear highlights, and reset dragging state
    const handleDragEnd = useCallback(
        (e) => {
            const stage = stageRef;
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
            setDragging({});
            refreshBeat();
        },
        [stageRef, selectedElementIds.length, setDragging, refreshBeat, processSelectedElements, finalizeDrag]
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

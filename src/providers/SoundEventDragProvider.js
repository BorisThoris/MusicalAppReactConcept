import cloneDeep from 'lodash/cloneDeep';
import React, { createContext, useCallback, useContext, useMemo, useRef } from 'react';
import { ELEMENT_ID_PREFIX } from '../globalConstants/elementIds';
import pixelToSecondRatio from '../globalConstants/pixelToSeconds';
import { CollisionsContext } from './CollisionsProvider/CollisionsProvider';
import { SelectionContext } from './SelectionsProvider';

export const SoundEventDragContext = createContext();

export const SoundEventDragProvider = ({ children }) => {
    const { dragging, refreshBeat, setDragging, stageRef } = useContext(CollisionsContext);
    const { clearSelection, isItemSelected, selectedItems } = useContext(SelectionContext);

    // Memoize selected element IDs so we don't recalc on every drag event
    const selectedElementIds = useMemo(() => {
        return Object.values(selectedItems).map(({ id }) => id);
    }, [selectedItems]);

    // ----- Refs for tracking positions and drag requests -----
    // Removed previousXRef (used in current incremental logic) and replaced with initialXRef
    const initialXRef = useRef(null); // NEW: stores the main element's initial X (total displacement logic)
    const currentYRef = useRef(0);
    const dragRequestRef = useRef(null);
    const highlightedTimelinesRef = useRef(new Set());
    const initialPositionsRef = useRef(new Map());

    // ===== Utility Functions =====
    const forceUpdatePosition = useCallback((element) => {
        element.setAttrs({
            x: element.x(),
            y: element.y()
        });
    }, []);

    const updateStartTimeForElement = useCallback(({ element }) => {
        const recording = cloneDeep(element.attrs?.['data-recording']);
        const newStartTime = element.x() / pixelToSecondRatio;
        const newEndTime = newStartTime + recording.eventLength;

        if (recording.startTime === newStartTime && recording.endTime === newEndTime) return;

        const updatedRecording = {
            ...recording,
            endTime: newEndTime,
            startTime: newStartTime
        };

        const group = element.attrs?.['data-group-child'];
        if (group) {
            const groupElement = cloneDeep(group.attrs?.['data-overlap-group']);
            const groupElements = { ...groupElement?.elements };
            if (groupElements && groupElements[recording.id]) {
                groupElements[recording.id] = updatedRecording;
            }
        }

        element.setAttr('data-recording', updatedRecording);
        console.log(
            `Updated element: ${element.attrs.id}, new start time: ${newStartTime}, new end time: ${newEndTime}`
        );
    }, []);

    // ===== Timeline Highlighting Functions =====
    const applyHighlightToTimeline = (timeline) => {
        if (timeline) {
            timeline.fill('yellow');
            timeline.getLayer().draw();
        }
    };

    const removeHighlightFromTimeline = (timeline) => {
        if (timeline) {
            timeline.fill('white');
            timeline.getLayer().draw();
        }
    };

    // ===== Timeline Search Functions =====
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

    const findClosestTimelineEvents = useCallback(
        (element) => {
            const elementBox = element.getAbsolutePosition();
            let closestTimeline = null;
            let minDistance = Infinity;

            const allTimelineElements = stageRef.find((node) => node.attrs?.id?.includes('-events'));
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

    const insertElementIntoTimeline = useCallback(({ closestTimeline, element }) => {
        const closestTimelineInstrumentName = closestTimeline?.attrs?.id.split('-')[0] || 'Unknown Timeline';
        const recording = cloneDeep(element.attrs['data-recording']);
        recording.instrumentName = closestTimelineInstrumentName;
        element.setAttr('data-recording', recording);
    }, []);

    // ===== Reusable Function for Processing Selected Elements =====
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

    // Drag start: initialize X and Y refs.
    const handleDragStart = useCallback(
        (el) => {
            el.evt.stopPropagation();
            el.target.moveToTop();

            const recordingId = el.target.attrs['data-recording']?.id;
            if (recordingId && !isItemSelected(recordingId)) {
                clearSelection();
            }

            // NEW: Save the main element's initial X position (for total X displacement)
            initialXRef.current = el.target.x();
            // Retain current Y initialization from the event
            currentYRef.current = el.evt.y;

            // Save initial positions for all selected elements
            const stage = stageRef;
            processSelectedElements(stage, (element) => {
                initialPositionsRef.current.set(element.attrs.id, { x: element.x(), y: element.y() });
            });

            const processId = (id) => (id.startsWith(ELEMENT_ID_PREFIX) ? id.split(ELEMENT_ID_PREFIX)[1] : id);
            const newDragging = { [processId(el.target.attrs.id)]: true };

            selectedElementIds.forEach((id) => {
                newDragging[processId(id)] = true;
            });

            setDragging((prevDragging) => ({ ...prevDragging, ...newDragging }));
        },
        [clearSelection, isItemSelected, selectedElementIds, setDragging, stageRef, processSelectedElements]
    );

    // Drag move: update positions using total X displacement (old X logic) and incremental Y displacement.
    const handleDragMove = useCallback(
        (e) => {
            e.evt.stopPropagation();
            const stage = stageRef;
            if (!stage) return;

            if (dragRequestRef.current) {
                cancelAnimationFrame(dragRequestRef.current);
            }

            dragRequestRef.current = requestAnimationFrame(() => {
                // Get current X and Y values
                const currentX = e.target.x();
                const currentY = e.evt.y;
                // NEW: Calculate total X displacement from initial position
                const totalDeltaX = currentX - initialXRef.current;
                // Y continues to use incremental delta as before
                const deltaY = currentY - currentYRef.current;
                // Update currentYRef for the next event
                currentYRef.current = currentY;

                const newHighlightedTimelines = new Set();

                const processElement = (element) => {
                    // For X: update absolutely using initial position + total delta
                    const initialPos = initialPositionsRef.current.get(element.attrs.id);
                    if (initialPos) {
                        const newX = initialPos.x + totalDeltaX;
                        element.setAttr('x', newX);
                    }
                    // For Y: continue using incremental updates
                    element.move({ y: deltaY });
                    forceUpdatePosition(element);

                    // Highlight timeline based on new position
                    const closestTimeline = findClosestTimelineRect(element);
                    if (closestTimeline) {
                        newHighlightedTimelines.add(closestTimeline);
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
        [stageRef, selectedElementIds.length, forceUpdatePosition, findClosestTimelineRect, processSelectedElements]
    );

    // Finalize the drag: update the timeline and start time as before.
    const finalizeDrag = useCallback(
        (element) => {
            const closestTimeline = findClosestTimelineEvents(element);
            insertElementIntoTimeline({ closestTimeline, element });
            updateStartTimeForElement({ element });
        },
        [findClosestTimelineEvents, insertElementIntoTimeline, updateStartTimeForElement]
    );

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
            // Reset the initialXRef if needed (optional)
            initialXRef.current = null;
            setDragging({});
            refreshBeat();
        },
        [stageRef, selectedElementIds.length, setDragging, refreshBeat, processSelectedElements, finalizeDrag]
    );

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

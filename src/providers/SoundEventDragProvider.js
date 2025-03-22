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

    // Refs for tracking positions and drag requests
    // For X, use the "X logic" with the main element's initial X position.
    const initialXRef = useRef(null);
    // For Y, we continue using the incremental logic.
    const currentYRef = useRef(0);
    const dragRequestRef = useRef(null);
    const highlightedTimelinesRef = useRef(new Set());
    // Save each selected element's initial position (we'll only use X for absolute positioning)
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

    // Drag start: initialize the X ref with the main element's X and store initial positions.
    // For Y, we continue to use the incremental update.
    const handleDragStart = useCallback(
        (el) => {
            el.evt.stopPropagation();
            el.target.moveToTop();

            const recordingId = el.target.attrs['data-recording']?.id;
            if (recordingId && !isItemSelected(recordingId)) {
                clearSelection();
            }

            // Save the main element's initial X and current Y for incremental updates.
            initialXRef.current = el.target.x();
            currentYRef.current = el.evt.y;

            // Save initial positions for all selected elements (we only need X for absolute repositioning)
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

    // Drag move: update only X using absolute displacement, and update Y incrementally.
    const handleDragMove = useCallback(
        (e) => {
            e.evt.stopPropagation();
            const stage = stageRef;
            if (!stage) return;

            if (dragRequestRef.current) {
                cancelAnimationFrame(dragRequestRef.current);
            }

            dragRequestRef.current = requestAnimationFrame(() => {
                // Calculate total X displacement using the new logic
                const currentMainX = e.target.x();
                const totalDeltaX = currentMainX - initialXRef.current;
                // Calculate Y delta incrementally (old logic)
                const currentY = e.evt.y;
                const deltaY = currentY - currentYRef.current;

                const newHighlightedTimelines = new Set();

                const processElement = (element) => {
                    const { id } = element.attrs;
                    const initialPos = initialPositionsRef.current.get(id);
                    if (initialPos) {
                        // Update X using the absolute displacement from the main element's initial X
                        const newX = initialPos.x + totalDeltaX;
                        element.setAttr('x', newX);
                    }
                    // Update Y incrementally
                    element.move({ y: deltaY });
                    forceUpdatePosition(element);

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
                // Update currentY for the next incremental update
                currentYRef.current = currentY;
            });
        },
        [stageRef, forceUpdatePosition, findClosestTimelineRect, processSelectedElements, selectedElementIds.length]
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

            processSelectedElements(stage, finalizeDrag);

            highlightedTimelinesRef.current.forEach((timeline) => {
                removeHighlightFromTimeline(timeline);
            });
            highlightedTimelinesRef.current = new Set();
            setDragging({});
            refreshBeat();
        },
        [stageRef, setDragging, refreshBeat, processSelectedElements, finalizeDrag]
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

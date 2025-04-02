import React, { createContext, useCallback, useContext, useMemo, useRef } from 'react';
import { ELEMENT_ID_PREFIX } from '../globalConstants/elementIds';
import pixelToSecondRatio from '../globalConstants/pixelToSeconds';
import { CollisionsContext } from './CollisionsProvider/CollisionsProvider';
import { SelectionContext } from './SelectionsProvider';

export const SoundEventDragContext = createContext();

export const SoundEventDragProvider = ({ children }) => {
    const { dragging, refreshBeat, setDragging, stageRef } = useContext(CollisionsContext);
    const { clearSelection, isItemSelected, selectedItems } = useContext(SelectionContext);

    // Memoize selected element IDs so we don't recalc on every drag event.
    const selectedElementIds = useMemo(() => {
        return Object.values(selectedItems).map(({ id }) => id);
    }, [selectedItems]);

    // Refs for tracking positions and drag requests.
    const initialXRef = useRef(null); // For total X displacement.
    const currentYRef = useRef(0);
    const dragRequestRef = useRef(null);
    const highlightedTimelinesRef = useRef(new Set());
    const initialPositionsRef = useRef(new Map());

    // ----- Utility Functions -----
    const forceUpdatePosition = useCallback((element) => {
        element.setAttrs({
            x: element.x(),
            y: element.y()
        });
    }, []);

    /**
     * Updates the start and end times.
     *
     * For an individual element, it calculates the absolute x position (using getAbsolutePosition())
     * so that whether it is standalone or inside a group its timing is correct.
     *
     * For a group (a node with a data-overlap-group attribute), it updates its own timing data,
     * and then iterates through all child elements (which have data-recording) to update each one.
     */
    const updateStartTimeForElement = useCallback(({ element }) => {
        // Case 1: Individual element.
        if (element.attrs['data-recording']) {
            // Use absolute x so that if the element is inside a group it uses the stage position.
            const absoluteX = element.getAbsolutePosition().x;
            const recording = { ...element.attrs['data-recording'] };
            const newStartTime = absoluteX / pixelToSecondRatio;
            const newEndTime = newStartTime + recording.eventLength;

            if (recording.startTime === newStartTime && recording.endTime === newEndTime) return;

            const updatedRecording = {
                ...recording,
                endTime: newEndTime,
                startTime: newStartTime
            };

            // If this element belongs to a group, update the corresponding group data.
            const group = element.attrs['data-group-child'];
            if (group) {
                const groupData = { ...group.attrs['data-overlap-group'] };
                if (groupData && groupData.elements && groupData.elements[recording.id]) {
                    groupData.elements[recording.id] = updatedRecording;
                    group.setAttr('data-overlap-group', groupData);
                }
            }

            element.setAttr('data-recording', updatedRecording);
            console.log(
                `Updated element: ${element.attrs.id}, new start time: ${newStartTime}, new end time: ${newEndTime}`
            );
        }
        // Case 2: Group element.
        else if (element.attrs['data-overlap-group']) {
            // Update the group's own timing.
            const newGroupStartTime = element.x() / pixelToSecondRatio;
            const groupData = { ...element.attrs['data-overlap-group'] };
            groupData.startTime = newGroupStartTime;
            groupData.endTime = newGroupStartTime + groupData.length;
            element.setAttr('data-overlap-group', groupData);
            console.log(
                `Updated group element: ${element.attrs.id}, new start time: ${newGroupStartTime}, new end time: ${
                    newGroupStartTime + groupData.length
                }`
            );

            const elements = element.attrs['data-overlap-group'];

            // Find and update each child node by invoking updateStartTimeForElement.
            const groupChildren = element.find((node) => node.attrs && node.attrs['data-recording']);

            console.log('groupChildren', groupChildren);

            groupChildren.forEach((child) => {
                updateStartTimeForElement({ element: child });
            });
        }
    }, []);

    // ----- Timeline Highlighting Functions -----
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

    // ----- Timeline Search Functions -----
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

    // Update timeline insertion for both individual elements and groups.
    const insertElementIntoTimeline = useCallback(({ closestTimeline, element }) => {
        const closestTimelineInstrumentName = closestTimeline?.attrs?.id.split('-')[0] || 'Unknown Timeline';
        if (element.attrs['data-recording']) {
            const recording = { ...element.attrs['data-recording'] };
            recording.instrumentName = closestTimelineInstrumentName;
            element.setAttr('data-recording', recording);
        } else if (element.attrs['data-overlap-group']) {
            const groupData = { ...element.attrs['data-overlap-group'] };
            groupData.instrumentName = closestTimelineInstrumentName;
            element.setAttr('data-overlap-group', groupData);
        }
    }, []);

    // ----- Reusable Function for Processing Selected Elements -----
    const processSelectedElements = useCallback(
        (stage, action) => {
            selectedElementIds.forEach((id) => {
                // Try to find either an individual element or a group.
                const targetElement =
                    stage.findOne(`#${ELEMENT_ID_PREFIX}${id}`) || stage.findOne(`#group-element-${id}`);
                if (targetElement) {
                    action(targetElement);
                }
            });
        },
        [selectedElementIds]
    );

    // ----- Drag Event Handlers -----

    // Drag start: initialize X and Y refs.
    const handleDragStart = useCallback(
        (el) => {
            el.evt.stopPropagation();
            el.target.moveToTop();

            // Check for either type using data-recording or data-overlap-group.
            const itemId = el.target.attrs['data-recording']?.id || el.target.attrs['data-overlap-group']?.id;
            if (itemId && !isItemSelected(itemId)) {
                clearSelection();
            }

            // Save the main element's initial X position.
            initialXRef.current = el.target.x();
            // Retain current Y initialization from the event.
            currentYRef.current = el.evt.y;

            // Save initial positions for all selected elements.
            const stage = stageRef;
            processSelectedElements(stage, (element) => {
                initialPositionsRef.current.set(element.attrs.id, { x: element.x(), y: element.y() });
            });

            const processId = (id) => {
                if (id.startsWith(ELEMENT_ID_PREFIX)) {
                    return id.split(ELEMENT_ID_PREFIX)[1];
                }
                if (id.startsWith('group-element-')) {
                    return id.split('group-element-')[1];
                }
                return id;
            };

            const newDragging = { [processId(el.target.attrs.id)]: true };

            selectedElementIds.forEach((id) => {
                newDragging[processId(id)] = true;
            });

            setDragging((prevDragging) => ({ ...prevDragging, ...newDragging }));
        },
        [clearSelection, isItemSelected, selectedElementIds, setDragging, stageRef, processSelectedElements]
    );

    // Drag move: update positions using total X displacement and incremental Y displacement.
    const handleDragMove = useCallback(
        (e) => {
            e.evt.stopPropagation();
            const stage = stageRef;
            if (!stage) return;

            if (dragRequestRef.current) {
                cancelAnimationFrame(dragRequestRef.current);
            }

            dragRequestRef.current = requestAnimationFrame(() => {
                // Get current X and Y values.
                const currentX = e.target.x();
                const currentY = e.evt.y;
                // Calculate total X displacement from initial position.
                const totalDeltaX = currentX - initialXRef.current;
                // Y uses incremental updates.
                const deltaY = currentY - currentYRef.current;
                currentYRef.current = currentY;

                const newHighlightedTimelines = new Set();

                const processElement = (element) => {
                    // For X: update absolutely using the initial position + total delta.
                    const initialPos = initialPositionsRef.current.get(element.attrs.id);
                    if (initialPos) {
                        const newX = initialPos.x + totalDeltaX;
                        element.setAttr('x', newX);
                    }
                    // For Y: continue using incremental updates.
                    element.move({ y: deltaY });
                    forceUpdatePosition(element);

                    // Highlight timeline based on new position.
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

                // Update timeline highlights.
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

    // Finalize the drag: update the timeline and start time.
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

            // Reset the initial coordinate references.
            initialXRef.current = null;
            currentYRef.current = 0;
            initialPositionsRef.current.clear();

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

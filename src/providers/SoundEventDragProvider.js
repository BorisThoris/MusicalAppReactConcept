import cloneDeep from 'lodash/cloneDeep';
import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { ELEMENT_ID_PREFIX } from '../globalConstants/elementIds';
import pixelToSecondRatio from '../globalConstants/pixelToSeconds';
import { SelectionContext } from './SelectionsProvider';

export const SoundEventDragContext = createContext();

export const SoundEventDragProvider = ({ children }) => {
    const { clearSelection, isItemSelected, selectedItems } = useContext(SelectionContext);

    const [currentY, setCurrentY] = useState(0);
    const [isDragging, setIsDragging] = useState({});
    const previousXRef = useRef(null);
    const dragRequestRef = useRef(null);
    const highlightedTimelinesRef = useRef(new Set());

    // Explicitly setting positions in both Konva elements and internal state
    const forceUpdatePosition = useCallback((element) => {
        element.setAttrs({
            x: element.x(),
            y: element.y()
        });
    }, []);

    const updateStartTimeForElement = useCallback(({ element }) => {
        const recording = cloneDeep(element.attrs?.['data-recording']);

        // Calculate new start and end times
        const newStartTime = element.x() / pixelToSecondRatio;
        const newEndTime = newStartTime + recording.eventLength;

        // Check if there's an actual change before proceeding
        if (recording.startTime === newStartTime && recording.endTime === newEndTime) {
            return;
        }

        // Create an updated recording object
        const updatedRecording = {
            ...recording,
            endTime: newEndTime,
            startTime: newStartTime
        };

        // Update the group data if applicable
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

            group.setAttr('data-overlap-group', { ...groupElement, elements: groupElements });
            group.getLayer().draw();
        }

        // Update the element attributes
        element.setAttr('data-recording', updatedRecording);

        console.log(
            `Updated element: ${element.attrs.id}, new start time: ${newStartTime}, new end time: ${newEndTime}`
        );
    }, []);

    const handleDragStart = useCallback(
        (el) => {
            el.evt.stopPropagation(); // Stop event bubbling
            el.target.moveToTop();

            const recordingId = el.target.attrs['data-recording']?.id;
            if (recordingId && !isItemSelected(recordingId)) {
                clearSelection();
            }
            previousXRef.current = el.target.x();
            setCurrentY(el.evt.y);

            const processId = (id) => (id.startsWith(ELEMENT_ID_PREFIX) ? id.split(ELEMENT_ID_PREFIX)[1] : id);
            const newDragging = { [processId(el.target.attrs.id)]: true };

            if (Object.keys(selectedItems).length > 0) {
                Object.values(selectedItems).forEach(({ id }) => {
                    newDragging[processId(id)] = true;
                });
            }

            setIsDragging((prevDragging) => ({ ...prevDragging, ...newDragging }));
        },
        [clearSelection, isItemSelected, selectedItems]
    );

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

    const handleDragMove = useCallback(
        (e) => {
            e.evt.stopPropagation(); // Stop event bubbling
            const stage = e.target.getStage();
            if (!stage) return;

            if (dragRequestRef.current) {
                cancelAnimationFrame(dragRequestRef.current);
            }

            dragRequestRef.current = requestAnimationFrame(() => {
                const currentX = e.target.x();
                const deltaY = e.evt.y - currentY;
                const deltaX = previousXRef.current !== null ? currentX - previousXRef.current : 0;

                previousXRef.current = currentX;
                setCurrentY(e.evt.y);

                const newHighlightedTimelines = new Set();

                const findClosestTimeline = (element) => {
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
                };

                const processElement = (element) => {
                    element.move({ x: deltaX, y: deltaY });
                    forceUpdatePosition(element); // Force update after movement

                    const closestTimeline = findClosestTimeline(element);
                    if (closestTimeline) {
                        newHighlightedTimelines.add(closestTimeline);
                    }
                };

                if (Object.keys(selectedItems).length > 0) {
                    Object.values(selectedItems).forEach(({ id }) => {
                        const targetElement = stage.findOne(`#${ELEMENT_ID_PREFIX}${id}`);
                        if (targetElement) {
                            processElement(targetElement);
                        }
                    });
                } else {
                    processElement(e.target);
                }

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

                const layer = e.target.getStage();
                if (layer) {
                    layer.draw();
                }
            });
        },
        [currentY, selectedItems, forceUpdatePosition]
    );

    const insertElementIntoTimeline = useCallback(({ closestTimeline, element }) => {
        const closestTimelineInstrumentName = closestTimeline?.attrs?.id.split('-')[0] || 'Unknown Timeline';

        const recording = cloneDeep(element.attrs['data-recording']);
        recording.instrumentName = closestTimelineInstrumentName;

        element.setAttr('data-recording', recording);

        // Redraw the timeline's layer to reflect changes
        closestTimeline.clearCache();
        closestTimeline.draw();
        closestTimeline.getLayer().clearCache();
        closestTimeline.getLayer().draw();
    }, []);

    const finalizeDrag = useCallback(
        (element) => {
            const elementBox = element.getAbsolutePosition();
            let closestTimeline = null;
            let minDistance = Infinity;

            const allTimelineElements = element.getStage().find((node) => node.attrs?.id?.includes('-events'));

            allTimelineElements.forEach((timelineElement) => {
                const timelineBox = timelineElement.parent.getAbsolutePosition();
                const distance = Math.abs(elementBox.y - timelineBox.y);

                if (distance < minDistance) {
                    minDistance = distance;
                    closestTimeline = timelineElement;
                }
            });

            insertElementIntoTimeline({ closestTimeline, element });
            updateStartTimeForElement({ element });

            element.clearCache();
            element.draw();
            element.getLayer().draw();
        },
        [insertElementIntoTimeline, updateStartTimeForElement]
    );

    const handleDragEnd = useCallback(
        (e) => {
            const stage = e.target.getStage();
            if (!stage) return;

            if (Object.keys(selectedItems).length > 0) {
                Object.values(selectedItems).forEach((item) => {
                    const targetElement = stage.findOne(`#${ELEMENT_ID_PREFIX}${item.id}`);
                    if (targetElement) {
                        finalizeDrag(targetElement);
                    }
                });
            } else {
                finalizeDrag(e.target);
            }

            highlightedTimelinesRef.current.forEach((timeline) => {
                removeHighlightFromTimeline(timeline);
            });

            highlightedTimelinesRef.current = new Set();
            previousXRef.current = null;
            setIsDragging({});
        },
        [finalizeDrag, selectedItems]
    );

    const isElementBeingDragged = useCallback(
        (id) => {
            return !!isDragging[id];
        },
        [isDragging]
    );

    const contextValue = useMemo(
        () => ({
            applyHighlightToTimeline,
            handleDragEnd,
            handleDragMove,
            handleDragStart,
            insertElementIntoTimeline,
            isDragging,
            isElementBeingDragged,
            removeHighlightFromTimeline,
            setIsDragging
        }),
        [handleDragEnd, handleDragMove, handleDragStart, insertElementIntoTimeline, isDragging, isElementBeingDragged]
    );

    return <SoundEventDragContext.Provider value={contextValue}>{children}</SoundEventDragContext.Provider>;
};

const useDrag = () => {
    return useContext(SoundEventDragContext);
};

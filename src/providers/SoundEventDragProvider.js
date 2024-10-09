import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import pixelToSecondRatio from '../globalConstants/pixelToSeconds';
import { CollisionsContext } from './CollisionsProvider/CollisionsProvider';
import { SelectionContext } from './SelectionsProvider';

export const SoundEventDragContext = createContext();

export const SoundEventDragProvider = ({ children }) => {
    const { clearSelection, isItemSelected, selectedItems } = useContext(SelectionContext);
    const { stageRef } = useContext(CollisionsContext);

    const [currentY, setCurrentY] = useState(0);
    const [isDragging, setIsDragging] = useState({});

    const previousXRef = useRef(null);
    const dragRequestRef = useRef(null);
    const highlightedTimelinesRef = useRef(new Set());

    const dragBoundFunc = useCallback((pos) => ({ x: pos.x, y: pos.y }), []);

    const updateElementPosition = useCallback((element, deltaX, deltaY) => {
        if (!element) return;
        const absPos = element.getAbsolutePosition();
        absPos.x += deltaX;
        absPos.y += deltaY;
        element.setAbsolutePosition(absPos);

        element.getLayer().batchDraw();
    }, []);

    const updateStartTimeForElement = useCallback(({ element }) => {
        if (!element) return;
        const recording = element.attrs['data-recording'];
        if (!recording) return;

        const newStartTime = element.x() / pixelToSecondRatio;
        console.log(`Updating start time for element: ${element.attrs.id}, new start time: ${newStartTime}`);

        element.getLayer().batchDraw();
    }, []);

    const handleDragStart = useCallback(
        (el) => {
            el.target.moveToTop();
            const recordingId = el.target.attrs['data-recording']?.id;
            if (recordingId && !isItemSelected(recordingId)) {
                clearSelection();
            }
            previousXRef.current = el.target.x();
            setCurrentY(el.evt.y);

            const processId = (id) => {
                return id.startsWith('element-') ? id.split('element-')[1] : id;
            };

            const newDragging = { [processId(el.target.attrs.id)]: true };

            if (Object.keys(selectedItems).length > 0) {
                Object.values(selectedItems).forEach(({ id }) => {
                    newDragging[processId(id)] = true;
                });
            }

            setIsDragging((prevDragging) => ({ ...prevDragging, ...newDragging }));
            console.log('Drag started for element:', el.target.attrs.id);
        },
        [clearSelection, isItemSelected, selectedItems]
    );

    const applyHighlightToTimeline = (timeline) => {
        if (timeline) {
            console.log('Highlighting timeline:', timeline.attrs.id);
            timeline.fill('yellow');
            timeline.getLayer().batchDraw(); // Redraw the timeline layer after highlighting
        }
    };

    const removeHighlightFromTimeline = (timeline) => {
        if (timeline) {
            console.log('Removing highlight from timeline:', timeline.attrs.id);
            timeline.fill('white');
            timeline.getLayer().batchDraw(); // Redraw the timeline layer after removing highlight
        }
    };

    const handleDragMove = useCallback(
        (e) => {
            const stage = stageRef.current;
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

                    const allTimelineElements = stage.find((node) => node.attrs?.id?.includes('Timeline-'));

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
                    // Update position
                    updateElementPosition(element, deltaX, deltaY);

                    // Find closest timeline
                    const closestTimeline = findClosestTimeline(element);

                    if (closestTimeline) {
                        newHighlightedTimelines.add(closestTimeline);
                    }
                };

                if (Object.keys(selectedItems).length > 0) {
                    Object.values(selectedItems).forEach(({ id }) => {
                        const targetElement = stage.findOne(`#element-${id}`);
                        if (targetElement) {
                            processElement(targetElement);
                        }
                    });
                } else {
                    processElement(e.target);
                }

                const timelinesToHighlight = [...newHighlightedTimelines].filter(
                    (timeline) => !highlightedTimelinesRef.current.has(timeline)
                );
                const timelinesToUnhighlight = [...highlightedTimelinesRef.current].filter(
                    (timeline) => !newHighlightedTimelines.has(timeline)
                );

                timelinesToHighlight.forEach((timeline) => {
                    applyHighlightToTimeline(timeline);
                });

                timelinesToUnhighlight.forEach((timeline) => {
                    removeHighlightFromTimeline(timeline);
                });

                highlightedTimelinesRef.current = newHighlightedTimelines;
            });
        },
        [currentY, selectedItems, stageRef, updateElementPosition]
    );

    const insertElementIntoTimeline = useCallback(
        ({ closestTimeline, element }) => {
            const timeline = stageRef.current.findOne((node) => node.attrs?.id?.includes('-events'));
            if (!timeline) return;

            element.moveTo(closestTimeline);

            // Redraw the timeline layer after inserting the element
            closestTimeline.getLayer().batchDraw();
        },
        [stageRef]
    );

    const handleDragEnd = useCallback(
        (e) => {
            const stage = stageRef.current;
            if (!stage) return;

            if (dragRequestRef.current) {
                cancelAnimationFrame(dragRequestRef.current);
            }

            const finalizeDrag = (element) => {
                const elementBox = element.getAbsolutePosition();
                let closestTimeline = null;
                let minDistance = Infinity;

                const allTimelineElements = stage.find((node) => node.attrs?.id?.includes('-events'));

                allTimelineElements.forEach((timelineElement) => {
                    const timelineBox = timelineElement.parent.getAbsolutePosition();
                    const distance = Math.abs(elementBox.y - timelineBox.y);

                    console.log('   ');
                    console.log('elementBox.y');
                    console.log(elementBox.y);
                    console.log('timelineBox.y');
                    console.log(timelineBox.y);

                    if (distance < minDistance) {
                        minDistance = distance;
                        closestTimeline = timelineElement;
                    }
                });

                console.log('ClosestTimeline');
                console.log(closestTimeline.attrs.id);

                if (closestTimeline) {
                    insertElementIntoTimeline({ closestTimeline, element });
                }
            };

            if (Object.keys(selectedItems).length > 0) {
                Object.values(selectedItems).forEach((item) => {
                    const targetElement = stage.findOne(`#element-${item.id}`);
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
        [insertElementIntoTimeline, selectedItems, stageRef]
    );

    const isElementBeingDragged = useCallback(
        (id) => {
            return !!isDragging[id];
        },
        [isDragging]
    );

    const contextValue = useMemo(
        () => ({
            dragBoundFunc,
            handleDragEnd,
            handleDragMove,
            handleDragStart,
            isElementBeingDragged
        }),
        [dragBoundFunc, handleDragEnd, handleDragMove, handleDragStart, isElementBeingDragged]
    );

    return <SoundEventDragContext.Provider value={contextValue}>{children}</SoundEventDragContext.Provider>;
};

const useDrag = () => {
    return useContext(SoundEventDragContext);
};

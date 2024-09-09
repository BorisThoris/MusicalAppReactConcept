import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import pixelToSecondRatio from '../globalConstants/pixelToSeconds';
import { getNearestInstrument } from '../globalHelpers/getNearestInstrument';
import { useInstrumentRecordingsOperations } from '../hooks/useInstrumentRecordingsOperations';
import { CollisionsContext } from './CollisionsProvider/CollisionsProvider';
import { SelectionContext } from './SelectionsProvider';

export const SoundEventDragContext = createContext();

export const SoundEventDragProvider = ({ children }) => {
    const { clearSelection, isItemSelected, selectedItems } = useContext(SelectionContext);
    const { stageRef, timelineRefs } = useContext(CollisionsContext);
    const { updateRecording: updateStartTime } = useInstrumentRecordingsOperations();

    const [currentY, setCurrentY] = useState(0);
    const [isDragging, setIsDragging] = useState({});

    const [timelineElementMap, setTimelineElementMap] = useState(new Map());
    const [originalColors, setOriginalColors] = useState(new Map());
    const [closestTimelines, setClosestTimelines] = useState(new Map());

    const previousXRef = useRef(null);
    const dragRequestRef = useRef(null);

    const dragBoundFunc = useCallback((pos) => ({ x: pos.x, y: pos.y }), []);

    const updateElementPosition = useCallback((element, deltaX, deltaY) => {
        if (!element) return;
        const absPos = element.getAbsolutePosition();
        absPos.x += deltaX;
        absPos.y += deltaY;
        element.setAbsolutePosition(absPos);
    }, []);

    const updateStartTimeForElement = useCallback(
        ({ element }) => {
            if (!element) return;
            const recording = element.attrs['data-recording'];
            if (!recording) return; // Ensure recording data exists

            const newStartTime = element.x() / pixelToSecondRatio;
            const closestTimeline = closestTimelines.get(element.attrs.id);
            updateStartTime({ newStartTime, recording }, closestTimeline);
        },
        [updateStartTime, closestTimelines]
    );

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
        },
        [clearSelection, isItemSelected, selectedItems]
    );

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

                const applyColoring = (element) => {
                    const closestTimeline = getNearestInstrument({
                        deltaY,
                        groupNode: element,
                        timelineRefs
                    });

                    closestTimelines.set(element.attrs.id, closestTimeline);

                    const timelineRef = timelineRefs[closestTimeline];
                    if (!timelineRef) return;

                    const closestTimelineEl = timelineRef.parent.findOne((node) =>
                        node.attrs?.id?.includes('Timeline-')
                    );

                    if (closestTimelineEl) {
                        let elementsForTimeline = timelineElementMap.get(closestTimelineEl) || [];
                        elementsForTimeline = elementsForTimeline.filter((el) => el.attrs.id !== element.attrs.id);
                        elementsForTimeline.push(element);

                        timelineElementMap.set(closestTimelineEl, elementsForTimeline);

                        if (!originalColors.has(closestTimelineEl)) {
                            originalColors.set(closestTimelineEl, closestTimelineEl.fill());
                            closestTimelineEl.fill('yellow');
                            closestTimelineEl.draw();
                        }
                    }

                    timelineElementMap.forEach((elements, timelineEl) => {
                        if (timelineEl !== closestTimelineEl) {
                            const updatedElements = elements.filter((el) => el.attrs.id !== element.attrs.id);
                            if (updatedElements.length === 0) {
                                const originalColor = originalColors.get(timelineEl);
                                if (originalColor) {
                                    timelineEl.fill(originalColor);
                                    timelineEl.draw();
                                    originalColors.delete(timelineEl);
                                }
                                timelineElementMap.delete(timelineEl);
                            } else {
                                timelineElementMap.set(timelineEl, updatedElements);
                            }
                        }
                    });
                };

                if (Object.keys(selectedItems).length > 0) {
                    Object.values(selectedItems).forEach(({ id }) => {
                        const targetElement = stage.findOne(`#element-${id}`);
                        if (targetElement) {
                            applyColoring(targetElement);
                            updateElementPosition(targetElement, deltaX, deltaY);
                        }
                    });
                } else {
                    applyColoring(e.target);
                    updateElementPosition(e.target, deltaX, deltaY);
                }

                setTimelineElementMap(new Map(timelineElementMap));
                setClosestTimelines(new Map(closestTimelines));
            });
        },
        [
            currentY,
            selectedItems,
            stageRef,
            timelineRefs,
            updateElementPosition,
            timelineElementMap,
            originalColors,
            closestTimelines
        ]
    );

    const handleDragEnd = useCallback(
        (e) => {
            const stage = stageRef.current;
            if (!stage) return;

            if (dragRequestRef.current) {
                cancelAnimationFrame(dragRequestRef.current);
            }

            const finalizeDrag = (element) => {
                updateStartTimeForElement({
                    element
                });
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

            originalColors.forEach((originalColor, timelineEl) => {
                if (timelineEl) {
                    timelineEl.fill(originalColor);
                    timelineEl.draw();
                }
            });

            // Clear all Maps and refs
            previousXRef.current = null;
            setTimelineElementMap(new Map());
            setOriginalColors(new Map());
            setClosestTimelines(new Map());
            setIsDragging({});
        },
        [selectedItems, stageRef, updateStartTimeForElement, originalColors]
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

export const useDrag = () => {
    return useContext(SoundEventDragContext);
};

export default SoundEventDragProvider;

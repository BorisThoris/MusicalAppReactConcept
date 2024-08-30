import React, { useCallback, useContext, useRef, useState } from 'react';
import pixelToSecondRatio from '../globalConstants/pixelToSeconds';
import { getNearestInstrument } from '../globalHelpers/getNearestInstrument';
import { CollisionsContext } from '../providers/CollisionsProvider/CollisionsProvider';
import { SelectionContext } from '../providers/SelectionsProvider';

export const useCustomDrag = ({ isSelected, recording, updateStartTime }) => {
    const { clearSelection, selectedItems } = useContext(SelectionContext);
    const { stageRef, timelineRefs } = useContext(CollisionsContext);

    const [startY, setStartY] = useState(0); // Correct useState hook
    const [currentY, setCurrentY] = useState(0);

    const previousXRef = useRef(null);

    const dragBoundFunc = useCallback(
        (pos) => ({
            x: pos.x,
            y: pos.y
        }),
        []
    );

    const updateElementPosition = useCallback((element, deltaX, deltaY) => {
        if (!element) return;
        const absPos = element.getAbsolutePosition();

        absPos.x += deltaX;
        absPos.y += deltaY;

        element.setAbsolutePosition(absPos);
    }, []);

    const updateStartTimeForElement = useCallback(
        ({ deltaY, element, itemRecording = recording }) => {
            if (!element) return;
            const newStartTime = element.x() / pixelToSecondRatio;

            // Use deltaY to determine the closest timeline
            const closestTimeline = getNearestInstrument({ deltaY, groupNode: element, timelineRefs });

            updateStartTime({ newStartTime, recording: itemRecording }, closestTimeline);
        },
        [timelineRefs, updateStartTime, recording]
    );

    const handleDragStart = useCallback(
        (el) => {
            el.target.moveToTop();
            if (!isSelected) clearSelection();
            previousXRef.current = el.target.x();
            setStartY(el.evt.y);
            setCurrentY(el.evt.y);
        },
        [clearSelection, isSelected]
    );

    const handleDragMove = useCallback(
        (e) => {
            const stage = stageRef.current;
            const currentX = e.target.x();
            const cur = e.evt.y;

            // Calculate the delta movement based on the event's target
            const deltaX = previousXRef.current !== null ? currentX - previousXRef.current : 0;
            const deltaY = cur - currentY;

            // Update the previous position reference
            previousXRef.current = currentX;
            setCurrentY(cur);

            const hasSelectedItems = Object.keys(selectedItems).length > 0;

            if (hasSelectedItems) {
                Object.values(selectedItems).forEach(({ id }) => {
                    const targetId = e.target.attrs['data-recording'].id;
                    if (targetId !== id) {
                        const targetElement = stage.findOne(`#element-${id}`);
                        updateElementPosition(targetElement, deltaX, deltaY);
                        const closestTimeline = getNearestInstrument({
                            deltaY,
                            groupNode: targetElement,
                            timelineRefs
                        });

                        console.log(timelineRefs);
                        console.log(closestTimeline);
                    }
                });
            }
        },
        [currentY, selectedItems, stageRef, timelineRefs, updateElementPosition]
    );

    const handleDragEnd = useCallback(
        (e) => {
            const stage = stageRef.current;
            const hasSelectedItems = Object.keys(selectedItems).length > 0;

            const endY = e.evt.y;
            const deltaY = endY - startY;

            if (hasSelectedItems) {
                Object.values(selectedItems).forEach((item) => {
                    const targetElement = stage.findOne(`#element-${item.id}`);

                    updateStartTimeForElement({
                        deltaY,
                        element: targetElement,
                        itemRecording: item?.element?.attrs['data-recording']
                    });
                });
            } else {
                updateStartTimeForElement({
                    deltaY,
                    element: e.target
                });
            }

            previousXRef.current = null;
        },
        [selectedItems, stageRef, startY, updateStartTimeForElement]
    );

    return { dragBoundFunc, handleDragEnd, handleDragMove, handleDragStart };
};

export default useCustomDrag;

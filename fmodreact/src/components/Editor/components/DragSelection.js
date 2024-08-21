import Konva from 'konva';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { Layer, Rect } from 'react-konva';
import { CollisionsContext } from '../../../providers/CollisionsProvider/CollisionsProvider';
import { SelectionContext } from '../../../providers/SelectionsProvider';
import { TimelineContext } from '../../../providers/TimelineProvider';

export const DragSelection = ({ stageRef }) => {
    const [dragPos, setDragPos] = useState({ end: null, start: null });
    const [isDragging, setIsDragging] = useState(false);

    const { setSelectionBasedOnCoordinates } = useContext(SelectionContext);
    const { getProcessedElements, timelineRefs } = useContext(CollisionsContext);

    const hasMoved = useCallback(() => {
        if (!dragPos.start || !dragPos.end) return false;
        return dragPos.start.x !== dragPos.end.x || dragPos.start.y !== dragPos.end.y;
    }, [dragPos.start, dragPos.end]);

    const updateSelection = useCallback(
        ({ end, start }) => {
            if (!start || !end) return;

            const selectionRect = {
                height: Math.abs(start.y - end.y),
                width: Math.abs(start.x - end.x),
                x: Math.min(start.x, end.x),
                y: Math.min(start.y, end.y)
            };

            const intersectedElements = [];

            const processedElements = getProcessedElements(timelineRefs);
            processedElements.forEach((elementData) => {
                const { element, height, timelineY, width, x, y } = elementData;
                const elementRect = { height, width, x, y };

                if (Konva.Util.haveIntersection(selectionRect, elementRect)) {
                    intersectedElements.push({
                        ...elementData.recording,
                        endX: x + width,
                        endY: y + height,
                        startX: x,
                        startY: y,
                        timelineY
                    });
                }
            });

            if (intersectedElements.length > 0) {
                const maxYLevel = Math.max(...intersectedElements.map((e) => e.timelineY));
                setSelectionBasedOnCoordinates({ intersectedElements, yLevel: maxYLevel });
            }
        },
        [getProcessedElements, timelineRefs, setSelectionBasedOnCoordinates]
    );

    const handleDrag = useCallback(
        (event, isStart) => {
            const { x, y } = event.target.getStage().getPointerPosition();
            setDragPos((prevPos) => {
                const newPos = isStart ? { end: prevPos.end, start: { x, y } } : { ...prevPos, end: { x, y } };
                if (!isStart && newPos.start) updateSelection(newPos);
                return newPos;
            });
            if (isStart) setIsDragging(true);
        },
        [updateSelection]
    );
    useEffect(() => {
        if (!stageRef.current) return;

        const stage = stageRef.current;

        // Handlers
        const mouseDownHandler = (e) => {
            if (e.target?.attrs?.id?.includes('Timeline')) {
                handleDrag(e, true);
            }
        };

        const mouseMoveHandler = (e) => {
            if (isDragging) {
                handleDrag(e, false);
            }
        };

        const mouseUpHandler = () => {
            if (hasMoved()) {
                updateSelection(dragPos);
            }
            setIsDragging(false);
            setDragPos({ end: null, start: null });
        };

        // Add event listeners
        stage.on('mousedown touchstart', mouseDownHandler);
        stage.on('mousemove touchmove', mouseMoveHandler);
        stage.on('mouseup touchend', mouseUpHandler);

        // Cleanup function to remove event listeners
        return () => {
            stage.off('mousedown touchstart', mouseDownHandler);
            stage.off('mousemove touchmove', mouseMoveHandler);
            stage.off('mouseup touchend', mouseUpHandler);
        };
    }, [handleDrag, hasMoved, dragPos, isDragging, updateSelection, stageRef]);

    const rectProps =
        isDragging && hasMoved()
            ? {
                  fill: 'rgba(0,0,255,0.5)',
                  height: Math.abs(dragPos.end.y - dragPos.start.y),
                  stroke: 'blue',
                  strokeWidth: 1,
                  width: Math.abs(dragPos.end.x - dragPos.start.x),
                  x: Math.min(dragPos.start.x, dragPos.end.x),
                  y: Math.min(dragPos.start.y, dragPos.end.y)
              }
            : null;

    return (
        rectProps && (
            <Layer>
                <Rect {...rectProps} />
            </Layer>
        )
    );
};

export default DragSelection;

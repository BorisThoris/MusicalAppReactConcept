import React, { useCallback, useContext, useEffect, useState } from 'react';
import { Layer, Rect } from 'react-konva';
import pixelToSecondRatio from '../../../globalConstants/pixelToSeconds';
import { SelectionContext } from '../../../providers/SelectionsProvider';
import { TimelineContext } from '../../../providers/TimelineProvider';

export const DragSelection = ({ stageRef }) => {
    const [dragPos, setDragPos] = useState({ end: null, start: null });
    const [isDragging, setIsDragging] = useState(false);
    const { timelineState } = useContext(TimelineContext);
    const { setSelectionBasedOnCoordinates } = useContext(SelectionContext);

    const hasMoved = useCallback(() => {
        if (!dragPos.start || !dragPos.end) return false;
        return dragPos.start.x !== dragPos.end.x || dragPos.start.y !== dragPos.end.y;
    }, [dragPos.start, dragPos.end]);

    const updateSelection = useCallback(
        ({ end, start }) => {
            if (!start || !end) return;

            const adjustedStartX =
                (Math.min(start.x, end.x) + timelineState.panelCompensationOffset.x) / pixelToSecondRatio;
            const adjustedEndX =
                (Math.max(start.x, end.x) + timelineState.panelCompensationOffset.x) / pixelToSecondRatio;

            setSelectionBasedOnCoordinates({
                endX: adjustedEndX,
                endY: Math.max(start.y, end.y),
                startX: adjustedStartX,
                startY: Math.min(start.y, end.y)
            });
        },
        [setSelectionBasedOnCoordinates, timelineState.panelCompensationOffset.x]
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

        const mouseDownHandler = (e) => {
            if (e.target?.attrs?.id?.includes('Timeline')) {
                handleDrag(e, true);
            }
        };
        const mouseMoveHandler = (e) => isDragging && handleDrag(e, false);
        const mouseUpHandler = () => {
            if (hasMoved()) {
                updateSelection(dragPos);
            }
            setIsDragging(false);
            setDragPos({ end: null, start: null });
        };

        stage.on('mousedown touchstart', mouseDownHandler);
        stage.on('mousemove touchmove', mouseMoveHandler);
        stage.on('mouseup touchend', mouseUpHandler);

        return () => {
            stage.off('mousedown touchstart', mouseDownHandler);
            stage.off('mousemove touchmove', mouseMoveHandler);
            stage.off('mouseup touchend', mouseUpHandler);
        };
    }, [handleDrag, isDragging, hasMoved, stageRef, dragPos, updateSelection]);

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

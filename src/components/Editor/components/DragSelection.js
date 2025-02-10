import Konva from 'konva';
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Layer, Rect } from 'react-konva';
import useContextMenu from '../../../hooks/useContextMenu';
import { CollisionsContext } from '../../../providers/CollisionsProvider/CollisionsProvider';
import { SelectionContext } from '../../../providers/SelectionsProvider';

export const DragSelection = ({ stageRef }) => {
    const [dragPos, setDragPos] = useState({ end: null, start: null });
    const [isDragging, setIsDragging] = useState(false);

    const selectionRectRef = useRef();

    const { setSelectionBasedOnCoordinates } = useContext(SelectionContext);
    const { getProcessedItems } = useContext(CollisionsContext);

    const { handleCloseMenu } = useContextMenu();
    const processedElements = getProcessedItems();

    const hasMoved = useCallback(() => {
        if (!dragPos.start || !dragPos.end) {
            return false;
        }

        return dragPos.start.x !== dragPos.end.x || dragPos.start.y !== dragPos.end.y;
    }, [dragPos.start, dragPos.end]);

    const updateSelectionRect = useCallback(() => {
        const node = selectionRectRef.current;
        if (node && dragPos.start && dragPos.end) {
            node.setAttrs({
                fill: 'rgba(0,0,255,0.5)',
                height: Math.abs(dragPos.start.y - dragPos.end.y),
                visible: isDragging,
                width: Math.abs(dragPos.start.x - dragPos.end.x),
                x: Math.min(dragPos.start.x, dragPos.end.x),
                y: Math.min(dragPos.start.y, dragPos.end.y)
            });
            node.getLayer().batchDraw();
        }
    }, [dragPos.end, dragPos.start, isDragging]);

    const updateSelection = useCallback(
        ({ end, start }) => {
            if (!start || !end) return;

            const selectionRect = {
                height: Math.abs(start.y - end.y),
                width: Math.abs(start.x - end.x),
                x: Math.min(start.x, end.x),
                y: Math.min(start.y, end.y)
            };

            const intersectedElements = processedElements.flatMap((elementData) => {
                const { element, groupData, height, locked, recording, timelineY, type, width, x, y } = elementData;
                const elementRect = { height, width, x, y };

                if (type === 'group' && groupData) {
                    const groupElements = Object.values(groupData.elements);

                    if (locked) {
                        return groupElements.map((groupElement) => ({
                            ...groupElement,
                            element,
                            endX: groupElement.rect.x + groupElement.rect.width,
                            endY: groupElement.rect.y + groupElement.rect.height,
                            startX: groupElement.rect.x,
                            startY: groupElement.rect.y,
                            timelineY
                        }));
                    }

                    // Otherwise, only add intersecting elements
                    return groupElements
                        .filter((groupElement) =>
                            Konva.Util.haveIntersection(selectionRect, {
                                height: groupElement.rect.height,
                                width: groupElement.rect.width,
                                x: groupElement.rect.x,
                                y: groupElement.rect.y
                            })
                        )
                        .map((groupElement) => ({
                            ...groupElement,
                            element,
                            endX: groupElement.rect.x + groupElement.rect.width,
                            endY: groupElement.rect.y + groupElement.rect.height,
                            startX: groupElement.rect.x,
                            startY: groupElement.rect.y,
                            timelineY
                        }));
                }

                // Handle regular elements
                if (Konva.Util.haveIntersection(selectionRect, elementRect)) {
                    return [
                        {
                            ...recording,
                            element,
                            endX: x + width,
                            endY: y + height,
                            startX: x,
                            startY: y,
                            timelineY
                        }
                    ];
                }

                return [];
            });

            if (intersectedElements.length > 0) {
                const maxYLevel = Math.max(...intersectedElements.map((e) => e.timelineY));
                setSelectionBasedOnCoordinates({ intersectedElements, yLevel: maxYLevel });
            }
        },
        [processedElements, setSelectionBasedOnCoordinates]
    );

    const handleDrag = useCallback(
        (event, isStart) => {
            const pointerPosition = event.target.getStage().getPointerPosition();
            if (!pointerPosition) return;

            const { x, y } = pointerPosition;
            setDragPos((prevPos) => {
                const newPos = isStart ? { end: prevPos.end, start: { x, y } } : { ...prevPos, end: { x, y } };

                if (!isStart && newPos.start) updateSelection(newPos);
                return newPos;
            });
            if (isStart) setIsDragging(true);
            if (!isStart) updateSelectionRect(); // Update selection rect during drag
        },
        [updateSelection, updateSelectionRect]
    );

    useEffect(() => {
        if (!stageRef.current) return;

        const stage = stageRef.current;

        // Handlers
        const mouseDownHandler = (e) => {
            if (e.target?.attrs?.id?.includes('timelineRect')) {
                handleDrag(e, true);
                handleCloseMenu(e);
            }
        };

        const mouseMoveHandler = (e) => {
            if (isDragging) {
                handleDrag(e, false);
            }
        };

        const mouseUpHandler = () => {
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
    }, [handleDrag, hasMoved, dragPos, isDragging, updateSelection, stageRef, handleCloseMenu]);

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
                <Rect {...rectProps} ref={selectionRectRef} />
            </Layer>
        )
    );
};

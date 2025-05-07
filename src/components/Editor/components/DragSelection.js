import Konva from 'konva';
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Layer, Rect } from 'react-konva';
import useContextMenu from '../../../hooks/useContextMenu';
import { CollisionsContext } from '../../../providers/CollisionsProvider/CollisionsProvider';
import { SelectionContext } from '../../../providers/SelectionsProvider';

export const DragSelection = () => {
    const [dragPos, setDragPos] = useState({ end: null, start: null });
    const [isDragging, setIsDragging] = useState(false);

    const selectionRectRef = useRef();

    const { handleCloseSelectionsPanel, setSelectionBasedOnCoordinates } = useContext(SelectionContext);
    const { processedItems, stageRef } = useContext(CollisionsContext);

    const { handleCloseMenu } = useContextMenu();

    const hasMoved = useCallback(() => {
        if (!dragPos.start || !dragPos.end) return false;
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
    }, [dragPos, isDragging]);

    const updateSelection = useCallback(
        ({ end, start }) => {
            if (!start || !end) return;

            const selectionRect = {
                height: Math.abs(start.y - end.y),
                width: Math.abs(start.x - end.x),
                x: Math.min(start.x, end.x),
                y: Math.min(start.y, end.y)
            };

            const intersectedElements = processedItems.flatMap((item) => {
                const isGroup = !!item.group;
                const isElement = !!item.recording;

                if (isGroup) {
                    const groupRect = item.clientRect ?? item.group.rect;

                    if (item.group.locked) {
                        if (groupRect && Konva.Util.haveIntersection(selectionRect, groupRect)) {
                            const { rect } = item.group;
                            return [
                                {
                                    ...item.group,
                                    element: item.element,
                                    endX: (rect?.x ?? item.x) + (rect?.width ?? item.width),
                                    endY: (rect?.y ?? item.y) + (rect?.height ?? item.height),
                                    startX: rect?.x ?? item.x,
                                    startY: rect?.y ?? item.y
                                }
                            ];
                        }
                        return [];
                    }

                    return (Object.values(item.group?.elements) || [])
                        .map((child) => {
                            const childRect = child.rect ?? {
                                height: child.height,
                                width: child.width,
                                x: child.x,
                                y: child.y
                            };
                            if (Konva.Util.haveIntersection(selectionRect, childRect)) {
                                return {
                                    ...child,
                                    element: item.element,
                                    endX: childRect.x + childRect.width,
                                    endY: childRect.y + childRect.height,
                                    startX: childRect.x,
                                    startY: childRect.y
                                };
                            }
                            return null;
                        })
                        .filter(Boolean);
                }

                if (isElement) {
                    const elementRect = item.clientRect ?? {
                        height: item.height,
                        width: item.width,
                        x: item.x,
                        y: item.y
                    };
                    if (elementRect && Konva.Util.haveIntersection(selectionRect, elementRect)) {
                        return [
                            {
                                ...item.recording,
                                element: item.element,
                                endX: item.x + item.width,
                                endY: item.y + item.height,
                                startX: item.x,
                                startY: item.y
                            }
                        ];
                    }
                }

                return [];
            });

            if (intersectedElements.length > 0) {
                const maxYLevel = Math.max(...intersectedElements.map((e) => e.timelineY ?? 0));
                setSelectionBasedOnCoordinates({
                    intersectedElements,
                    yLevel: maxYLevel
                });
            }
        },
        [processedItems, setSelectionBasedOnCoordinates]
    );

    const handleDrag = useCallback(
        (event, isStart) => {
            const pointer = event.target.getStage().getPointerPosition();
            if (!pointer) return;

            const { x, y } = pointer;
            setDragPos((prev) => {
                const newPos = isStart ? { end: prev.end, start: { x, y } } : { ...prev, end: { x, y } };

                if (!isStart && newPos.start) updateSelection(newPos);
                return newPos;
            });
            if (isStart) setIsDragging(true);
            if (!isStart) updateSelectionRect();
        },
        [updateSelection, updateSelectionRect]
    );

    useEffect(() => {
        if (!stageRef) return;

        const stage = stageRef;

        const mouseDownHandler = (e) => {
            if (e.target?.attrs?.id?.includes('timelineRect')) {
                handleDrag(e, true);
                handleCloseMenu(e);
                handleCloseSelectionsPanel();
            }
        };

        const mouseMoveHandler = (e) => {
            if (isDragging) handleDrag(e, false);
        };

        const mouseUpHandler = () => {
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
    }, [handleDrag, handleCloseMenu, handleCloseSelectionsPanel, isDragging, stageRef]);

    const rectProps =
        isDragging && hasMoved()
            ? {
                  fill: 'rgba(0,0,255,0.5)',
                  height: Math.abs(dragPos.start.y - dragPos.end.y),
                  stroke: 'blue',
                  strokeWidth: 1,
                  width: Math.abs(dragPos.start.x - dragPos.end.x),
                  x: Math.min(dragPos.start.x, dragPos.end.x),
                  y: Math.min(dragPos.start.y, dragPos.end.y)
              }
            : null;

    return rectProps ? (
        <Layer>
            <Rect {...rectProps} ref={selectionRectRef} />
        </Layer>
    ) : null;
};

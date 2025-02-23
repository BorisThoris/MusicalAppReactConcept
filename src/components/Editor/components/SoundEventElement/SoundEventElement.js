// @ts-nocheck
import isEqual from 'lodash/isEqual';
import PropTypes from 'prop-types';
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Circle, Group, Rect, Text } from 'react-konva';
import { ELEMENT_ID_PREFIX, GROUP_ELEMENT_ID_PREFIX } from '../../../../globalConstants/elementIds';
import pixelToSecondRatio from '../../../../globalConstants/pixelToSeconds';
import { Portal } from '../../../../globalHelpers/Portal';
import { PanelContext } from '../../../../hooks/usePanelState';
import { CollisionsContext } from '../../../../providers/CollisionsProvider/CollisionsProvider';
import { SelectionContext } from '../../../../providers/SelectionsProvider';
import { TimelineContext } from '../../../../providers/TimelineProvider';
import { Lock } from '../Lock/Lock';
import { useDynamicStyles } from './hooks/useDynamicStyles';
import { useEventFocus } from './hooks/useEventFocus';
import { useClickHandlers } from './useEventClickHandlers';

// Constants
const CONSTANTS = {
    CORNER_RADIUS: 5,
    GRADIENT_END: { x: 100, y: 0 },
    GRADIENT_START: { x: 0, y: 0 },
    LOCK_OFFSET_Y: -10,
    SHADOW: { BLUR: 5, OFFSET: { x: 8, y: 5 }, OPACITY: 0.5 },
    STROKE_WIDTH: 2,
    TEXT_FONT_SIZE: 18,
    TEXT_STYLE: {
        fill: 'black',
        fontSize: 15,
        x: 5,
        y: 15
    },
    TRANSPARENCY_VALUE: 0.8
};

const COLORS = ['#FF5733', '#33FF57', '#3357FF', '#FF33A1', '#A1FF33'];

const areEqual = (prevProps, nextProps) => {
    const equal = isEqual(prevProps, nextProps);
    // if (!equal) {
    //     Object.keys(prevProps).forEach((key) => {
    //         if (!isEqual(prevProps[key], nextProps[key])) {
    //             console.log(`Prop '${key}' changed:`, {
    //                 next: nextProps[key],
    //                 prev: prevProps[key]
    //             });
    //         }
    //     });
    // }
    return equal;
};

const SoundEventElement = React.memo(
    ({
        childScale,
        dragBoundFunc,
        groupRef,
        handleDragEnd,
        handleDragMove,
        handleDragStart,
        index,
        isElementBeingDragged,
        listening,
        parentGroupId,
        recording,
        timelineHeight,
        timelineY
    }) => {
        const { eventLength, id, locked, name, startTime } = recording;

        // Refs for the element container and for storing positions.
        const elementContainerRef = useRef();
        const elementRef = useRef();
        // Using refs to avoid re-renders on every drag update.
        const elementXRef = useRef(startTime * pixelToSecondRatio);
        const elementYRef = useRef(timelineY); // This ref will update during dragging but not affect rendering.

        // Determine if this element is currently being dragged.
        const isDragging = isElementBeingDragged(id);
        const [originalZIndex, setOriginalZIndex] = useState(null);

        // Contexts
        const { isItemSelected } = useContext(SelectionContext);
        const { focusedEvent, setFocusedEvent } = useContext(PanelContext);
        const { timelineState } = useContext(TimelineContext);
        const { getGroupById } = useContext(CollisionsContext);

        // Derived values
        const isSelected = isItemSelected(id);
        const parent = getGroupById(parentGroupId);

        // Hooks for focus and click handling
        const { handleMouseEnter, isFocused, restoreZIndex } = useEventFocus(focusedEvent, setFocusedEvent, id);
        const { handleClick, handleDoubleClick } = useClickHandlers({ parent, recording });
        const { dynamicColorStops, dynamicShadowBlur, dynamicStroke } = useDynamicStyles(
            isFocused,
            isSelected,
            false,
            COLORS[index % COLORS.length]
        );

        const onLockSoundEventElement = useCallback(() => {
            const prevData = elementContainerRef.current.attrs['data-recording'];
            const updatedState = { ...prevData, locked: !prevData.locked };

            elementContainerRef.current.setAttrs({
                'data-recording': updatedState
            });

            elementContainerRef.current.getLayer().draw();
        }, []);

        const handleDelete = useCallback(() => {
            if (elementContainerRef.current) {
                elementContainerRef.current.destroy();
            }
        }, []);

        // Update X ref and Konva node when startTime changes.
        useEffect(() => {
            if (elementContainerRef.current) {
                const newX = startTime * pixelToSecondRatio;
                elementContainerRef.current.x(newX);
                elementXRef.current = newX;
            }
        }, [startTime]);

        // Update the local Y ref when timelineY changes.
        useEffect(() => {
            if (elementContainerRef.current) {
                elementYRef.current = timelineY;
                // Only update the Konva node's Y if dragging.
                if (isDragging) {
                    elementContainerRef.current.y(timelineY);
                }
            }
        }, [timelineY, isDragging]);

        useEffect(() => {
            if (elementContainerRef.current && !isFocused) {
                const currentZIndex = elementContainerRef.current.zIndex();

                if (originalZIndex === null) {
                    setOriginalZIndex(currentZIndex);
                } else if (originalZIndex !== currentZIndex) {
                    elementContainerRef.current.zIndex(originalZIndex);
                }
            }
        }, [isFocused, originalZIndex]);

        useEffect(() => {
            if (isFocused && elementContainerRef.current) {
                elementContainerRef.current.moveToTop();
            }
        }, [isFocused]);

        const dynamicStyle = useMemo(() => {
            if (!groupRef) {
                return { stroke: 'black', strokeWidth: 2 };
            }
            const calculatedHeight = timelineHeight * childScale;
            return {
                height: calculatedHeight,
                stroke: 'blue',
                strokeWidth: 4
            };
        }, [childScale, groupRef, timelineHeight]);

        const lengthBasedWidth = eventLength * pixelToSecondRatio;

        const handleContextClick = useCallback((e) => {
            e.evt.preventDefault();
        }, []);

        const handleMouseEnterWithCursor = useCallback(
            (e) => {
                handleMouseEnter(e);
                const container = e.target.getStage().container();
                container.style.cursor = 'pointer';
            },
            [handleMouseEnter]
        );

        const handleMouseLeaveWithCursor = useCallback(
            (e) => {
                restoreZIndex(e);
                const container = e.target.getStage().container();
                container.style.cursor = 'default';
            },
            [restoreZIndex]
        );

        const handleDragStartWithCursor = useCallback(
            (e) => {
                const container = e.target.getStage().container();
                container.style.cursor = 'grabbing';
                handleDragStart(e);
            },
            [handleDragStart]
        );

        // On drag move, update the X ref (and Y ref if needed) but let the Y offset remain controlled by timelineY.
        const handleDragMoveWithCursor = useCallback(
            (e) => {
                elementXRef.current = e.target.x();
                // Update Y ref in case you need it later (but we don't use it for rendering)
                elementYRef.current = e.target.y();
                handleDragMove(e);
            },
            [handleDragMove]
        );

        // On drag end, update the X ref only—maintaining the old offset logic for Y.
        const handleDragEndWithCursor = useCallback(
            (e) => {
                const container = e.target.getStage().container();
                container.style.cursor = 'grab';
                elementXRef.current = e.target.x();
                // Do not update the rendered Y value; it remains controlled by timelineY when dragging.
                handleDragEnd(e);
            },
            [handleDragEnd]
        );

        // When not dragging, we want to maintain the old Y offset (0) and let Konva manage X.
        // When dragging, the Y is set to timelineY.
        const controlledPositionProps = !isDragging ? { x: elementXRef.current, y: 0 } : {};

        const isNotInGroup = !groupRef;
        const portalRef = useRef(null);

        return (
            <Portal selector=".top-layer" enabled={isDragging} outerRef={portalRef}>
                <Group
                    onContextMenu={handleContextClick}
                    ref={elementContainerRef}
                    key={index}
                    // Use the old offsetting for Y: if dragging, use timelineY; otherwise 0.
                    x={elementXRef.current}
                    y={isDragging ? timelineY : 0}
                    offset={isDragging ? timelineState.panelCompensationOffset : undefined}
                    data-recording={recording}
                    data-timeline-y={timelineY}
                    data-group-child={groupRef}
                    draggable={!parent?.locked}
                    dragBoundFunc={dragBoundFunc}
                    onDragStart={handleDragStartWithCursor}
                    onDragMove={handleDragMoveWithCursor}
                    onDragEnd={handleDragEndWithCursor}
                    onClick={handleClick}
                    onDblClick={handleDoubleClick}
                    listening={listening}
                    id={`${ELEMENT_ID_PREFIX}${id}`}
                    data-portal-parent={portalRef?.current}
                    data-parent-group-id={parentGroupId}
                    {...controlledPositionProps}
                >
                    <Rect
                        onMouseEnter={handleMouseEnterWithCursor}
                        onMouseLeave={handleMouseLeaveWithCursor}
                        ref={elementRef}
                        x={0}
                        y={0}
                        width={lengthBasedWidth}
                        height={timelineHeight}
                        fillLinearGradientStartPoint={CONSTANTS.GRADIENT_START}
                        fillLinearGradientEndPoint={CONSTANTS.GRADIENT_END}
                        fillLinearGradientColorStops={dynamicColorStops}
                        fill={dynamicStroke}
                        stroke="black"
                        strokeWidth={CONSTANTS.STROKE_WIDTH}
                        cornerRadius={CONSTANTS.CORNER_RADIUS}
                        shadowOffset={CONSTANTS.SHADOW.OFFSET}
                        shadowBlur={dynamicShadowBlur}
                        shadowOpacity={CONSTANTS.SHADOW.OPACITY}
                        opacity={CONSTANTS.TRANSPARENCY_VALUE}
                        {...dynamicStyle}
                    />
                    <Text x={5} y={5} text={name} fill="black" fontSize={15} listening={false} />
                    <Text x={5} y={25} text={`${id}`} fill="black" fontSize={15} listening={false} />
                    {isNotInGroup && <Lock isLocked={locked} onClick={onLockSoundEventElement} />}
                    <Circle x={lengthBasedWidth - 10} y={10} radius={8} fill="red" onClick={handleDelete} listening />
                    {parentGroupId && (
                        <Text
                            x={5}
                            y={45 + index * 20}
                            text={`Parent Group ID ${parentGroupId}`}
                            fill="black"
                            fontSize={15}
                            listening={false}
                        />
                    )}
                </Group>
            </Portal>
        );
    },
    (prevProps, nextProps) => areEqual(prevProps, nextProps)
);

SoundEventElement.propTypes = {
    canvasOffsetY: PropTypes.number.isRequired,
    groupRef: PropTypes.bool,
    index: PropTypes.number.isRequired,
    isFocused: PropTypes.bool,
    isTargeted: PropTypes.bool,
    parent: PropTypes.object,
    recording: PropTypes.shape({
        eventInstance: PropTypes.object.isRequired,
        eventLength: PropTypes.number.isRequired,
        id: PropTypes.number.isRequired,
        instrumentName: PropTypes.string.isRequired,
        locked: PropTypes.bool,
        name: PropTypes.string.isRequired,
        startTime: PropTypes.number.isRequired
    }).isRequired,
    setFocusedEvent: PropTypes.func.isRequired,
    timelineHeight: PropTypes.number.isRequired,
    timelineY: PropTypes.number.isRequired,
    updateStartTime: PropTypes.func.isRequired
};

SoundEventElement.defaultProps = {
    groupRef: false,
    isFocused: false,
    isTargeted: false
};

export default SoundEventElement;

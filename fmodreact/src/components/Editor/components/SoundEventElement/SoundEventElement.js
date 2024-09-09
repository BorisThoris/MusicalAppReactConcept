import isEqual from 'lodash/isEqual';
import PropTypes from 'prop-types';
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Circle, Group, Rect, Text } from 'react-konva';
import pixelToSecondRatio from '../../../../globalConstants/pixelToSeconds';
import { Portal } from '../../../../globalHelpers/Portal';
import { useDynamicStyles } from '../../../../hooks/useDynamicStyles';
import { useEventFocus } from '../../../../hooks/useEventFocus';
import { useInstrumentRecordingsOperations } from '../../../../hooks/useInstrumentRecordingsOperations';
import { PanelContext } from '../../../../hooks/usePanelState';
import { CollisionsContext } from '../../../../providers/CollisionsProvider/CollisionsProvider';
import { SelectionContext } from '../../../../providers/SelectionsProvider';
import { TimelineContext } from '../../../../providers/TimelineProvider';
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

// Component
const SoundEventElement = React.memo(
    ({
        dragBoundFunc,
        handleClickOverlapGroup,
        handleDragEnd,
        handleDragMove,
        handleDragStart,
        index,
        isElementBeingDragged,
        listening,
        recording,
        timelineHeight,
        timelineY
    }) => {
        const { eventLength, id, locked, name, parentId, startTime } = recording;

        // Refs and State
        const groupRef = useRef();
        const elementRef = useRef();
        const [elementXPosition, setElementXPosition] = useState(startTime * pixelToSecondRatio);
        const isDragging = isElementBeingDragged(id);

        const [originalZIndex, setOriginalZIndex] = useState(null);

        // Contexts
        const { isItemSelected } = useContext(SelectionContext);
        const { calculateCollisions } = useContext(CollisionsContext);
        const { focusedEvent, setFocusedEvent } = useContext(PanelContext);
        const { timelineState } = useContext(TimelineContext);
        const { getEventById, lockOverlapGroupById } = useInstrumentRecordingsOperations();

        // Derived values
        const isSelected = isItemSelected(id);
        const parent = getEventById(parentId);

        // Hooks
        const { handleMouseEnter, isFocused, restoreZIndex } = useEventFocus(focusedEvent, setFocusedEvent, id);
        const { handleClick, handleDoubleClick } = useClickHandlers({
            elementRef,
            handleClickOverlapGroup,
            parent,
            recording,
            timelineY
        });

        const { dynamicColorStops, dynamicShadowBlur, dynamicStroke } = useDynamicStyles(
            isFocused,
            isSelected,
            false,
            COLORS[index % COLORS.length]
        );

        const onLockSoundEventElement = useCallback(
            () => lockOverlapGroupById({ groupId: id }),
            [id, lockOverlapGroupById]
        );

        const handleDelete = useCallback(() => {
            if (groupRef.current) {
                groupRef.current.destroy();
                calculateCollisions();
            }
        }, [calculateCollisions]);

        useEffect(() => {
            setElementXPosition(startTime * pixelToSecondRatio);
        }, [startTime]);

        useEffect(() => {
            if (groupRef.current && !isFocused) {
                const currentZIndex = groupRef.current.zIndex();

                if (originalZIndex === null) {
                    setOriginalZIndex(currentZIndex);
                } else if (originalZIndex !== currentZIndex) {
                    groupRef.current.zIndex(originalZIndex);
                }
            }
        }, [isFocused, originalZIndex]);

        useEffect(() => {
            if (isFocused && groupRef.current) {
                groupRef.current.moveToTop();
            }
        }, [isFocused]);

        // Component Render
        const lengthBasedWidth = eventLength * pixelToSecondRatio;

        return (
            <Portal selector=".top-layer" enabled={isDragging}>
                <Group
                    ref={groupRef}
                    key={index}
                    y={isDragging ? timelineY : 0}
                    x={elementXPosition}
                    offset={isDragging ? timelineState.panelCompensationOffset : undefined}
                    data-recording={recording}
                    data-timeline-y={timelineY}
                    draggable={!parent?.locked}
                    dragBoundFunc={dragBoundFunc}
                    onDragMove={handleDragMove}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                    onClick={handleClick}
                    onDblClick={handleDoubleClick}
                    listening={listening}
                    id={`element-${id}`}
                >
                    <Rect
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={restoreZIndex}
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
                    />
                    <Text x={5} y={5} text={name} fill="black" fontSize={15} listening={false} />
                    {!parent && (
                        <Text
                            onClick={onLockSoundEventElement}
                            x={-10}
                            y={-10}
                            text={locked ? '🔒' : '✔️'}
                            fontSize={18}
                            fill="white"
                        />
                    )}
                    <Circle x={lengthBasedWidth - 10} y={10} radius={8} fill="red" onClick={handleDelete} listening />
                </Group>
            </Portal>
        );
    },
    (prevProps, nextProps) => isEqual(prevProps, nextProps)
);

// Prop Types and Default Props
SoundEventElement.propTypes = {
    canvasOffsetY: PropTypes.number.isRequired,
    index: PropTypes.number.isRequired,
    isFocused: PropTypes.bool,
    isOverlapping: PropTypes.bool,
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
    isFocused: false,
    isOverlapping: false,
    isTargeted: false
};

export default SoundEventElement;

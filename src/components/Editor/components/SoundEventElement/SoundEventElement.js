// @ts-nocheck
import isEqual from 'lodash/isEqual';
import PropTypes from 'prop-types';
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Circle, Group, Rect, Text } from 'react-konva';
import { ELEMENT_ID_PREFIX, GROUP_ELEMENT_ID_PREFIX } from '../../../../globalConstants/elementIds';
import pixelToSecondRatio from '../../../../globalConstants/pixelToSeconds';
import { Portal } from '../../../../globalHelpers/Portal';
import { useInstrumentRecordingsOperations } from '../../../../hooks/useInstrumentRecordingsOperations';
import { PanelContext } from '../../../../hooks/usePanelState';
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

// Component
const SoundEventElement = React.memo(
    ({
        childScale,
        dragBoundFunc,
        groupRef,
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
        const elementContainerRef = useRef();
        const elementRef = useRef();
        const [elementXPosition, setElementXPosition] = useState(startTime * pixelToSecondRatio);
        const isDragging = isElementBeingDragged(id);

        const [originalZIndex, setOriginalZIndex] = useState(null);

        // Contexts
        const { isItemSelected } = useContext(SelectionContext);

        const { focusedEvent, setFocusedEvent } = useContext(PanelContext);
        const { timelineState } = useContext(TimelineContext);
        const { getEventById } = useInstrumentRecordingsOperations();

        // Derived values
        const isSelected = isItemSelected(id);
        const parent = getEventById(parentId);

        // Hooks
        const { handleMouseEnter, isFocused, restoreZIndex } = useEventFocus(focusedEvent, setFocusedEvent, id);
        const { handleClick, handleDoubleClick } = useClickHandlers({
            handleClickOverlapGroup,
            parent,
            recording
        });

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
        }, []);

        const handleDelete = useCallback(() => {
            if (elementContainerRef.current) {
                elementContainerRef.current.destroy();
            }
        }, []);

        useEffect(() => {
            setElementXPosition(startTime * pixelToSecondRatio);
        }, [startTime]);

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

        // Component Render
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

        const handleDragEndWithCursor = useCallback(
            (e) => {
                const container = e.target.getStage().container();
                container.style.cursor = 'grab';
                handleDragEnd(e);
            },
            [handleDragEnd]
        );

        const isFirstInGroup = index === 0;
        const isNotInGroup = !groupRef;

        // console.log('group parent', groupRef?.parentRef);

        return (
            <Portal selector=".top-layer" enabled={isDragging}>
                <Group
                    onContextMenu={handleContextClick}
                    ref={elementContainerRef}
                    key={index}
                    y={isDragging ? timelineY : 0}
                    x={elementXPosition}
                    offset={isDragging ? timelineState.panelCompensationOffset : undefined}
                    data-recording={recording}
                    data-timeline-y={timelineY}
                    data-group-child={groupRef}
                    draggable={!parent?.locked}
                    dragBoundFunc={dragBoundFunc}
                    onDragMove={handleDragMove}
                    onDragStart={handleDragStartWithCursor}
                    onDragEnd={handleDragEndWithCursor}
                    onClick={handleClick}
                    onDblClick={handleDoubleClick}
                    listening={listening}
                    id={`${ELEMENT_ID_PREFIX}${id}`}
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

                    {isNotInGroup && <Lock isLocked={locked} onClick={onLockSoundEventElement} />}

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

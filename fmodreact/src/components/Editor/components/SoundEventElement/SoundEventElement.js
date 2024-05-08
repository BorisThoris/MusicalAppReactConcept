import isEqual from 'lodash/isEqual';
import PropTypes from 'prop-types';
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Group, Rect, Text } from 'react-konva';
import pixelToSecondRatio from '../../../../globalConstants/pixelToSeconds';
import { useCustomDrag } from '../../../../hooks/useCustomDrag';
import { useDynamicStyles } from '../../../../hooks/useDynamicStyles';
import { useEventFocus } from '../../../../hooks/useEventFocus';
import { useInstrumentRecordingsOperations } from '../../../../hooks/useInstrumentRecordingsOperations';
import { PanelContext } from '../../../../hooks/usePanelState';
import { SelectionContext } from '../../../../providers/SelectionsProvider';
import useElementSelectionMovement from './useElementSelectionMovement';
import { useClickHandlers } from './useEventClickHandlers';

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

const SoundEventElement = React.memo(
    ({ handleClickOverlapGroup, index, listening, recording, timelineHeight, timelineY }) => {
        const { eventLength, id, locked, name, parentId, startTime } = recording;
        const [elementXPosition, setElementXPosition] = useState(startTime * pixelToSecondRatio);
        const { handleSelectionBoxClick, handleSelectionBoxDragEnd, handleSelectionBoxMove, isItemSelected } =
            useContext(SelectionContext);

        const isSelected = isItemSelected(id);

        useElementSelectionMovement({ elementXPosition, isSelected, recording, setElementXPosition });

        const groupRef = useRef();
        const elementRef = useRef();

        const { focusedEvent, setFocusedEvent } = useContext(PanelContext);

        const {
            getEventById,
            lockOverlapGroupById,
            updateRecording: updateStartTime
        } = useInstrumentRecordingsOperations();

        const { handleMouseEnter, isFocused, restoreZIndex } = useEventFocus(focusedEvent, setFocusedEvent, id);

        const { dynamicColorStops, dynamicShadowBlur, dynamicStroke } = useDynamicStyles(isFocused, isSelected, true);

        const parent = getEventById(parentId);
        const { handleClick, handleDoubleClick } = useClickHandlers({
            elementRef,
            handleClickOverlapGroup,
            parent,
            recording,
            timelineY
        });

        const { dragBoundFunc, handleDragEnd, handleDragStart } = useCustomDrag({
            isSelected,
            parent,
            recording,
            timelineY,
            updateStartTime
        });

        const onLockSoundEventElement = useCallback(
            () => lockOverlapGroupById({ groupId: id }),
            [id, lockOverlapGroupById]
        );

        useEffect(() => {
            setElementXPosition(startTime * pixelToSecondRatio);
        }, [startTime]);

        useEffect(() => {
            if (isFocused && groupRef.current) {
                groupRef.current.moveToTop();
            }
        }, [isFocused]);

        const lengthBasedWidth = eventLength * pixelToSecondRatio;

        return (
            <Group
                ref={groupRef}
                key={index}
                x={elementXPosition}
                draggable={!parent?.locked}
                dragBoundFunc={dragBoundFunc}
                onDragMove={handleSelectionBoxMove}
                onDragStart={!isSelected ? handleDragStart : handleSelectionBoxClick}
                onDragEnd={!isSelected ? handleDragEnd : handleSelectionBoxDragEnd}
                onClick={handleClick}
                onDblClick={handleDoubleClick}
                listening={listening}
            >
                <Rect
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={restoreZIndex}
                    ref={elementRef}
                    x={0}
                    y={isFocused ? -4 : 0}
                    width={lengthBasedWidth}
                    height={timelineHeight * 0.8}
                    fillLinearGradientStartPoint={CONSTANTS.GRADIENT_START}
                    fillLinearGradientEndPoint={CONSTANTS.GRADIENT_END}
                    fillLinearGradientColorStops={dynamicColorStops}
                    fill={dynamicStroke}
                    strokeWidth={CONSTANTS.STROKE_WIDTH}
                    cornerRadius={CONSTANTS.CORNER_RADIUS}
                    shadowOffset={CONSTANTS.SHADOW.OFFSET}
                    shadowBlur={dynamicShadowBlur}
                    shadowOpacity={CONSTANTS.SHADOW.OPACITY}
                    opacity={CONSTANTS.TRANSPARENCY_VALUE}
                />
                <Text {...CONSTANTS.TEXT_STYLE} text={name} opacity={CONSTANTS.TRANSPARENCY_VALUE} />

                {!parent && (
                    <Text
                        onClick={onLockSoundEventElement}
                        x={-10}
                        y={CONSTANTS.LOCK_OFFSET_Y}
                        text={locked ? '🔒' : '✔️'}
                        fontSize={CONSTANTS.TEXT_FONT_SIZE}
                        fill="white"
                    />
                )}
            </Group>
        );
    },
    isEqual
);

SoundEventElement.propTypes = {
    canvasOffsetY: PropTypes.number.isRequired,
    index: PropTypes.number.isRequired,
    isFocused: PropTypes.bool,
    isOverlapping: PropTypes.bool,
    isTargeted: PropTypes.bool,
    openParamsPanel: PropTypes.func,
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
    isTargeted: false,
    openParamsPanel: null
};

export default SoundEventElement;

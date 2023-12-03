import PropTypes from 'prop-types';
import React, { useCallback } from 'react';
import { Group, Rect, Text } from 'react-konva';
import { playEventInstance } from '../../../../fmodLogic/eventInstanceHelpers';
import pixelToSecondRatio from '../../../../globalConstants/pixelToSeconds';

const STROKE_WIDTH = 2;
const CORNER_RADIUS = 5;
const SHADOW_OFFSET_X = 8;
const SHADOW_OFFSET_Y = 5;
const SHADOW_BLUR = 5;
const SHADOW_OPACITY = 0.5;
const TRANSPARENCY_VALUE = 0.8;
const GRADIENT_START_POINT = { x: 0, y: 0 };
const GRADIENT_END_POINT = { x: 100, y: 0 };

const SoundEventElement = ({
    index,
    isOverlapping,
    isTargeted,
    openPanel,
    recording,
    timelineHeight,
    timelineY,
    updateStartTime,
}) => {
    const { eventInstance, eventLength, id, instrumentName, startTime } =
        recording;

    const startingPositionInTimeline = startTime * pixelToSecondRatio;

    const lengthBasedWidth = eventLength * pixelToSecondRatio;

    const handleDragEndCallback = useCallback(
        (e) => {
            const newStartTime = e.target.x() / pixelToSecondRatio;

            updateStartTime({
                eventLength,
                index: id,
                instrumentName,
                newStartTime,
            });
        },
        [eventLength, id, instrumentName, updateStartTime]
    );

    const handleClickCallback = useCallback(() => {
        if (openPanel) {
            openPanel({ index, instrumentName });
        }
    }, [index, instrumentName, openPanel]);

    const handleDoubleClickCallback = useCallback(() => {
        playEventInstance(eventInstance);
    }, [eventInstance]);

    const dragBoundFunc = useCallback(
        (pos) => ({ x: pos.x, y: timelineY }),
        [timelineY]
    );

    const dynamicColorStops = isOverlapping
        ? [0, 'red', 1, 'yellow']
        : [1, 'red'];

    return (
        <Group
            key={index}
            x={startingPositionInTimeline}
            draggable
            dragBoundFunc={dragBoundFunc}
            onDragEnd={handleDragEndCallback}
            onClick={handleClickCallback}
            onDblClick={handleDoubleClickCallback}
        >
            <Rect
                x={0}
                y={0}
                width={lengthBasedWidth}
                height={timelineHeight * 0.8}
                fillLinearGradientStartPoint={GRADIENT_START_POINT}
                fillLinearGradientEndPoint={GRADIENT_END_POINT}
                fillLinearGradientColorStops={dynamicColorStops}
                stroke={isTargeted ? 'blue' : 'red'}
                strokeWidth={STROKE_WIDTH}
                cornerRadius={CORNER_RADIUS}
                shadowOffsetX={SHADOW_OFFSET_X}
                shadowOffsetY={SHADOW_OFFSET_Y}
                shadowBlur={SHADOW_BLUR}
                shadowOpacity={SHADOW_OPACITY}
                opacity={TRANSPARENCY_VALUE}
            />
            <Text
                x={5}
                y={15}
                text={instrumentName}
                fontSize={15}
                fill="black"
                opacity={TRANSPARENCY_VALUE}
            />
        </Group>
    );
};

SoundEventElement.propTypes = {
    index: PropTypes.number.isRequired,
    isOverlapping: PropTypes.bool,
    isTargeted: PropTypes.bool,
    openPanel: PropTypes.func,
    recording: PropTypes.shape({
        eventInstance: PropTypes.object.isRequired,
        eventLength: PropTypes.number.isRequired,
        id: PropTypes.number.isRequired,
        instrumentName: PropTypes.string.isRequired,
        startTime: PropTypes.number.isRequired,
    }).isRequired,
    timelineHeight: PropTypes.number.isRequired,
    timelineY: PropTypes.number.isRequired,
    updateStartTime: PropTypes.func.isRequired,
};

export default SoundEventElement;

import PropTypes from 'prop-types';
import React, { useCallback, useMemo } from 'react';
import { Group, Rect, Text } from 'react-konva';
import {
    getEventInstanceLength,
    playEventInstance,
} from '../../../../fmodLogic/eventInstanceHelpers';
import pixelToSecondRatio from '../../../../globalConstants/pixelToSeconds';

const STROKE_WIDTH = 2;
const CORNER_RADIUS = 5;
const SHADOW_OFFSET_X = 2;
const SHADOW_OFFSET_Y = 2;
const SHADOW_BLUR = 5;
const SHADOW_OPACITY = 0.5;
const TRANSPARENCY_VALUE = 0.8;
const GRADIENT_START_POINT = { x: 0, y: 0 };
const GRADIENT_END_POINT = { x: 100, y: 0 };
const COLOR_STOPS = [0, '#ff4500', 1, '#e62e00'];

const createHandleDragEnd =
    (handleDragEnd, index, eventLength, instrumentName) => (e) => {
        handleDragEnd({
            e,
            elementIndex: index,
            eventLength,
            instrumentName,
        });
    };

const createHandleClick =
    (openPanel, recording, index, instrumentName) => () => {
        openPanel(recording, index, instrumentName);
    };

const createHandleDoubleClick = (eventInstance) => () => {
    playEventInstance(eventInstance);
};

const SoundEventElement = ({
    handleDragEnd,
    index,
    openPanel,
    recording,
    timelineHeight,
    timelineY,
}) => {
    const { eventInstance, instrumentName, startTime } = recording;
    const startingPositionInTimeline = startTime * pixelToSecondRatio;
    const eventLength = getEventInstanceLength(eventInstance);
    const lengthBasedWidth = eventLength * pixelToSecondRatio;

    const handleDragEndCallback = createHandleDragEnd(
        handleDragEnd,
        index,
        eventLength,
        instrumentName
    );
    const handleClickCallback = createHandleClick(
        openPanel,
        recording,
        index,
        instrumentName
    );
    const handleDoubleClickCallback = createHandleDoubleClick(eventInstance);

    const dragBoundFunc = useCallback(
        (pos) => ({ x: pos.x, y: timelineY }),
        [timelineY]
    );

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
                fillLinearGradientColorStops={COLOR_STOPS}
                stroke="#b22a00"
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
    handleDragEnd: PropTypes.func.isRequired,
    index: PropTypes.number.isRequired,
    openPanel: PropTypes.func.isRequired,
    recording: PropTypes.shape({
        eventInstance: PropTypes.object.isRequired,
        instrumentName: PropTypes.string.isRequired,
        startTime: PropTypes.number.isRequired,
    }).isRequired,
    timelineHeight: PropTypes.number.isRequired,
    timelineY: PropTypes.number.isRequired,
};

export default SoundEventElement;

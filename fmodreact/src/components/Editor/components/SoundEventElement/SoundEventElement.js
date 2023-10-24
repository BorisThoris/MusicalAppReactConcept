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
const TRANSPARENCY_VALUE = 0.8; // 50% transparency

const SoundEventElement = ({
    handleDragEnd,
    index,
    openPanel,
    recording,
    timelineHeight,
}) => {
    const { eventInstance, instrumentName, startTime } = recording;

    const startingPositionInTimeline = startTime * pixelToSecondRatio;
    const eventLength = getEventInstanceLength(eventInstance);
    const lengthBasedWidth = eventLength * pixelToSecondRatio;

    const handleDragEndMemo = useCallback(
        (e) => {
            handleDragEnd({ e, eventLength, index, instrumentName });
        },
        [eventLength, handleDragEnd, index, instrumentName]
    );

    const handleClick = useCallback(
        () => openPanel(recording, index, instrumentName),
        [index, instrumentName, openPanel, recording]
    );

    const handleDoubleClick = useCallback(
        () => playEventInstance(eventInstance),
        [eventInstance]
    );

    const gradientStartPoint = useMemo(() => ({ x: 0, y: 0 }), []);
    const gradientEndPoint = useMemo(() => ({ x: 100, y: 0 }), []);
    const colorStops = useMemo(() => [0, '#ff4500', 1, '#e62e00'], []);
    const dragBoundFunc = useCallback((pos) => ({ x: pos.x, y: 0 }), []);

    return (
        <Group
            key={index}
            x={startingPositionInTimeline}
            draggable
            dragBoundFunc={dragBoundFunc}
            onDragEnd={handleDragEndMemo}
            onClick={handleClick}
            onDblClick={handleDoubleClick}
        >
            <Rect
                x={0}
                y={0}
                width={lengthBasedWidth}
                height={timelineHeight * 0.8}
                fillLinearGradientStartPoint={gradientStartPoint}
                fillLinearGradientEndPoint={gradientEndPoint}
                fillLinearGradientColorStops={colorStops}
                stroke="#b22a00"
                strokeWidth={STROKE_WIDTH}
                cornerRadius={CORNER_RADIUS}
                shadowOffsetX={SHADOW_OFFSET_X}
                shadowOffsetY={SHADOW_OFFSET_Y}
                shadowBlur={SHADOW_BLUR}
                shadowOpacity={SHADOW_OPACITY}
                opacity={TRANSPARENCY_VALUE} // Added opacity
            />
            <Text
                x={5}
                y={15}
                text={instrumentName}
                fontSize={15}
                fill="black"
                opacity={TRANSPARENCY_VALUE} // Added opacity
            />
        </Group>
    );
};

SoundEventElement.propTypes = {
    handleDragEnd: PropTypes.func.isRequired,
    index: PropTypes.number.isRequired,
    openPanel: PropTypes.func.isRequired,
    recording: PropTypes.shape({
        endTime: PropTypes.number.isRequired,
        eventInstance: PropTypes.object.isRequired,
        instrumentName: PropTypes.string.isRequired,
        startTime: PropTypes.number.isRequired,
    }).isRequired,
    timelineHeight: PropTypes.number.isRequired,
};

export default SoundEventElement;

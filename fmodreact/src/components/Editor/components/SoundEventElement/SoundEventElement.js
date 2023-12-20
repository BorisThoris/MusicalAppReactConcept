import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Group, Rect, Text } from 'react-konva';
import { playEventInstance } from '../../../../fmodLogic/eventInstanceHelpers';
import pixelToSecondRatio from '../../../../globalConstants/pixelToSeconds';

const CONSTANTS = {
    CORNER_RADIUS: 5,
    GRADIENT_END: { x: 100, y: 0 },
    GRADIENT_START: { x: 0, y: 0 },
    SHADOW: { BLUR: 5, OFFSET: { x: 8, y: 5 }, OPACITY: 0.5 },
    STROKE_WIDTH: 2,
    TEXT_STYLE: { fill: 'black', fontSize: 15, x: 5, y: 15 },
    TRANSPARENCY_VALUE: 0.8,
};

const getDynamicStroke = (isTargeted, isFocused) => {
    if (isTargeted) return 'blue';
    if (isFocused) return 'green';
    return 'red';
};

const getDynamicShadowBlur = (isFocused) =>
    isFocused ? 10 : CONSTANTS.SHADOW.BLUR;

const getDynamicColorStops = (isOverlapping) =>
    isOverlapping ? [0, 'red', 1, 'yellow'] : [1, 'red'];

const SoundEventElement = ({
    index,
    isFocused,
    isOverlapping,
    isTargeted,
    openPanel,
    recording,
    timelineHeight,
    timelineY,
    updateStartTime,
}) => {
    const [hoevered, setIsHovered] = useState(false);
    const { eventInstance, eventLength, id, instrumentName, startTime } =
        recording;
    const startingPositionInTimeline = startTime * pixelToSecondRatio;
    const lengthBasedWidth = eventLength * pixelToSecondRatio;
    const groupRef = useRef();

    const dynamicStroke = getDynamicStroke(isTargeted, isFocused);
    const dynamicShadowBlur = getDynamicShadowBlur(isFocused);
    const dynamicColorStops = getDynamicColorStops(isOverlapping);

    const handleDragEnd = useCallback(
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

    const dragBoundFunc = useCallback(
        (pos) => ({ x: pos.x, y: timelineY }),
        [timelineY]
    );

    const handleClick = useCallback(() => {
        if (openPanel) openPanel({ index, instrumentName });
    }, [openPanel, index, instrumentName]);

    const handleDoubleClick = useCallback(
        () => playEventInstance(eventInstance),
        [eventInstance]
    );

    const handleDragStart = useCallback((el) => el.target.moveToTop(), []);

    useEffect(() => {
        if (isFocused && groupRef.current) {
            groupRef.current.moveToTop();
        }
    }, [isFocused]);

    return (
        <Group
            // eslint-disable-next-line react-perf/jsx-no-new-function-as-prop
            onMouseEnter={() => setIsHovered(true)}
            // eslint-disable-next-line react-perf/jsx-no-new-function-as-prop
            onMouseLeave={() => setIsHovered(false)}
            ref={groupRef}
            key={index}
            x={startingPositionInTimeline}
            draggable
            dragBoundFunc={dragBoundFunc}
            onDragEnd={handleDragEnd}
            onClick={handleClick}
            onDblClick={handleDoubleClick}
            onDragStart={handleDragStart}
        >
            <Rect
                x={0}
                y={isFocused || hoevered ? -4 : 0}
                width={lengthBasedWidth}
                height={timelineHeight * 0.8}
                fillLinearGradientStartPoint={CONSTANTS.GRADIENT_START}
                fillLinearGradientEndPoint={CONSTANTS.GRADIENT_END}
                fillLinearGradientColorStops={dynamicColorStops}
                stroke={dynamicStroke}
                strokeWidth={CONSTANTS.STROKE_WIDTH}
                cornerRadius={CONSTANTS.CORNER_RADIUS}
                shadowOffset={CONSTANTS.SHADOW.OFFSET}
                shadowBlur={dynamicShadowBlur}
                shadowOpacity={CONSTANTS.SHADOW.OPACITY}
                opacity={CONSTANTS.TRANSPARENCY_VALUE}
            />
            <Text
                {...CONSTANTS.TEXT_STYLE}
                text={instrumentName}
                opacity={CONSTANTS.TRANSPARENCY_VALUE}
            />
        </Group>
    );
};

SoundEventElement.propTypes = {
    index: PropTypes.number.isRequired,
    isFocused: PropTypes.bool.isRequired,
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

SoundEventElement.defaultProps = {
    isOverlapping: false,
    isTargeted: false,
    openPanel: null,
};

export default SoundEventElement;

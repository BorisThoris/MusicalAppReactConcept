import PropTypes from 'prop-types';
import React, { Fragment, useCallback } from 'react';
import { Group, Rect, Text } from 'react-konva';
import pixelToSecondRatio from '../../../../globalConstants/pixelToSeconds';
import SoundEventElement from '../SoundEventElement/SoundEventElement';

const GROUP_COLOR = 'blue';
const GROUP_OPACITY = 0.6;
const GROUP_STROKE_WIDTH = 4;
const GROUP_TEXT = 'Overlapping Events';
const TEXT_OFFSET_X = 10;
const TEXT_OFFSET_Y = 20;
const TEXT_FONT_SIZE = 18;

const OverlapGroupElement = ({
    groupData,
    index,
    isTargeted,
    openPanel,
    timelineHeight,
    timelineY,
    updateStartTime,
}) => {
    const { endTime, events, instrumentName, startTime } = groupData;
    const startingPositionInTimeline = startTime * pixelToSecondRatio;
    const groupWidth = (endTime - startTime) * pixelToSecondRatio;

    const handleDragEnd = useCallback(
        (e) => {
            const newGroupStart = e.target.x() / pixelToSecondRatio;
            const timeShift = newGroupStart - startTime;

            events.forEach((event) => {
                const newEventStart = event.startTime + timeShift;

                updateStartTime({
                    ...event,
                    eventLength: event.eventLength,
                    index: event.id,
                    newStartTime: newEventStart,
                });
            });
        },
        [events, startTime, updateStartTime]
    );

    const handleClickOverlapGroup = useCallback(() => {
        openPanel({ index, instrumentName });
    }, [index, instrumentName, openPanel]);

    const dragBoundFunc = useCallback(
        (pos) => ({ x: pos.x, y: timelineY }),
        [timelineY]
    );

    return (
        <Fragment>
            <Group
                key={index}
                x={startingPositionInTimeline}
                draggable
                dragBoundFunc={dragBoundFunc}
                onDragEnd={handleDragEnd}
                onClick={handleClickOverlapGroup}
            >
                <Rect
                    width={groupWidth}
                    height={timelineHeight * 0.8}
                    fill={isTargeted ? 'red' : GROUP_COLOR}
                    opacity={GROUP_OPACITY}
                    strokeWidth={GROUP_STROKE_WIDTH}
                    stroke={GROUP_COLOR}
                />
                <Text
                    x={TEXT_OFFSET_X}
                    y={TEXT_OFFSET_Y}
                    text={GROUP_TEXT}
                    fontSize={TEXT_FONT_SIZE}
                    fill="white"
                />
            </Group>

            <Group>
                {isTargeted &&
                    events.map((event, eventIndex) => (
                        <SoundEventElement
                            key={event.id}
                            index={eventIndex}
                            isOverlapping={events.length > 1}
                            recording={event}
                            timelineHeight={timelineHeight}
                            timelineY={timelineY}
                            updateStartTime={updateStartTime}
                        />
                    ))}
            </Group>
        </Fragment>
    );
};

OverlapGroupElement.propTypes = {
    groupData: PropTypes.shape({
        endTime: PropTypes.number.isRequired,
        events: PropTypes.arrayOf(
            PropTypes.shape({
                eventInstance: PropTypes.object.isRequired,
                eventLength: PropTypes.number.isRequired,
                instrumentName: PropTypes.string.isRequired,
                startTime: PropTypes.number.isRequired,
            })
        ).isRequired,
        instrumentName: PropTypes.string.isRequired,
        startTime: PropTypes.number.isRequired,
    }).isRequired,
    index: PropTypes.number.isRequired,
    isTargeted: PropTypes.bool.isRequired,
    openPanel: PropTypes.func.isRequired,
    timelineHeight: PropTypes.number.isRequired,
    timelineY: PropTypes.number.isRequired,
    updateStartTime: PropTypes.func.isRequired,
};

export default OverlapGroupElement;

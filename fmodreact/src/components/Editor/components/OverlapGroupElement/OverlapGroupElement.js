import { isEqual } from 'lodash';
import PropTypes from 'prop-types';
import React, { Fragment, useCallback } from 'react';
import { Group, Rect, Text } from 'react-konva';
import pixelToSecondRatio from '../../../../globalConstants/pixelToSeconds';
import { useInstrumentRecordingsOperations } from '../../../../hooks/useInstrumentRecordingsOperations';
import SoundEventElement from '../SoundEventElement/SoundEventElement';

const GROUP_COLOR = 'blue';
const GROUP_OPACITY = 0.6;
const GROUP_STROKE_WIDTH = 4;
const GROUP_TEXT = 'Overlapping Events';
const TEXT_OFFSET_X = 10;
const TEXT_OFFSET_Y = 20;
const LOCK_OFFSET_Y = -10;
const TEXT_FONT_SIZE = 18;

const OverlapGroupElement = React.memo(
    ({
        focusedEvent,
        groupData,
        index,
        isTargeted,
        openPanel,
        setFocusedEvent,
        timelineHeight,
        timelineY,
        updateStartTime,
    }) => {
        const { lockOverlapGroupById } = useInstrumentRecordingsOperations();

        const { endTime, events, id, instrumentName, locked, startTime } =
            groupData;

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

        const onLockOverlapGroup = useCallback(() => {
            lockOverlapGroupById({ groupId: id });
        }, [id, lockOverlapGroupById]);

        return (
            <Fragment>
                <Group
                    key={index}
                    x={startingPositionInTimeline}
                    draggable
                    dragBoundFunc={dragBoundFunc}
                    onDragEnd={handleDragEnd}
                >
                    <Rect
                        width={groupWidth}
                        height={timelineHeight * 0.9}
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

                <Group onClick={handleClickOverlapGroup}>
                    {events.map((event, eventIndex) => (
                        <SoundEventElement
                            key={event.id}
                            index={eventIndex}
                            isOverlapping={events.length > 1}
                            recording={event}
                            timelineHeight={timelineHeight}
                            timelineY={timelineY}
                            updateStartTime={updateStartTime}
                            isFocused={event.id === focusedEvent}
                            setFocusedEvent={setFocusedEvent}
                        />
                    ))}
                </Group>

                <Text
                    onClick={onLockOverlapGroup}
                    x={startingPositionInTimeline - 10}
                    y={LOCK_OFFSET_Y}
                    text={locked ? '🔒' : '✔️'}
                    fontSize={TEXT_FONT_SIZE}
                    fill="white"
                />
            </Fragment>
        );
    },
    isEqual
);

OverlapGroupElement.propTypes = {
    focusedEvent: PropTypes.number.isRequired,
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

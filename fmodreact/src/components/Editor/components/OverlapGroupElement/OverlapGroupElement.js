/* eslint-disable no-unsafe-optional-chaining */
import { isEqual } from 'lodash';
import PropTypes from 'prop-types';
import React, { useCallback, useRef, useState } from 'react';
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
        canvasOffsetY,
        focusedEvent,
        groupData,
        index,
        isTargeted,
        openPanel,
        setFocusedEvent,
        timelineHeight,
        timelineY,
        updateStartTime
    }) => {
        const groupElmRef = useRef();
        const [isDragged, setIsDragged] = useState(false);
        const { lockOverlapGroupById, updateOverlapGroupTimes } = useInstrumentRecordingsOperations();

        const { endTime, events, id, instrumentName, locked, startTime } = groupData;

        const startingPositionInTimeline = startTime * pixelToSecondRatio;
        const groupWidth = (endTime - startTime) * pixelToSecondRatio;

        const handleDragEnd = useCallback(
            (e) => {
                setIsDragged(false);

                const newGroupStart = e.target.x() / pixelToSecondRatio;
                updateOverlapGroupTimes({
                    groupId: id,
                    newStartTime: newGroupStart
                });
            },
            [id, updateOverlapGroupTimes]
        );

        const handleClickOverlapGroup = useCallback(() => {
            const fallbackX = 0;
            const groupX = groupElmRef.current?.parent?.attrs?.x || fallbackX;
            // eslint-disable-next-line no-unsafe-optional-chaining
            const groupY = timelineY + canvasOffsetY + groupElmRef.current?.attrs?.height;
            openPanel({ index, instrumentName, x: groupX, y: groupY });
        }, [canvasOffsetY, index, instrumentName, openPanel, timelineY]);

        const dragBoundFunc = useCallback((pos) => ({ x: pos.x, y: timelineY }), [timelineY]);

        const onLockOverlapGroup = useCallback(() => {
            lockOverlapGroupById({ groupId: id });
        }, [id, lockOverlapGroupById]);

        const onDragStart = useCallback(() => {
            setIsDragged(true);
        }, []);

        return (
            <Group onClick={handleClickOverlapGroup}>
                <Group
                    key={index}
                    x={startingPositionInTimeline}
                    draggable={!locked}
                    onDragEnd={handleDragEnd}
                    dragBoundFunc={dragBoundFunc}
                    // eslint-disable-next-line react-perf/jsx-no-new-function-as-prop
                    onDragStart={onDragStart}
                    width={groupWidth}
                >
                    <Rect
                        ref={groupElmRef}
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
                    <Text
                        onClick={onLockOverlapGroup}
                        x={-10}
                        y={LOCK_OFFSET_Y}
                        text={locked ? '🔒' : '✔️'}
                        fontSize={TEXT_FONT_SIZE}
                        fill="white"
                    />

                    {isDragged && (
                        <Group x={-startingPositionInTimeline}>
                            {events.map((event, eventIndex) => (
                                <SoundEventElement
                                    parent={groupData}
                                    key={event.id}
                                    index={eventIndex}
                                    isOverlapping={events.length > 1}
                                    recording={event}
                                    timelineHeight={timelineHeight}
                                    timelineY={timelineY}
                                    updateStartTime={updateStartTime}
                                    isFocused={event.id === focusedEvent}
                                    setFocusedEvent={setFocusedEvent}
                                    canvasOffsetY={canvasOffsetY}
                                />
                            ))}
                        </Group>
                    )}
                </Group>

                {!isDragged && (
                    <Group>
                        {events.map((event, eventIndex) => (
                            <SoundEventElement
                                parent={groupData}
                                key={event.id}
                                index={eventIndex}
                                isOverlapping={events.length > 1}
                                recording={event}
                                timelineHeight={timelineHeight}
                                timelineY={timelineY}
                                updateStartTime={updateStartTime}
                                isFocused={event.id === focusedEvent}
                                setFocusedEvent={setFocusedEvent}
                                canvasOffsetY={canvasOffsetY}
                            />
                        ))}
                    </Group>
                )}
            </Group>
        );
    },
    isEqual
);

OverlapGroupElement.propTypes = {
    canvasOffsetY: PropTypes.number.isRequired,
    focusedEvent: PropTypes.number.isRequired,
    groupData: PropTypes.shape({
        endTime: PropTypes.number.isRequired,
        events: PropTypes.arrayOf(
            PropTypes.shape({
                eventInstance: PropTypes.object.isRequired,
                eventLength: PropTypes.number.isRequired,
                id: PropTypes.string.isRequired,
                instrumentName: PropTypes.string.isRequired,
                startTime: PropTypes.number.isRequired
            })
        ).isRequired,
        id: PropTypes.string.isRequired,
        instrumentName: PropTypes.string.isRequired,
        locked: PropTypes.bool,
        startTime: PropTypes.number.isRequired
    }).isRequired,
    index: PropTypes.number.isRequired,
    isTargeted: PropTypes.bool.isRequired,
    openPanel: PropTypes.func.isRequired,
    setFocusedEvent: PropTypes.func.isRequired,
    timelineHeight: PropTypes.number.isRequired,
    timelineY: PropTypes.number.isRequired,
    updateStartTime: PropTypes.func.isRequired
};

export default OverlapGroupElement;

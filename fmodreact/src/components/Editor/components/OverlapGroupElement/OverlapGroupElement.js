// Import statements grouped by source
import get from 'lodash/get';
import isEqual from 'lodash/isEqual';
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Group, Rect, Text } from 'react-konva';
import pixelToSecondRatio from '../../../../globalConstants/pixelToSeconds';
import { useInstrumentRecordingsOperations } from '../../../../hooks/useInstrumentRecordingsOperations';
import { PanelContext } from '../../../../hooks/usePanelState';
import { SelectionContext } from '../../../../providers/SelectionsProvider';
import { TimelineContext } from '../../../../providers/TimelineProvider';
// Relative imports
import SoundEventElement from '../SoundEventElement/SoundEventElement';

const GROUP_STROKE_WIDTH = 4;

const LOCK_OFFSET_Y = -10;
const TEXT_FONT_SIZE = 18;

// OverlapGroupElement component definition
export const OverlapGroupElement = React.memo(
    ({
        childDragBoundFunc,
        groupData,
        handleChildDragEnd,
        handleChildDragMove,
        handleChildDragStart,
        index,
        isChildElementBeingDragged,
        timelineHeight,
        timelineY
    }) => {
        const groupElmRef = useRef();
        const [isDragged, setIsDragged] = useState(false);
        const { timelineState } = useContext(TimelineContext);
        const { lockOverlapGroupById, updateOverlapGroupTimes } = useInstrumentRecordingsOperations();

        const { openSelectionsPanel } = useContext(PanelContext);

        const { endTime, events, id, locked, startTime } = groupData;
        const eventsArray = Object.values(events).sort((a, b) => a.startTime - b.startTime);

        const canvasOffsetY = timelineState.canvasOffsetY || undefined;
        const startingPositionInTimeline = startTime * pixelToSecondRatio;
        const groupWidth = (endTime - startTime) * pixelToSecondRatio;
        const groupY = timelineY + canvasOffsetY + get(groupElmRef, 'current.attrs.height');

        const { handleSelectionBoxMove, toggleItem } = useContext(SelectionContext);

        const [elementXPosition, setElementXPosition] = useState(startingPositionInTimeline);

        useEffect(() => {
            setElementXPosition(startTime * pixelToSecondRatio);
        }, [startTime]);

        const handleDragEnd = useCallback(
            (e) => {
                setIsDragged(false);

                updateOverlapGroupTimes({
                    groupId: id,
                    newStartTime: e.target.x() / pixelToSecondRatio
                });
            },
            [id, updateOverlapGroupTimes]
        );

        const handleOverlapGroupClick = useCallback(
            (e) => {
                toggleItem(eventsArray);
                openSelectionsPanel({ y: groupY });
            },
            [eventsArray, groupY, openSelectionsPanel, toggleItem]
        );

        const dragBoundFunc = useCallback((pos) => ({ x: pos.x, y: timelineY }), [timelineY]);

        const onLockOverlapGroup = useCallback(() => {
            lockOverlapGroupById({ groupId: id });
        }, [id, lockOverlapGroupById]);

        const handleDragStart = useCallback(() => {
            setIsDragged(true);
        }, []);

        const renderEvents = () => {
            const maxEventHeight = timelineHeight * 0.8;
            const eventHeightIncrement = maxEventHeight / eventsArray.length;

            // Convert the events object into an array for rendering
            return eventsArray.map((event, eventIndex) => (
                <SoundEventElement
                    key={event.id}
                    handleClickOverlapGroup={handleOverlapGroupClick}
                    index={eventIndex}
                    recording={event}
                    parent={groupData}
                    timelineHeight={eventHeightIncrement * (eventIndex + 1)}
                    timelineY={timelineY}
                    listening={!locked}
                    handleDragEnd={handleChildDragEnd}
                    handleDragStart={handleChildDragStart}
                    dragBoundFunc={childDragBoundFunc}
                    handleDragMove={handleChildDragMove}
                    isElementBeingDragged={isChildElementBeingDragged}
                />
            ));
        };

        const onGroupWrapperClick = useCallback(
            (e) => {
                handleOverlapGroupClick(e);
            },
            [handleOverlapGroupClick]
        );

        return (
            <Group id={`parent-${id}`}>
                <Group
                    id={`overlapgroup-${id}`}
                    key={index}
                    x={elementXPosition}
                    draggable={locked}
                    onDragMove={handleSelectionBoxMove}
                    dragBoundFunc={dragBoundFunc}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                    width={groupWidth}
                    onClick={onGroupWrapperClick}
                >
                    <Rect
                        ref={groupElmRef}
                        width={groupWidth}
                        height={timelineHeight}
                        opacity={1}
                        strokeWidth={GROUP_STROKE_WIDTH}
                    />

                    {isDragged && (
                        <>
                            <Group x={-elementXPosition}>{renderEvents()}</Group>
                            <Text
                                onClick={onLockOverlapGroup}
                                x={-10}
                                y={LOCK_OFFSET_Y}
                                text={locked ? '🔒' : '✔️'}
                                fontSize={TEXT_FONT_SIZE}
                                fill="white"
                            />
                        </>
                    )}
                </Group>

                {!isDragged && (
                    <>
                        <Group>{renderEvents()}</Group>
                        <Text
                            onClick={onLockOverlapGroup}
                            x={elementXPosition - 10}
                            y={LOCK_OFFSET_Y}
                            text={locked ? '🔒' : '✔️'}
                            fontSize={TEXT_FONT_SIZE}
                            fill="white"
                        />
                    </>
                )}
            </Group>
        );
    },
    isEqual
);

export default OverlapGroupElement;

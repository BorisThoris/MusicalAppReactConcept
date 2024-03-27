// Import statements grouped by source
import get from 'lodash/get';
import isEqual from 'lodash/isEqual';
import PropTypes from 'prop-types';
import React, { useCallback, useContext, useMemo, useRef, useState } from 'react';
import { Group, Rect, Text } from 'react-konva';
import pixelToSecondRatio from '../../../../globalConstants/pixelToSeconds';
import { useInstrumentRecordingsOperations } from '../../../../hooks/useInstrumentRecordingsOperations';
import { PanelContext } from '../../../../hooks/usePanelState';
import { TimelineContext } from '../../../../providers/TimelineProvider';
// Relative imports
import SoundEventElement from '../SoundEventElement/SoundEventElement';

// Constants
const GROUP_COLOR = 'blue';
const GROUP_OPACITY = 0.6;
const GROUP_STROKE_WIDTH = 4;
const GROUP_TEXT = 'Overlapping Events';
const TEXT_OFFSET_X = 10;
const TEXT_OFFSET_Y = 20;
const LOCK_OFFSET_Y = -10;
const TEXT_FONT_SIZE = 18;

// OverlapGroupElement component definition
const OverlapGroupElement = React.memo(({ groupData, index, isTargeted, timelineHeight, timelineY }) => {
    const groupElmRef = useRef();
    const [isDragged, setIsDragged] = useState(false);
    const { timelineState } = useContext(TimelineContext);
    const { lockOverlapGroupById, updateOverlapGroupTimes } = useInstrumentRecordingsOperations();

    const { openParamsPanel } = useContext(PanelContext);

    const { endTime, events, id, instrumentName, locked, startTime } = groupData;
    const canvasOffsetY = timelineState.canvasOffsetY || undefined;
    const startingPositionInTimeline = startTime * pixelToSecondRatio;
    const groupWidth = (endTime - startTime) * pixelToSecondRatio;

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

    const handleClickOverlapGroup = useCallback(() => {
        const groupX = get(groupElmRef, 'current.parent.attrs.x') || 0;
        const groupY = timelineY + canvasOffsetY + get(groupElmRef, 'current.attrs.height');
        openParamsPanel({ index, instrumentName, overlapGroup: groupData, x: groupX, y: groupY });
    }, [canvasOffsetY, groupData, index, instrumentName, openParamsPanel, timelineY]);

    const dragBoundFunc = useCallback((pos) => ({ x: pos.x, y: timelineY }), [timelineY]);

    const onLockOverlapGroup = useCallback(() => {
        lockOverlapGroupById({ groupId: id });
    }, [id, lockOverlapGroupById]);

    const onDragStart = useCallback(() => setIsDragged(true), []);

    const renderEvents = () =>
        events.map((event, eventIndex) => (
            <SoundEventElement
                key={event.id}
                handleClickOverlapGroup={handleClickOverlapGroup}
                index={eventIndex}
                recording={event}
                timelineHeight={timelineHeight}
                timelineY={timelineY}
            />
        ));

    return (
        <Group>
            <Group
                key={index}
                x={startingPositionInTimeline}
                draggable
                onDragEnd={handleDragEnd}
                dragBoundFunc={dragBoundFunc}
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
                <Text x={TEXT_OFFSET_X} y={TEXT_OFFSET_Y} text={GROUP_TEXT} fontSize={TEXT_FONT_SIZE} fill="white" />
                {isDragged && (
                    <>
                        <Group x={-startingPositionInTimeline}>{renderEvents()}</Group>
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
                        x={startingPositionInTimeline - 10}
                        y={LOCK_OFFSET_Y}
                        text={locked ? '🔒' : '✔️'}
                        fontSize={TEXT_FONT_SIZE}
                        fill="white"
                    />
                </>
            )}
        </Group>
    );
}, isEqual);

// PropTypes for component validation
OverlapGroupElement.propTypes = {
    canvasOffsetY: PropTypes.number.isRequired,
    focusedEvent: PropTypes.number.isRequired,
    groupData: PropTypes.shape({
        endTime: PropTypes.number.isRequired,
        events: PropTypes.arrayOf(
            PropTypes.shape({
                id: PropTypes.string.isRequired,
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
    openParamsPanel: PropTypes.func.isRequired,
    setFocusedEvent: PropTypes.func.isRequired,
    timelineHeight: PropTypes.number.isRequired,
    timelineY: PropTypes.number.isRequired,
    updateStartTime: PropTypes.func.isRequired
};

// Export statement
export default OverlapGroupElement;

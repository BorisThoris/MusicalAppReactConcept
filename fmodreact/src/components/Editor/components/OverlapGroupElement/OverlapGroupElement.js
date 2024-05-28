// Import statements grouped by source
import get from 'lodash/get';
import isEqual from 'lodash/isEqual';
import PropTypes from 'prop-types';
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Group, Rect, Text } from 'react-konva';
import pixelToSecondRatio from '../../../../globalConstants/pixelToSeconds';
import { useInstrumentRecordingsOperations } from '../../../../hooks/useInstrumentRecordingsOperations';
import { PanelContext } from '../../../../hooks/usePanelState';
import { SelectionContext } from '../../../../providers/SelectionsProvider';
import { TimelineContext } from '../../../../providers/TimelineProvider';
// Relative imports
import SoundEventElement from '../SoundEventElement/SoundEventElement';
import useElementSelectionMovement from '../SoundEventElement/useElementSelectionMovement';

// Constants
const GROUP_COLOR = 'blue';

const GROUP_STROKE_WIDTH = 4;
const GROUP_TEXT = 'Overlapping Events';
const TEXT_OFFSET_X = 10;
const TEXT_OFFSET_Y = 20;
const LOCK_OFFSET_Y = -10;
const TEXT_FONT_SIZE = 18;

// OverlapGroupElement component definition
const OverlapGroupElement = React.memo(({ groupData, index, timelineHeight, timelineY }) => {
    const groupElmRef = useRef();
    const [isDragged, setIsDragged] = useState(false);
    const { timelineState } = useContext(TimelineContext);
    const { lockOverlapGroupById, updateOverlapGroupTimes } = useInstrumentRecordingsOperations();

    const { openParamsPanel, openSelectionsPanel } = useContext(PanelContext);

    const { endTime, events, id, instrumentName, locked, startTime } = groupData;
    const eventsArray = Object.values(events);

    const canvasOffsetY = timelineState.canvasOffsetY || undefined;
    const startingPositionInTimeline = startTime * pixelToSecondRatio;
    const groupWidth = (endTime - startTime) * pixelToSecondRatio;
    const groupY = timelineY + canvasOffsetY + get(groupElmRef, 'current.attrs.height');

    const { handleSelectionBoxClick, handleSelectionBoxDragEnd, handleSelectionBoxMove, isItemSelected, toggleItem } =
        useContext(SelectionContext);

    const isSelected = isItemSelected(id);
    const [elementXPosition, setElementXPosition] = useState(startingPositionInTimeline);

    useElementSelectionMovement({ elementXPosition, isSelected, recording: groupData, setElementXPosition });

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
            const isLeftClickWithCtrl = e?.evt?.button === 0 && e?.evt?.ctrlKey;
            if (isLeftClickWithCtrl && groupElmRef.current) {
                toggleItem(eventsArray);
                openSelectionsPanel({ y: groupY });
            } else {
                const groupX = get(groupElmRef, 'current.parent.attrs.x') || 0;
                openParamsPanel({ index, instrumentName, overlapGroup: groupData, x: groupX, y: groupY });
            }
        },
        [eventsArray, groupData, groupY, index, instrumentName, openParamsPanel, openSelectionsPanel, toggleItem]
    );

    const dragBoundFunc = useCallback((pos) => ({ x: pos.x, y: timelineY }), [timelineY]);

    const onLockOverlapGroup = useCallback(() => {
        lockOverlapGroupById({ groupId: id });
    }, [id, lockOverlapGroupById]);

    const handleDragStart = useCallback(() => {
        setIsDragged(true);
    }, []);

    const renderEvents = () => {
        // Convert the events object into an array for rendering

        return eventsArray.map((event, eventIndex) => (
            <SoundEventElement
                key={event.id}
                handleClickOverlapGroup={handleOverlapGroupClick}
                index={eventIndex}
                recording={event}
                parent={groupData}
                timelineHeight={timelineHeight}
                timelineY={timelineY}
                listening={!locked}
            />
        ));
    };

    const onGroupWrapperClick = useCallback(
        (e) => {
            handleSelectionBoxClick(e);
            handleOverlapGroupClick(e);
        },
        [handleOverlapGroupClick, handleSelectionBoxClick]
    );

    return (
        <Group>
            <Group
                key={index}
                x={elementXPosition}
                draggable={locked}
                onDragMove={handleSelectionBoxMove}
                dragBoundFunc={dragBoundFunc}
                onDragStart={!isSelected ? handleDragStart : handleSelectionBoxClick}
                onDragEnd={!isSelected ? handleDragEnd : handleSelectionBoxDragEnd}
                width={groupWidth}
                // eslint-disable-next-line react-perf/jsx-no-new-function-as-prop
                onClick={onGroupWrapperClick}
            >
                <Rect
                    ref={groupElmRef}
                    width={groupWidth}
                    height={timelineHeight * 0.8}
                    fill={"isTargeted ? 'red' : GROUP_COLOR"}
                    opacity={1}
                    strokeWidth={GROUP_STROKE_WIDTH}
                    stroke={GROUP_COLOR}
                />
                <Text x={TEXT_OFFSET_X} y={TEXT_OFFSET_Y} text={GROUP_TEXT} fontSize={TEXT_FONT_SIZE} fill="white" />
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

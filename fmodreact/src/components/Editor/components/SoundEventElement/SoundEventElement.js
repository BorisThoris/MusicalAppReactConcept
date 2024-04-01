import { get } from 'lodash';
import isEqual from 'lodash/isEqual';
import PropTypes from 'prop-types';
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Group, Rect, Text } from 'react-konva';
import { playEventInstance } from '../../../../fmodLogic/eventInstanceHelpers';
import pixelToSecondRatio from '../../../../globalConstants/pixelToSeconds';
import { useCustomDrag } from '../../../../hooks/useCustomDrag';
import { useDynamicStyles } from '../../../../hooks/useDynamicStyles';
import { useEventFocus } from '../../../../hooks/useEventFocus';
import { useInstrumentRecordingsOperations } from '../../../../hooks/useInstrumentRecordingsOperations';
import { PanelContext, SELECTIONS_PANEL_ID } from '../../../../hooks/usePanelState';
import { SelectionContext } from '../../../../providers/SelectionsProvider';
import { TimelineContext } from '../../../../providers/TimelineProvider';

const CONSTANTS = {
    CORNER_RADIUS: 5,
    GRADIENT_END: { x: 100, y: 0 },
    GRADIENT_START: { x: 0, y: 0 },
    LOCK_OFFSET_Y: -10,
    SHADOW: { BLUR: 5, OFFSET: { x: 8, y: 5 }, OPACITY: 0.5 },
    STROKE_WIDTH: 2,
    TEXT_FONT_SIZE: 18,
    TEXT_STYLE: {
        fill: 'black',
        fontSize: 15,
        x: 5,
        y: 15
    },
    TRANSPARENCY_VALUE: 0.8
};

const SoundEventElement = React.memo(({ handleClickOverlapGroup, index, recording, timelineHeight, timelineY }) => {
    const { timelineState } = useContext(TimelineContext);
    const { focusedEvent, openPanel, openParamsPanel, setFocusedEvent } = useContext(PanelContext);
    const { isItemSelected, toggleItem: selectElement, updateSelectedItemsStartTime } = useContext(SelectionContext);
    const {
        getEventById,
        lockOverlapGroupById,
        updateRecording: updateStartTime
    } = useInstrumentRecordingsOperations();

    const { eventInstance, eventLength, id, instrumentName, locked, name, parentId, startTime } = recording;

    const parent = getEventById(parentId);

    const isSelected = isItemSelected(recording.id);
    const startingPositionInTimeline = startTime * pixelToSecondRatio;
    const lengthBasedWidth = eventLength * pixelToSecondRatio;
    const canvasOffsetY = timelineState.canvasOffsetY || undefined;

    const groupRef = useRef();
    const elementRef = useRef();
    const [originalZIndex, setOriginalZIndex] = useState(0);

    const { handleMouseEnter, isFocused, restoreZIndex } = useEventFocus(focusedEvent, setFocusedEvent, id);

    const { dynamicColorStops, dynamicShadowBlur, dynamicStroke } = useDynamicStyles(isFocused, isSelected, true);

    const handleDragEnd = useCallback(
        (e) => {
            const newStartTime = e.target.x() / pixelToSecondRatio;

            if (isSelected) {
                updateSelectedItemsStartTime(newStartTime);
            } else
                updateStartTime({
                    eventLength: recording.eventLength,
                    index: recording.id,
                    instrumentName: recording.instrumentName,
                    newStartTime,
                    parent
                });
        },
        [
            isSelected,
            updateSelectedItemsStartTime,
            updateStartTime,
            recording.eventLength,
            recording.id,
            recording.instrumentName,
            parent
        ]
    );

    const { dragBoundFunc, handleDragStart } = useCustomDrag({
        timelineY
    });

    useEffect(() => {
        if (groupRef.current) setOriginalZIndex(groupRef.current.zIndex());
    }, []);

    useEffect(() => {
        if (isFocused && groupRef.current) groupRef.current.moveToTop();
    }, [isFocused, originalZIndex]);

    const handleClick = useCallback(
        (evt) => {
            if (evt.evt.button === 0 && evt.evt.ctrlKey) {
                if (parent && parent.locked) {
                    selectElement(parent);
                    openPanel({ id: SELECTIONS_PANEL_ID });
                } else {
                    selectElement(recording);
                    openPanel({ id: SELECTIONS_PANEL_ID });
                }
            } else if (parent) {
                if (handleClickOverlapGroup) handleClickOverlapGroup();
            } else if (openParamsPanel && !parent) {
                openParamsPanel({
                    index,
                    instrumentName,
                    x: startingPositionInTimeline,
                    y: timelineY + canvasOffsetY + elementRef.current.attrs.height
                });
            }
        },
        [
            parent,
            openParamsPanel,
            recording,
            selectElement,
            openPanel,
            handleClickOverlapGroup,
            index,
            instrumentName,
            startingPositionInTimeline,
            timelineY,
            canvasOffsetY
        ]
    );

    const handleDoubleClick = useCallback(() => playEventInstance(eventInstance), [eventInstance]);
    const onLockSoundEventElement = useCallback(
        () => lockOverlapGroupById({ groupId: id }),
        [id, lockOverlapGroupById]
    );

    // console.log('parent locked');

    console.log(parentId);
    console.log(parent?.locked);

    return (
        <Group
            ref={groupRef}
            key={index}
            x={startingPositionInTimeline}
            draggable={!parent?.locked}
            dragBoundFunc={dragBoundFunc}
            onDragEnd={handleDragEnd}
            onClick={handleClick}
            onDblClick={handleDoubleClick}
            onDragStart={handleDragStart}
        >
            <Rect
                onMouseEnter={handleMouseEnter}
                onMouseLeave={restoreZIndex}
                ref={elementRef}
                x={0}
                y={isFocused ? -4 : 0}
                width={lengthBasedWidth}
                height={timelineHeight * 0.8}
                fillLinearGradientStartPoint={CONSTANTS.GRADIENT_START}
                fillLinearGradientEndPoint={CONSTANTS.GRADIENT_END}
                fillLinearGradientColorStops={dynamicColorStops}
                fill={dynamicStroke}
                strokeWidth={CONSTANTS.STROKE_WIDTH}
                cornerRadius={CONSTANTS.CORNER_RADIUS}
                shadowOffset={CONSTANTS.SHADOW.OFFSET}
                shadowBlur={dynamicShadowBlur}
                shadowOpacity={CONSTANTS.SHADOW.OPACITY}
                opacity={CONSTANTS.TRANSPARENCY_VALUE}
            />
            <Text {...CONSTANTS.TEXT_STYLE} text={name} opacity={CONSTANTS.TRANSPARENCY_VALUE} />

            {!parent && (
                <Text
                    onClick={onLockSoundEventElement}
                    x={-10}
                    y={CONSTANTS.LOCK_OFFSET_Y}
                    text={locked ? '🔒' : '✔️'}
                    fontSize={CONSTANTS.TEXT_FONT_SIZE}
                    fill="white"
                />
            )}
        </Group>
    );
}, isEqual);

SoundEventElement.propTypes = {
    canvasOffsetY: PropTypes.number.isRequired,
    index: PropTypes.number.isRequired,
    isFocused: PropTypes.bool,
    isOverlapping: PropTypes.bool,
    isTargeted: PropTypes.bool,
    openParamsPanel: PropTypes.func,
    parent: PropTypes.object,
    recording: PropTypes.shape({
        eventInstance: PropTypes.object.isRequired,
        eventLength: PropTypes.number.isRequired,
        id: PropTypes.number.isRequired,
        instrumentName: PropTypes.string.isRequired,
        locked: PropTypes.bool,
        name: PropTypes.string.isRequired,
        startTime: PropTypes.number.isRequired
    }).isRequired,
    setFocusedEvent: PropTypes.func.isRequired,
    timelineHeight: PropTypes.number.isRequired,
    timelineY: PropTypes.number.isRequired,
    updateStartTime: PropTypes.func.isRequired
};

SoundEventElement.defaultProps = {
    isFocused: false,
    isOverlapping: false,
    isTargeted: false,
    openParamsPanel: null
};

export default SoundEventElement;

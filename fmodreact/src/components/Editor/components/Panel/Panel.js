import PropTypes from 'prop-types';
import React, { useCallback, useContext } from 'react';
import { playEventInstance } from '../../../../fmodLogic/eventInstanceHelpers';
import { useInstrumentRecordingsOperations } from '../../../../hooks/useInstrumentRecordingsOperations';
import usePlayback from '../../../../hooks/usePlayback';
import { TimelineContext } from '../../../../providers/TimelineProvider';
import EventItemComponent from './EventItem';
import { CloseIcon, DuplicateIcon, FlexContainer, PanelContainer, PlayIcon, TrashIcon } from './Panel.styles';
import TimeControl from './TimeControl';

function useEventHandlers(targetedGroup, setFocusedEvent, onPressX) {
    const { deleteRecording, duplicateOverlapGroup, updateOverlapGroupTimes } = useInstrumentRecordingsOperations();
    const { setNewTimeout } = usePlayback({ playbackStatus: true });

    const handleClose = useCallback(() => onPressX(false), [onPressX]);
    const handlePlayEvent = useCallback((eventInstance) => playEventInstance(eventInstance), []);
    const resetFocusedEvent = useCallback(() => setFocusedEvent(-1), [setFocusedEvent]);
    const deleteOverlapGroup = useCallback(
        () => deleteRecording(targetedGroup, undefined),
        [deleteRecording, targetedGroup]
    );
    const onDuplicateGroup = useCallback(
        () => duplicateOverlapGroup({ overlapGroup: targetedGroup }),
        [duplicateOverlapGroup, targetedGroup]
    );

    return {
        deleteOverlapGroup,
        deleteRecording,
        handleClose,
        handlePlayEvent,
        onDuplicateGroup,
        resetFocusedEvent,
        setNewTimeout,
        updateOverlapGroupTimes
    };
}

function useReplayEvents(events, groupStartTime, setNewTimeout) {
    return useCallback(() => {
        events.forEach((event) => {
            setNewTimeout(() => playEventInstance(event.eventInstance), event.startTime - groupStartTime);
        });
    }, [events, groupStartTime, setNewTimeout]);
}

export const Panel = ({
    focusedEvent,
    onPressX,
    panelRecordings,
    panelState,
    setFocusedEvent,
    targetedGroup,
    updateStartTime,
    x,
    y
}) => {
    const { timelineState } = useContext(TimelineContext);

    const { endTime, id, startTime: groupStartTime, startTime } = targetedGroup || {};

    const {
        deleteOverlapGroup,
        deleteRecording,
        handleClose,
        handlePlayEvent,
        onDuplicateGroup,
        resetFocusedEvent,
        setNewTimeout,
        updateOverlapGroupTimes
    } = useEventHandlers(panelState, setFocusedEvent, onPressX);

    const handleReplayEvents = useReplayEvents(panelRecordings, groupStartTime, setNewTimeout);

    const modifyGroupStartTime = useCallback(
        (delta) => {
            updateOverlapGroupTimes({
                groupId: id,
                newStartTime: startTime + delta
            });
        },
        [id, startTime, updateOverlapGroupTimes]
    );

    const positioningStyle =
        x && y
            ? {
                  backgroundColor: 'green',
                  left: 0,
                  position: 'absolute',
                  top: 0,
                  transform: `translate(${-timelineState.panelCompensationOffset.x + x}px, ${y}px)`
              }
            : {};

    return (
        <PanelContainer onMouseLeave={resetFocusedEvent} x={x} y={y} timelineState={timelineState}>
            <span>Group:</span>
            <FlexContainer>
                {panelRecordings?.length > 1 && (
                    <>
                        <PlayIcon onClick={handleReplayEvents}>▶</PlayIcon>
                        <TrashIcon onClick={deleteOverlapGroup}>🗑️</TrashIcon>
                        <DuplicateIcon onClick={onDuplicateGroup}>Duplicate Group</DuplicateIcon>
                    </>
                )}
                <CloseIcon onClick={handleClose}>X</CloseIcon>
            </FlexContainer>

            <TimeControl endTime={endTime} startTime={startTime} onModifyStartTime={modifyGroupStartTime} />

            <span>{panelRecordings.length} Events:</span>
            <FlexContainer>
                {panelRecordings?.map((event) => (
                    <EventItemComponent
                        key={event.id}
                        overlapGroup={targetedGroup}
                        event={event}
                        // eslint-disable-next-line no-undef, react-perf/jsx-no-new-function-as-prop
                        onDelete={() => deleteRecording(event, targetedGroup)}
                        setFocusedEvent={setFocusedEvent}
                        focusedEvent={focusedEvent}
                        onPlay={handlePlayEvent}
                        onClose={handleClose}
                        updateStartTime={updateStartTime}
                    />
                ))}
            </FlexContainer>
        </PanelContainer>
    );
};

Panel.propTypes = {
    focusedEvent: PropTypes.number, // Assuming focusedEvent is a number. Use PropTypes.string if it's a string.
    onPressX: PropTypes.func.isRequired,
    panelRecordings: PropTypes.arrayOf(
        PropTypes.shape({
            endTime: PropTypes.number.isRequired,
            eventInstance: PropTypes.object.isRequired,
            id: PropTypes.any.isRequired, // Consider using PropTypes.number or PropTypes.string if the type is known
            startTime: PropTypes.number.isRequired
        })
    ).isRequired,
    // Assuming panelState is not directly used as a prop and thus removed from PropTypes
    setFocusedEvent: PropTypes.func.isRequired,
    targetedGroup: PropTypes.shape({
        endTime: PropTypes.number,
        id: PropTypes.any.isRequired, // Again, consider using PropTypes.number or PropTypes.string
        startTime: PropTypes.number.isRequired
        // If there are more properties used from targetedGroup, define them here
    }),
    updateStartTime: PropTypes.func.isRequired,
    x: PropTypes.number,
    y: PropTypes.number
};

Panel.defaultProps = {
    focusedEvent: null,
    targetedGroup: null,
    x: undefined,
    y: undefined
};

export default Panel;

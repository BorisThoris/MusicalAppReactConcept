import PropTypes from 'prop-types';
import React, { useCallback, useContext } from 'react';
import { playEventInstance } from '../../../../fmodLogic/eventInstanceHelpers';
import pixelToSecondRatio from '../../../../globalConstants/pixelToSeconds';
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

export const Panel = ({ focusedEvent, onPressX, panelState, recordings, setFocusedEvent, updateStartTime, x, y }) => {
    const { timelineState } = useContext(TimelineContext);
    const { index: targetIndex, instrumentName: targetInstrumentGroup } = panelState;

    const targetInRecordings = recordings[targetInstrumentGroup][targetIndex];

    const { endTime, id, startTime: groupStartTime, startTime } = targetInRecordings || {};

    const targetEvents = targetInRecordings?.events;

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

    const handleReplayEvents = useReplayEvents(targetEvents, groupStartTime, setNewTimeout);

    const modifyGroupStartTime = useCallback(
        (delta) => {
            updateOverlapGroupTimes({
                groupId: id,
                newStartTime: startTime + delta
            });
        },
        [id, startTime, updateOverlapGroupTimes]
    );

    if (targetInRecordings)
        return (
            <PanelContainer
                onMouseLeave={resetFocusedEvent}
                x={targetInRecordings.startTime * pixelToSecondRatio}
                y={y}
                timelineState={timelineState}
            >
                <span>Group:</span>
                <FlexContainer>
                    {targetEvents?.length > 1 && (
                        <>
                            <PlayIcon onClick={handleReplayEvents}>▶</PlayIcon>
                            <TrashIcon onClick={deleteOverlapGroup}>🗑️</TrashIcon>
                            <DuplicateIcon onClick={onDuplicateGroup}>Duplicate Group</DuplicateIcon>
                        </>
                    )}
                    <CloseIcon onClick={handleClose}>X</CloseIcon>
                </FlexContainer>

                <TimeControl endTime={endTime} startTime={startTime} onModifyStartTime={modifyGroupStartTime} />

                <span>{targetEvents.length} Events:</span>
                <FlexContainer>
                    {targetEvents?.map((event) => (
                        <EventItemComponent
                            key={event.id}
                            overlapGroup={targetInRecordings}
                            event={event}
                            // eslint-disable-next-line no-undef, react-perf/jsx-no-new-function-as-prop
                            onDelete={() => deleteRecording(event, targetInRecordings)}
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
    return null;
};

Panel.propTypes = {
    focusedEvent: PropTypes.number, // Assuming focusedEvent is a number. Use PropTypes.string if it's a string.
    onPressX: PropTypes.func.isRequired,
    // Assuming panelState is not directly used as a prop and thus removed from PropTypes
    setFocusedEvent: PropTypes.func.isRequired,
    targetedGroup: PropTypes.shape({
        endTime: PropTypes.number,
        id: PropTypes.any.isRequired, // Again, consider using PropTypes.number or PropTypes.string
        startTime: PropTypes.number.isRequired
        // If there are more properties used from targetedGroup, define them here
    }),
    targetEvents: PropTypes.arrayOf(
        PropTypes.shape({
            endTime: PropTypes.number.isRequired,
            eventInstance: PropTypes.object.isRequired,
            id: PropTypes.any.isRequired, // Consider using PropTypes.number or PropTypes.string if the type is known
            startTime: PropTypes.number.isRequired
        })
    ).isRequired,
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

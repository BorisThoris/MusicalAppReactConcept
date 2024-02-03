import PropTypes from 'prop-types';
import React, { useCallback } from 'react';
import { playEventInstance } from '../../../../fmodLogic/eventInstanceHelpers';
import { useInstrumentRecordingsOperations } from '../../../../hooks/useInstrumentRecordingsOperations';
import usePlayback from '../../../../hooks/usePlayback';
import EventItemComponent from './EventItem';
import { CloseIcon, DuplicateIcon, FlexContainer, PlayIcon, TrashIcon } from './Panel.styles';

const Panel = ({ focusedEvent, onDeleteGroup, onPressX, panelState, setFocusedEvent, updateStartTime }) => {
    // eslint-disable-next-line max-len
    const { deleteRecording, duplicateOverlapGroup } = useInstrumentRecordingsOperations();

    const { setNewTimeout } = usePlayback({ playbackStatus: true });
    const { events, id, startTime: groupStartTime } = panelState.overlapGroup;

    const handleClose = useCallback(() => onPressX(false), [onPressX]);

    const handlePlayEvent = useCallback((eventInstance) => playEventInstance(eventInstance), []);

    console.log('lol');

    const handleReplayEvents = useCallback(() => {
        events.forEach((event) => {
            setNewTimeout(() => playEventInstance(event.eventInstance), event.startTime - groupStartTime);
        });
    }, [events, groupStartTime, setNewTimeout]);

    const deleteOverlapGroup = useCallback(
        () => deleteRecording(panelState.overlapGroup, undefined),
        [deleteRecording, panelState.overlapGroup]
    );

    const isMultipleEvents = events.length > 1;

    const resetFocusedEvent = useCallback(() => setFocusedEvent(-1), [setFocusedEvent]);

    const onDuplicateGroup = useCallback(
        () =>
            duplicateOverlapGroup({
                overlapGroup: panelState.overlapGroup
            }),
        [duplicateOverlapGroup, panelState.overlapGroup]
    );

    const deleteNote = useCallback(
        ({ event, parent }) => {
            deleteRecording(event, parent);
        },
        [deleteRecording]
    );

    return (
        <div onMouseLeave={resetFocusedEvent}>
            <span>Group:</span>
            <FlexContainer>
                {isMultipleEvents && (
                    <>
                        <PlayIcon onClick={handleReplayEvents}>▶</PlayIcon>
                        <TrashIcon onClick={deleteOverlapGroup}>🗑️</TrashIcon>
                        <DuplicateIcon onClick={onDuplicateGroup}>Duplicate Group</DuplicateIcon>
                    </>
                )}
                <CloseIcon onClick={handleClose}>X</CloseIcon>
            </FlexContainer>
            <FlexContainer>
                {events.map((event) => (
                    <EventItemComponent
                        key={event.id}
                        overlapGroup={panelState.overlapGroup}
                        event={event}
                        onDelete={deleteNote}
                        setFocusedEvent={setFocusedEvent}
                        focusedEvent={focusedEvent}
                        onPlay={handlePlayEvent}
                        onClose={handleClose}
                        updateStartTime={updateStartTime}
                    />
                ))}
            </FlexContainer>
        </div>
    );
};

Panel.propTypes = {
    onDelete: PropTypes.func.isRequired,
    onDeleteGroup: PropTypes.func.isRequired,
    onPressX: PropTypes.func.isRequired,
    panelState: PropTypes.shape({
        overlapGroup: PropTypes.shape({
            events: PropTypes.arrayOf(
                PropTypes.shape({
                    endTime: PropTypes.number.isRequired,
                    eventInstance: PropTypes.object.isRequired,
                    id: PropTypes.any.isRequired,
                    startTime: PropTypes.number.isRequired
                })
            ).isRequired,
            id: PropTypes.any.isRequired,
            startTime: PropTypes.number.isRequired
        }).isRequired,
        recording: PropTypes.object
    }).isRequired,
    setFocusedEvent: PropTypes.func.isRequired,
    updateStartTime: PropTypes.func.isRequired
};

export default Panel;

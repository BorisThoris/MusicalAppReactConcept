import PropTypes from 'prop-types';
import React, { useCallback } from 'react';
import { playEventInstance } from '../../../../fmodLogic/eventInstanceHelpers';
import usePlayback from '../../../../hooks/usePlayback';
import EventItemComponent from './EventItem';
import { CloseIcon, FlexContainer, PlayIcon, TrashIcon } from './Panel.styles';

const Panel = ({
    focusedEvent,
    onDelete,
    onDeleteGroup,
    onPressX,
    panelState,
    setFocusedEvent,
    updateStartTime,
}) => {
    const { setNewTimeout } = usePlayback({ playbackStatus: true });
    const { events, id, startTime: groupStartTime } = panelState.overlapGroup;

    console.log(focusedEvent);
    console.log(id);

    const handleClose = useCallback(() => onPressX(false), [onPressX]);

    const handlePlayEvent = useCallback((eventInstance) => {
        playEventInstance(eventInstance);
    }, []);

    const handleReplayEvents = useCallback(() => {
        events.forEach((event) => {
            setNewTimeout(
                () => playEventInstance(event.eventInstance),
                event.startTime - groupStartTime
            );
        });
    }, [events, groupStartTime, setNewTimeout]);

    const deleteOverlapGroup = useCallback(() => {
        onDeleteGroup(id);
    }, [id, onDeleteGroup]);

    const isMultipleEvents = events.length > 1;

    const resetFocusedEvent = useCallback(() => {
        setFocusedEvent(0);
    }, [setFocusedEvent]);

    return (
        <div
            onMouseLeave={resetFocusedEvent}
            style={{
                backgroundColor: focusedEvent === id ? 'red' : 'transparent',
            }}
        >
            <span>Group:</span>
            <FlexContainer>
                {isMultipleEvents && (
                    <>
                        <PlayIcon onClick={handleReplayEvents}>▶</PlayIcon>
                        <TrashIcon onClick={deleteOverlapGroup}>🗑️</TrashIcon>
                    </>
                )}
                <CloseIcon onClick={handleClose}>X</CloseIcon>
            </FlexContainer>
            <FlexContainer>
                {events.map((event) => (
                    <EventItemComponent
                        key={event.id}
                        event={event}
                        onDelete={onDelete}
                        setFocusedEvent={setFocusedEvent}
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
                    startTime: PropTypes.number.isRequired,
                })
            ).isRequired,
            id: PropTypes.any.isRequired,
            startTime: PropTypes.number.isRequired,
        }).isRequired,
        recording: PropTypes.object,
    }).isRequired,
    setFocusedEvent: PropTypes.func.isRequired,
    updateStartTime: PropTypes.func.isRequired,
};

export default Panel;

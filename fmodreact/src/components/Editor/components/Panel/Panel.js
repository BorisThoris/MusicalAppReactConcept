import PropTypes from 'prop-types';
import React, { useCallback } from 'react';
import { playEventInstance } from '../../../../fmodLogic/eventInstanceHelpers';
import usePlayback from '../../../../hooks/usePlayback';
import EventItemComponent from './EventItem';
import { CloseIcon, PlayIcon } from './Panel.styles';

const Panel = ({ onDelete, onPressX, panelState }) => {
    const { setNewTimeout } = usePlayback({ playbackStatus: true });
    const { events, startTime: groupStartTime } = panelState.overlapGroup;

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

    return (
        <div>
            <span>Group:</span>

            <div style={{ display: 'flex' }}>
                {events.length > 1 && (
                    <PlayIcon onClick={handleReplayEvents}>▶</PlayIcon>
                )}

                <CloseIcon onClick={handleClose}>X</CloseIcon>
            </div>

            <div style={{ display: 'flex' }}>
                {events.map((event) => (
                    <EventItemComponent
                        key={event.id}
                        event={event}
                        onDelete={onDelete}
                        onPlay={handlePlayEvent}
                        onClose={handleClose}
                    />
                ))}
            </div>
        </div>
    );
};

Panel.propTypes = {
    onDelete: PropTypes.func.isRequired,
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
        }).isRequired,
        recording: PropTypes.object,
    }).isRequired,
};

export default Panel;

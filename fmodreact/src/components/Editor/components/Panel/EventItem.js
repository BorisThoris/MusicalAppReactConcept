import PropTypes from 'prop-types';
import React, { useCallback } from 'react';
import { getEventInstanceParamaters } from '../../../../fmodLogic/eventInstanceHelpers';
import ParameterControlComponent from '../ParameterControl/ParameterControl';
import { Header, PlayIcon, TimeMarker, TrashIcon } from './Panel.styles';

const EventItem = ({ event, onDelete, onPlay }) => {
    const params = getEventInstanceParamaters(event.eventInstance);

    const handleDelete = useCallback(
        () => onDelete(event.id),
        [onDelete, event.id]
    );
    const handlePlay = useCallback(
        () => onPlay(event.eventInstance),
        [onPlay, event.eventInstance]
    );

    return (
        <div>
            <Header>
                <PlayIcon onClick={handlePlay}>▶</PlayIcon>
                <TrashIcon onClick={handleDelete}>🗑️</TrashIcon>
            </Header>

            <TimeMarker>
                <span>START</span>
                <div>
                    <div>Start: {event.startTime}</div>
                    <div>End: {event.endTime}</div>
                </div>
            </TimeMarker>

            {params.map((param) => (
                <ParameterControlComponent
                    key={param.name}
                    param={param}
                    eventInstance={event.eventInstance}
                />
            ))}
        </div>
    );
};

EventItem.propTypes = {
    event: PropTypes.object.isRequired,
    onClose: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
    onPlay: PropTypes.func.isRequired,
};

export default EventItem;

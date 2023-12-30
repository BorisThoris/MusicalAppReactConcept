import PropTypes from 'prop-types';
import React, { useCallback, useMemo } from 'react';
import { getEventInstanceParamaters } from '../../../../fmodLogic/eventInstanceHelpers';
import instrumentRecordingOperationsHook from '../../../../hooks/useInstrumentRecordingsOperations';
import ParameterControlComponent from '../ParameterControl/ParameterControl';
import EventHeaderComponent from './EventHeader';
import TimeControlComponent from './TimeControl';

const EventItem = ({
    event,
    focusedEvent,
    onDelete,
    onPlay,
    setFocusedEvent,
    updateStartTime,
}) => {
    const {
        endTime,
        eventInstance,
        eventLength,
        id,
        instrumentName,
        params,
        startTime,
    } = event;

    const { duplicateEventInstance } = instrumentRecordingOperationsHook();

    const handleDelete = useCallback(() => onDelete(id), [onDelete, id]);

    const handleDuplicate = useCallback(() => {
        duplicateEventInstance(event);
    }, [duplicateEventInstance, event]);

    const handlePlay = useCallback(
        () => onPlay(eventInstance),
        [onPlay, eventInstance]
    );
    const focusEvent = useCallback(() => {
        setFocusedEvent(id);
    }, [id, setFocusedEvent]);

    const modifyStartTime = useCallback(
        (delta) => {
            updateStartTime({
                eventLength,
                index: id,
                instrumentName,
                newStartTime: startTime + delta,
            });
        },
        [eventLength, id, instrumentName, startTime, updateStartTime]
    );

    return (
        <div
            onMouseEnter={focusEvent}
            style={{
                backgroundColor: focusedEvent === id ? 'red' : 'transparent',
            }}
        >
            <EventHeaderComponent
                onPlay={handlePlay}
                onDelete={handleDelete}
                onDuplicate={handleDuplicate}
            />

            <TimeControlComponent
                startTime={startTime}
                endTime={endTime}
                onModifyStartTime={modifyStartTime}
            />

            {params.map((param) => (
                <ParameterControlComponent
                    key={param.name}
                    param={param}
                    eventId={id}
                    eventInstance={eventInstance}
                />
            ))}
        </div>
    );
};

EventItem.propTypes = {
    event: PropTypes.shape({
        endTime: PropTypes.number,
        eventInstance: PropTypes.object,
        eventLength: PropTypes.number,
        id: PropTypes.number,
        instrumentName: PropTypes.string,
        startTime: PropTypes.number,
    }).isRequired,
    onDelete: PropTypes.func.isRequired,
    onPlay: PropTypes.func.isRequired,
    setFocusedEvent: PropTypes.func.isRequired,
    updateStartTime: PropTypes.func.isRequired,
};

export default EventItem;

import PropTypes from 'prop-types';
import React, { useCallback, useContext } from 'react';
import instrumentRecordingOperationsHook, {
    useInstrumentRecordingsOperations
} from '../../../../hooks/useInstrumentRecordingsOperations';
import { PanelContext } from '../../../../hooks/usePanelState';
import ParameterControlComponent from '../ParameterControl/ParameterControl';
import EventHeaderComponent from './EventHeader';
import TimeControl from './TimeControl';

export const EventItem = ({ event, onDelete, onPlay, overlapGroup }) => {
    const { focusedEvent, setFocusedEvent } = useContext(PanelContext);
    const { updateRecording: updateStartTime } = useInstrumentRecordingsOperations();
    const { duplicateEventInstance } = instrumentRecordingOperationsHook();

    const { endTime, eventInstance, eventLength, id, instrumentName, params, startTime } = event;

    const handleDelete = useCallback(() => {
        onDelete({ event, parent: overlapGroup });
    }, [onDelete, event, overlapGroup]);

    const handleDuplicate = useCallback(() => {
        duplicateEventInstance(event);
    }, [duplicateEventInstance, event]);

    const handlePlay = useCallback(() => onPlay(eventInstance), [onPlay, eventInstance]);
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
                parent: overlapGroup
            });
        },
        [eventLength, id, instrumentName, overlapGroup, startTime, updateStartTime]
    );

    return (
        <div
            onMouseEnter={focusEvent}
            style={{
                backgroundColor: focusedEvent === id ? 'red' : 'transparent',
                display: 'flex',
                flexDirection: 'column'
            }}
        >
            <EventHeaderComponent onPlay={handlePlay} onDelete={handleDelete} onDuplicate={handleDuplicate} />

            <TimeControl startTime={startTime} endTime={endTime} onModifyStartTime={modifyStartTime} />

            {params.map((param) => (
                <ParameterControlComponent
                    key={param.name}
                    param={param}
                    overlapGroup={overlapGroup}
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
        startTime: PropTypes.number
    }).isRequired,
    onDelete: PropTypes.func.isRequired,
    onPlay: PropTypes.func.isRequired,
    setFocusedEvent: PropTypes.func.isRequired,
    updateStartTime: PropTypes.func.isRequired
};

export default EventItem;

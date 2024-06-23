import PropTypes from 'prop-types';
import React, { useCallback, useContext } from 'react';
import instrumentRecordingOperationsHook, {
    useInstrumentRecordingsOperations
} from '../../../../hooks/useInstrumentRecordingsOperations';
import { PanelContext } from '../../../../hooks/usePanelState';
import { SelectionContext } from '../../../../providers/SelectionsProvider';
import ParameterControlComponent from '../ParameterControl/ParameterControl';
import EventHeaderComponent from './EventHeader';
import TimeControl from './TimeControl';

export const EventItem = ({ event, onDelete, onPlay, overlapGroup }) => {
    const { focusedEvent, setFocusedEvent } = useContext(PanelContext);
    const { getEventById, updateRecording: updateStartTime } = useInstrumentRecordingsOperations();
    const { duplicateOverlapGroup } = instrumentRecordingOperationsHook();

    const { isItemSelected, toggleItem } = useContext(SelectionContext);

    const { endTime, eventInstance, id, locked, params, parentId, startTime } = event;
    const isSelected = isItemSelected(id);

    const parent = getEventById(parentId);

    const handleDelete = useCallback(() => {
        onDelete({ event, parent: overlapGroup });
    }, [onDelete, event, overlapGroup]);

    const handleDuplicate = useCallback(() => {
        duplicateOverlapGroup({
            overlapGroup: event
        });
    }, [duplicateOverlapGroup, event]);

    const handlePlay = useCallback(() => onPlay(eventInstance), [onPlay, eventInstance]);

    const focusEvent = useCallback(() => {
        setFocusedEvent(id);
    }, [id, setFocusedEvent]);

    const modifyStartTime = useCallback(
        (delta) => {
            updateStartTime({
                newStartTime: startTime + delta,
                recording: event
            });
        },
        [event, startTime, updateStartTime]
    );

    const onItemSelect = useCallback(() => {
        toggleItem(event);
    }, [event, toggleItem]);

    const isGroupNotLocked = (parent && !parent.locked) || (!parentId && !locked);

    return (
        <div
            onMouseEnter={focusEvent}
            style={{
                backgroundColor: focusedEvent === id ? 'red' : 'transparent',
                display: 'flex',
                flexDirection: 'column'
            }}
        >
            {isGroupNotLocked && isSelected && <button onClick={onItemSelect}>{'Unselect'}</button>}

            <EventHeaderComponent
                onPlay={handlePlay}
                onDelete={handleDelete}
                onDuplicate={handleDuplicate}
                isSelected={isSelected}
            />

            {isGroupNotLocked && (
                // eslint-disable-next-line prettier/prettier
                <TimeControl startTime={startTime} endTime={endTime} onModifyStartTime={modifyStartTime} />
            )}

            {params.map((param) => (
                <ParameterControlComponent key={param.name} param={param} event={event} />
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

import PropTypes from 'prop-types';
import React, { useCallback, useContext } from 'react';
import styled from 'styled-components';
import instrumentRecordingOperationsHook, {
    useInstrumentRecordingsOperations
} from '../../../../hooks/useInstrumentRecordingsOperations';
import { PanelContext } from '../../../../hooks/usePanelState';
import { SelectionContext } from '../../../../providers/SelectionsProvider';
import ParameterControlComponent from '../ParameterControl/ParameterControl';
import EventHeaderComponent from './EventHeader';
import TimeControl from './TimeControl';

const EventItemContainer = styled.div`
    display: flex;
    flex-direction: column;

    background-color: ${(props) => (props.focused ? '#ffcccb' : 'transparent')};
    border-radius: 8px;
    border: 1px solid #ddd;

    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const UnselectButton = styled.button`
    background-color: #f5f5f5;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    &:hover {
        background-color: #e0e0e0;
    }
`;

export const EventItem = ({ event, onDelete, onPlay, overlapGroup }) => {
    const { focusedEvent, setFocusedEvent } = useContext(PanelContext);
    const { getEventById, updateRecording: updateStartTime } = useInstrumentRecordingsOperations();
    const { duplicateOverlapGroup } = instrumentRecordingOperationsHook();
    const { isItemSelected, toggleItem } = useContext(SelectionContext);

    console.log('yoooooo');

    const { endTime, eventInstance, id, locked, params, parentId, startTime } = event;
    const isSelected = isItemSelected(id);
    const parent = getEventById(parentId);

    const handleDelete = useCallback(() => onDelete({ event, parent: overlapGroup }), [onDelete, event, overlapGroup]);
    const handleDuplicate = useCallback(
        () => duplicateOverlapGroup({ overlapGroup: event }),
        [duplicateOverlapGroup, event]
    );
    const handlePlay = useCallback(() => onPlay(eventInstance), [onPlay, eventInstance]);
    const focusEvent = useCallback(() => setFocusedEvent(id), [id, setFocusedEvent]);
    const modifyStartTime = useCallback(
        (delta) => updateStartTime({ newStartTime: startTime + delta, recording: event }),
        [event, startTime, updateStartTime]
    );
    const onItemSelect = useCallback(() => toggleItem(event), [event, toggleItem]);

    const isGroupNotLocked = (parent && !parent.locked) || (!parentId && !locked);

    return (
        <EventItemContainer focused={focusedEvent === id} onMouseEnter={focusEvent}>
            {isGroupNotLocked && isSelected && <UnselectButton onClick={onItemSelect}>Unselect</UnselectButton>}

            <EventHeaderComponent
                onPlay={handlePlay}
                onDelete={handleDelete}
                onDuplicate={handleDuplicate}
                isSelected={isSelected}
            />

            {isGroupNotLocked && (
                <TimeControl startTime={startTime} endTime={endTime} onModifyStartTime={modifyStartTime} />
            )}

            {params.map((param) => (
                <ParameterControlComponent key={param.name} param={param} event={event} />
            ))}
        </EventItemContainer>
    );
};

EventItem.propTypes = {
    event: PropTypes.shape({
        children: PropTypes.array,
        endTime: PropTypes.number,
        eventInstance: PropTypes.object,
        eventLength: PropTypes.number,
        id: PropTypes.number,
        instrumentName: PropTypes.string,
        locked: PropTypes.bool,
        params: PropTypes.array,
        parentId: PropTypes.number,
        startTime: PropTypes.number
    }).isRequired,
    onDelete: PropTypes.func.isRequired,
    onPlay: PropTypes.func.isRequired,
    overlapGroup: PropTypes.object
};

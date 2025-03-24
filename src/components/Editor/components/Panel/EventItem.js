import PropTypes from 'prop-types';
import React, { useCallback, useContext } from 'react';
import styled from 'styled-components';
import { useInstrumentRecordingsOperations } from '../../../../hooks/useInstrumentRecordingsOperations';
import { PanelContext } from '../../../../hooks/usePanelState';
import { CollisionsContext } from '../../../../providers/CollisionsProvider/CollisionsProvider';
import { SelectionContext } from '../../../../providers/SelectionsProvider';
import ParameterControlComponent from '../ParameterControl/ParameterControl';
import { EventHeader } from './EventHeader';
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

export const EventItem = ({ event, onDelete, onModifyStartTime, onPlay }) => {
    // Destructure event properties
    const { endTime, eventInstance, id, locked, params, parentId, startTime } = event;
    const { copyEvents } = useContext(CollisionsContext);

    const { focusedEvent, setFocusedEvent } = useContext(PanelContext);
    const { getEventById } = useInstrumentRecordingsOperations();
    const { isItemSelected, toggleItem } = useContext(SelectionContext);

    const isSelected = isItemSelected(id);
    const parent = getEventById(parentId);
    const isGroupNotLocked = (parent && !parent.locked) || (!parentId && !locked);

    const focusEvent = useCallback(() => setFocusedEvent(id), [id, setFocusedEvent]);

    const handleDelete = useCallback(() => {
        onDelete({ event });
    }, [event, onDelete]);

    const handlePlay = useCallback(() => {
        onPlay(eventInstance);
    }, [onPlay, eventInstance]);

    const handleModifyStartTime = useCallback(
        (value) => {
            onModifyStartTime({ ...value, id });
        },
        [id, onModifyStartTime]
    );

    const handleCopy = useCallback(() => {
        copyEvents(event);
    }, [copyEvents, event]);

    const handleItemSelect = useCallback(() => {
        toggleItem(event);
    }, [event, toggleItem]);

    return (
        <EventItemContainer focused={focusedEvent === id} onMouseEnter={focusEvent}>
            {isGroupNotLocked && isSelected && <UnselectButton onClick={handleItemSelect}>Unselect</UnselectButton>}

            <EventHeader onPlay={handlePlay} onDelete={handleDelete} onCopy={handleCopy} />

            {isGroupNotLocked && (
                <TimeControl startTime={startTime} endTime={endTime} onModifyStartTime={handleModifyStartTime} />
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
    onModifyStartTime: PropTypes.func.isRequired,
    onPlay: PropTypes.func.isRequired,
    overlapGroup: PropTypes.object
};

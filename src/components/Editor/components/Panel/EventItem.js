import PropTypes from 'prop-types';
import React, { useCallback, useContext } from 'react';
import styled from 'styled-components';
import { playEventInstance } from '../../../../fmodLogic/eventInstanceHelpers';
import { useInstrumentRecordingsOperations } from '../../../../hooks/useInstrumentRecordingsOperations';
import { PanelContext } from '../../../../hooks/usePanelState';
import { CollisionsContext } from '../../../../providers/CollisionsProvider/CollisionsProvider';
import { usePixelRatio } from '../../../../providers/PixelRatioProvider/PixelRatioProvider';
import { SelectionContext } from '../../../../providers/SelectionsProvider';
import ParameterControlComponent from '../ParameterControl/ParameterControl';
import { EventHeader } from './EventHeader';
import { updateElementStartTime } from './recordingHelpers';
import TimeControl from './TimeControl';

const EventItemContainer = styled.div`
    display: flex;
    flex-direction: column;
    background-color: ${({ focused }) => (focused ? '#ffcccb' : 'transparent')};
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

export const EventItem = ({ event }) => {
    const pixelToSecondRatio = usePixelRatio();
    const { copyEvents, stageRef } = useContext(CollisionsContext);
    const { focusedEvent, setFocusedEvent } = useContext(PanelContext);
    const { getElementParentOverlapGroup } = useInstrumentRecordingsOperations();
    const { deleteSelections, isItemSelected, unselectItem } = useContext(SelectionContext);

    const { element, endTime, eventInstance, id, locked, params, startTime } = event;

    const parent = getElementParentOverlapGroup(element);
    const isSelected = isItemSelected(id);

    const parentLocked = parent && parent.locked;
    const isGroupNotLocked = !parentLocked && !locked;

    const handleDelete = useCallback(() => {
        element.destroy();
        deleteSelections(event);
        stageRef?.findOne('.top-layer')?.batchDraw();
    }, [element, deleteSelections, event, stageRef]);

    const handleModifyStartTime = useCallback(
        ({ delta }) => updateElementStartTime({ delta, element, pixelToSecondRatio }),
        [element, pixelToSecondRatio]
    );

    const focusEvent = useCallback(() => setFocusedEvent(id), [id, setFocusedEvent]);

    const handlePlay = useCallback(() => playEventInstance(eventInstance), [eventInstance]);

    const handleCopy = useCallback(() => copyEvents(event), [copyEvents, event]);

    const handleUnselect = useCallback(() => unselectItem(event), [unselectItem, event]);

    return (
        <EventItemContainer focused={focusedEvent === id} onMouseEnter={focusEvent}>
            {isGroupNotLocked && isSelected && <UnselectButton onClick={handleUnselect}>Unselect</UnselectButton>}

            <EventHeader onPlay={handlePlay} onDelete={handleDelete} onCopy={handleCopy} />

            {isGroupNotLocked && (
                <TimeControl startTime={startTime} endTime={endTime} onModifyStartTime={handleModifyStartTime} />
            )}

            {params?.map((param) => (
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
    }).isRequired
};

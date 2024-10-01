/* eslint-disable react-perf/jsx-no-new-function-as-prop */
import PropTypes from 'prop-types';
import React from 'react';
import styled from 'styled-components';
import { useInstrumentRecordingsOperations } from '../../../../hooks/useInstrumentRecordingsOperations';
import { EventHeader } from '../Panel/EventHeader';
import { EventItem } from '../Panel/EventItem';
import TimeControl from '../Panel/TimeControl';

// Styled components
const EventContainer = styled.div`
    border: 1px solid #ccc;
    margin: 8px;
    padding: 5px;
    border-radius: 8px;
    background-color: #f9f9f9;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

// Recursive function to render event items
const renderEventItems = ({
    deleteOverlapGroup,
    duplicateMultipleOverlapGroups,
    duplicateOverlapGroup,
    onClose,
    onDeleteRecording,
    onPlayEvent,
    selectedValues,
    updateOverlapGroupTimes
}) => {
    return selectedValues.map((event, index) => {
        const { children, endTime, eventInstance, id, startTime } = event;
        const isGroup = children.length > 0;
        const onlyChildren = !id;

        const modifyStartTime = (delta) => updateOverlapGroupTimes({ groupId: id, newStartTime: startTime + delta });
        const onDeleteGroup = () => deleteOverlapGroup(event);
        const onDuplicateGroup = () => duplicateOverlapGroup({ overlapGroup: event });

        const onDelete = () => onDeleteRecording(event);
        const onPlay = () => onPlayEvent(eventInstance);

        // Ensure the key is unique
        const uniqueKey = id || `${eventInstance}-${startTime}-${endTime}-${index}`;

        return (
            <EventContainer key={uniqueKey}>
                {isGroup && !onlyChildren && <button>unselected group</button>}

                {isGroup && !onlyChildren && (
                    <>
                        <TimeControl startTime={startTime} endTime={endTime} onModifyStartTime={modifyStartTime} />
                        <EventHeader
                            onPlay={() => {}}
                            onDelete={onDeleteGroup}
                            onDuplicate={onDuplicateGroup}
                            isSelected={() => {}}
                        />
                    </>
                )}

                {!onlyChildren && <EventItem event={event} onDelete={onDelete} onPlay={onPlay} onClose={onClose} />}
                {isGroup &&
                    renderEventItems({
                        deleteOverlapGroup,
                        duplicateMultipleOverlapGroups,
                        duplicateOverlapGroup,
                        onClose,
                        onDeleteRecording,
                        onPlayEvent,
                        selectedValues: children,
                        updateOverlapGroupTimes
                    })}
            </EventContainer>
        );
    });
};

// Component to display selected events list
export const SelectedEventsList = ({ onClose, onDeleteRecording, onPlayEvent, selectedValues }) => {
    const { deleteOverlapGroup, duplicateMultipleOverlapGroups, duplicateOverlapGroup, updateOverlapGroupTimes } =
        useInstrumentRecordingsOperations();

    return (
        <>
            {renderEventItems({
                deleteOverlapGroup,
                duplicateMultipleOverlapGroups,
                duplicateOverlapGroup,
                onClose,
                onDeleteRecording,
                onPlayEvent,
                selectedValues,
                updateOverlapGroupTimes
            })}
        </>
    );
};

SelectedEventsList.propTypes = {
    onClose: PropTypes.func.isRequired,
    onDeleteRecording: PropTypes.func.isRequired,
    onPlayEvent: PropTypes.func.isRequired,
    selectedValues: PropTypes.arrayOf(
        PropTypes.shape({
            children: PropTypes.array.isRequired,
            endTime: PropTypes.number.isRequired,
            eventInstance: PropTypes.string.isRequired,
            id: PropTypes.string,
            startTime: PropTypes.number.isRequired
        })
    ).isRequired
};

export default React.memo(SelectedEventsList);

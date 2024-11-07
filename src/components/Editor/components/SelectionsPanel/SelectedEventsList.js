/* eslint-disable react-perf/jsx-no-new-function-as-prop */
import PropTypes from 'prop-types';
import React from 'react';
import styled from 'styled-components';
import { EventItem } from '../Panel/EventItem';

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

// Component to display selected events list
export const SelectedEventsList = ({ onClose, onDeleteRecording, onModifyStartTime, onPlayEvent, selectedValues }) => {
    return selectedValues.map((event, index) => {
        const { endTime, eventInstance, id, startTime } = event;

        const onDelete = () => onDeleteRecording(event);
        const onPlay = () => onPlayEvent(eventInstance);

        // Ensure the key is unique
        const uniqueKey = id || `${eventInstance}-${startTime}-${endTime}-${index}`;

        return (
            <EventContainer key={uniqueKey}>
                <EventItem
                    event={event}
                    onDelete={onDelete}
                    onPlay={onPlay}
                    onClose={onClose}
                    onModifyStartTime={onModifyStartTime}
                />
            </EventContainer>
        );
    });
};

SelectedEventsList.propTypes = {
    onClose: PropTypes.func.isRequired,
    onDeleteRecording: PropTypes.func.isRequired,
    onModifyStartTime: PropTypes.func.isRequired,
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

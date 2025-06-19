/* eslint-disable react-perf/jsx-no-new-function-as-prop */
import PropTypes from 'prop-types';
import React from 'react';
import styled from 'styled-components';
import { EventItem } from '../Panel/EventItem';
import GroupItem from '../Panel/GroupItem';

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
export const SelectedEventsList = ({ selectedValues }) =>
    selectedValues.map((event, index) => {
        const { elements, endTime, eventInstance, id, startTime } = event;

        // Ensure the key is unique
        const uniqueKey = id || `${eventInstance}-${startTime}-${endTime}-${index}`;

        if (elements) {
            return <GroupItem event={event} key={uniqueKey} />;
        }

        return (
            <EventContainer key={uniqueKey}>
                <EventItem event={event} />
            </EventContainer>
        );
    });

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

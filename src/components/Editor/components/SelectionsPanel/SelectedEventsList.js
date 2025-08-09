/* eslint-disable react-perf/jsx-no-new-function-as-prop */
import PropTypes from 'prop-types';
import React from 'react';
import styled from 'styled-components';
import { EventItem } from '../Panel/EventItem';
import GroupItem from '../Panel/GroupItem';

// Styled components
const EventContainer = styled.div`
    border: 1px solid ${({ theme }) => theme.colors.semantic.border.primary};
    margin: ${({ theme }) => theme.spacing[2]};
    padding: ${({ theme }) => theme.spacing[1]};
    border-radius: ${({ theme }) => theme.borderRadius.lg};
    background-color: ${({ theme }) => theme.colors.semantic.surface.primary};
    box-shadow: ${({ theme }) => theme.shadows.sm};
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

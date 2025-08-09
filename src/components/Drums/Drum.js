import PropTypes from 'prop-types';
import React, { useCallback } from 'react';
import styled from 'styled-components';
import { createAndPlayEventIntance } from '../../fmodLogic/eventInstanceHelpers';

const DrumButton = styled.button`
    padding: ${({ theme }) => theme.spacing[2]} ${({ theme }) => theme.spacing[5]};
    font-size: ${({ theme }) => theme.typography.fontSize.base};
    font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
    cursor: pointer;
    border: 2px solid ${({ theme }) => theme.colors.semantic.border.primary};
    border-radius: ${({ theme }) => theme.borderRadius.lg};
    background-color: ${({ theme }) => theme.colors.semantic.surface.primary};
    color: ${({ theme }) => theme.colors.semantic.text.primary};
    transition: all ${({ theme }) => theme.transitions.duration.fast} ${({ theme }) => theme.transitions.easing.ease};

    &:hover {
        background-color: ${({ theme }) => theme.colors.semantic.surface.secondary};
        border-color: ${({ theme }) => theme.colors.semantic.border.secondary};
        transform: translateY(-2px);
        box-shadow: ${({ theme }) => theme.shadows.md};
    }

    &:active {
        background-color: ${({ theme }) => theme.colors.semantic.surface.tertiary};
        transform: translateY(0);
    }
`;

const Drum = ({ instrumentName, name, recordEvent }) => {
    const playEvent = useCallback(() => {
        // eslint-disable-next-line max-len
        const eventInstance = createAndPlayEventIntance(`${instrumentName}/${name}`);
        recordEvent(eventInstance, instrumentName);
    }, [instrumentName, name, recordEvent]);

    return <DrumButton onClick={playEvent}>{name}</DrumButton>;
};

Drum.propTypes = {
    instrumentName: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    recordEvent: PropTypes.func.isRequired
};

export default Drum;

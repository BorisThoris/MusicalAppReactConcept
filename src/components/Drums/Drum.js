import PropTypes from 'prop-types';
import React, { useCallback } from 'react';
import styled from 'styled-components';
import { createAndPlayEventIntance } from '../../fmodLogic/eventInstanceHelpers';

const DrumButton = styled.button`
    padding: ${({ theme }) => theme.spacing[2]} ${({ theme }) => theme.spacing[5]};
    font-size: ${({ theme }) => theme.typography.fontSize.base};
    font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
    cursor: pointer;
    border: 2px solid ${({ theme }) => theme.colors.glass.border};
    border-radius: ${({ theme }) => theme.borderRadius.lg};
    background: ${({ theme }) => theme.colors.glass.primary};
    backdrop-filter: blur(15px);
    -webkit-backdrop-filter: blur(15px);
    color: ${({ theme }) => theme.colors.semantic.text.primary};
    transition: all ${({ theme }) => theme.transitions.duration.fast} ${({ theme }) => theme.transitions.easing.ease};
    box-shadow: ${({ theme }) => theme.shadows.glass};
    min-width: 120px;
    min-height: 60px;

    &:hover {
        background: ${({ theme }) => theme.colors.glass.elevated};
        border-color: ${({ theme }) => theme.colors.warning[400]};
        transform: translateY(-2px);
        box-shadow: ${({ theme }) => theme.shadows.glassLg};
    }

    &:active {
        background: ${({ theme }) => theme.colors.glass.inverse};
        transform: translateY(0);
        box-shadow: ${({ theme }) => theme.shadows.glass};
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

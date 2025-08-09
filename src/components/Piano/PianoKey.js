import PropTypes from 'prop-types';
import React, { useCallback } from 'react';
import styled from 'styled-components';

const NormalKey = styled.button`
    width: 40px;
    height: 200px;
    background: ${({ theme }) => theme.colors.glass.primary};
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border: 1px solid ${({ theme }) => theme.colors.glass.border};
    border-right: none;
    border-radius: 0 0 ${({ theme }) => theme.borderRadius.base} ${({ theme }) => theme.borderRadius.base};
    transition: all ${({ theme }) => theme.transitions.duration.fast} ${({ theme }) => theme.transitions.easing.ease};
    box-shadow: ${({ theme }) => theme.shadows.glass};
    cursor: pointer;

    &:hover {
        background: ${({ theme }) => theme.colors.glass.elevated};
        border-color: ${({ theme }) => theme.colors.primary[400]};
        box-shadow: ${({ theme }) => theme.shadows.glassLg};
        transform: translateY(-2px);
    }

    &:active {
        background: ${({ theme }) => theme.colors.glass.inverse};
        transform: translateY(0);
        box-shadow: ${({ theme }) => theme.shadows.glass};
    }
`;

const SharpKey = styled.button`
    width: 30px;
    height: 130px;
    background: ${({ theme }) => theme.colors.glass.inverse};
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    position: relative;
    margin: 0 -5px;
    z-index: 1;
    border-radius: 0 0 ${({ theme }) => theme.borderRadius.base} ${({ theme }) => theme.borderRadius.base};
    transition: all ${({ theme }) => theme.transitions.duration.fast} ${({ theme }) => theme.transitions.easing.ease};
    border: 1px solid ${({ theme }) => theme.colors.glass.borderSecondary};
    box-shadow: ${({ theme }) => theme.shadows.glass};
    cursor: pointer;

    &:hover {
        background: ${({ theme }) => theme.colors.glass.primary};
        border-color: ${({ theme }) => theme.colors.primary[400]};
        box-shadow: ${({ theme }) => theme.shadows.glassLg};
        transform: translateY(-2px);
    }

    &:active {
        background: ${({ theme }) => theme.colors.glass.elevated};
        transform: translateY(0);
        box-shadow: ${({ theme }) => theme.shadows.glass};
    }
`;

const PianoKey = ({ instrumentName, keyName, playEvent }) => {
    const isSharp = keyName.includes('#');
    const KeyComponent = isSharp ? SharpKey : NormalKey;

    const handleClick = useCallback(() => {
        playEvent(`${instrumentName}/${keyName}`);
    }, [instrumentName, keyName, playEvent]);

    return <KeyComponent onClick={handleClick} />;
};

PianoKey.propTypes = {
    instrumentName: PropTypes.string.isRequired,
    keyName: PropTypes.string.isRequired,
    playEvent: PropTypes.func.isRequired
};

export default PianoKey;

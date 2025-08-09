import PropTypes from 'prop-types';
import React, { useCallback } from 'react';
import styled from 'styled-components';

const NormalKey = styled.button`
    width: 40px;
    height: 200px;
    background-color: ${({ theme }) => theme.colors.semantic.surface.primary};
    border: 1px solid ${({ theme }) => theme.colors.semantic.border.primary};
    border-right: none;
    border-radius: 0 0 ${({ theme }) => theme.borderRadius.base} ${({ theme }) => theme.borderRadius.base};
    transition: background-color ${({ theme }) => theme.transitions.duration.fast}
        ${({ theme }) => theme.transitions.easing.ease};

    &:hover {
        background-color: ${({ theme }) => theme.colors.semantic.surface.secondary};
    }

    &:active {
        background-color: ${({ theme }) => theme.colors.semantic.surface.tertiary};
    }
`;

const SharpKey = styled.button`
    width: 30px;
    height: 130px;
    background-color: ${({ theme }) => theme.colors.semantic.surface.inverse};
    position: relative;
    margin: 0 -5px;
    z-index: 1;
    border-radius: 0 0 ${({ theme }) => theme.borderRadius.base} ${({ theme }) => theme.borderRadius.base};
    transition: background-color ${({ theme }) => theme.transitions.duration.fast}
        ${({ theme }) => theme.transitions.easing.ease};

    &:hover {
        background-color: ${({ theme }) => theme.colors.semantic.text.primary};
    }

    &:active {
        background-color: ${({ theme }) => theme.colors.semantic.text.secondary};
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

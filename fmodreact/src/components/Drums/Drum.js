import PropTypes from 'prop-types';
import React, { useCallback } from 'react';
import styled from 'styled-components';
import { createAndPlayEventIntance } from '../../fmodLogic/eventInstanceHelpers';

const DrumButton = styled.button`
    padding: 10px 20px;
    font-size: 16px;
    cursor: pointer;
    border: 2px solid #000;
    border-radius: 8px;
    background-color: #fff;
    transition: background-color 0.3s;

    &:hover {
        background-color: #f0f0f0;
    }
`;

const Drum = ({ instrumentName, name, recordEvent }) => {
    const playEvent = useCallback(() => {
        const eventInstance = createAndPlayEventIntance(
            `${instrumentName}/${name}`
        );
        recordEvent(eventInstance, instrumentName);
    }, [instrumentName, name, recordEvent]);

    return <DrumButton onClick={playEvent}>{name}</DrumButton>;
};

Drum.propTypes = {
    instrumentName: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    recordEvent: PropTypes.func.isRequired,
};

export default Drum;

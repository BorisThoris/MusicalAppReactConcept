import get from 'lodash/get';
import PropTypes from 'prop-types';
import React from 'react';
import styled from 'styled-components';
import SoundEventElement from './SoundEventElement';

const soundEventType = PropTypes.shape({
    eventName: PropTypes.string.isRequired,
    instrumentName: PropTypes.string.isRequired,
    startTime: PropTypes.number.isRequired,
});

const Timeline = styled.div`
    position: relative;
    display: flex;

    padding-top: 1%;
    padding-bottom: 1%;
`;

const InstrumentTimeline = ({
    instrumentGroup,
    masterTimelineReference,
    updateStartTime,
}) => {
    const instrumentName = get(
        instrumentGroup,
        '[0].instrumentName',
        'Unknown Instrument'
    );

    return (
        <Timeline>
            <h2>{instrumentName}</h2>

            {instrumentGroup.map((eventInstance, index) => (
                <SoundEventElement
                    instrumentName={instrumentName}
                    key={index}
                    index={index}
                    eventInstance={eventInstance}
                    updateStartTime={updateStartTime}
                    masterTimelineReference={masterTimelineReference}
                />
            ))}
        </Timeline>
    );
};

InstrumentTimeline.propTypes = {
    instrumentGroup: PropTypes.arrayOf(soundEventType).isRequired,
    masterTimelineReference: PropTypes.object,
    updateStartTime: PropTypes.func,
};

export default InstrumentTimeline;

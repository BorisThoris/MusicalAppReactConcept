import PropTypes from 'prop-types';
import React from 'react';
import { getEventInstanceLength } from '../../../fmodLogic';
import { SoundElement } from './SoundEventElement.styles';

const pixelToSecondRatio = 105;

const SoundEventElement = ({
    index,
    masterTimelineReference,
    recording,
    updateStartTime,
}) => {
    const { eventInstance, instrumentName, startTime } = recording;
    const startingPositionInTimeline = startTime * pixelToSecondRatio;

    const eventLength = getEventInstanceLength(eventInstance);
    const lengthBasedWidth = eventLength * pixelToSecondRatio;

    const onPressEvent = () => {
        eventInstance.start();
    };

    const handleDragEnd = (e) => {
        const timelineScrollLeft = masterTimelineReference.current.scrollLeft;
        const newPos = e.pageX + timelineScrollLeft;
        const newStartTime = newPos / pixelToSecondRatio;
        updateStartTime({ index, instrumentName, newStartTime });
    };

    return (
        <SoundElement
            onClick={onPressEvent}
            draggable
            onDragEnd={handleDragEnd}
            lengthBasedWidth={lengthBasedWidth}
            positionInTimeline={startingPositionInTimeline}
        >
            <div>{instrumentName}</div>
            <p>--------------</p>
            <div>Start Time:{startTime}</div>
            <div>Length: {eventLength}</div>
        </SoundElement>
    );
};

SoundEventElement.propTypes = {
    index: PropTypes.number,
    instrumentName: PropTypes.string,
    masterTimelineReference: PropTypes.shape({
        current: PropTypes.shape({
            scrollLeft: PropTypes.number,
        }),
    }),
    recording: PropTypes.shape({
        eventInstance: PropTypes.object,
        instrumentName: PropTypes.string,
        startTime: PropTypes.number,
    }),
    updateStartTime: PropTypes.func,
};

SoundEventElement.defaultProps = {
    index: 0,
    instrumentName: '',
    masterTimelineReference: {},
    recording: {},
    updateStartTime: () => {},
};

export default SoundEventElement;

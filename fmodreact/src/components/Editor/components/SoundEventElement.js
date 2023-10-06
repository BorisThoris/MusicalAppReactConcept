import get from 'lodash/get';
import PropTypes from 'prop-types';
import React from 'react';
import { playEventInstance } from '../../../fmodLogic';
import { SoundElement } from './SoundEventElement.styles';

const pixelToSecondRatio = 105;

const SoundEventElement = ({
    eventInstance,
    index,
    instrumentName,
    masterTimelineReference,
    updateStartTime,
}) => {
    const { eventName, startTime } = eventInstance;
    const startingPositionInTimeline = startTime * pixelToSecondRatio;

    const onPressEvent = () => {
        playEventInstance(eventName);
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
            positionInTimeline={startingPositionInTimeline}
        >
            <div>{eventName}</div>
            <p>--------------</p>
            <div>Start Time:{startTime}</div>
        </SoundElement>
    );
};

SoundEventElement.propTypes = {
    eventInstance: PropTypes.shape({
        eventName: PropTypes.string,
        startTime: PropTypes.number,
    }),
    index: PropTypes.number,
    instrumentName: PropTypes.string,
    masterTimelineReference: PropTypes.shape({
        current: PropTypes.shape({
            scrollLeft: PropTypes.number,
        }),
    }),
    updateStartTime: PropTypes.func,
};

SoundEventElement.defaultProps = {
    eventInstance: {},
    index: 0,
    instrumentName: '',
    masterTimelineReference: {},
    updateStartTime: () => {},
};

export default SoundEventElement;

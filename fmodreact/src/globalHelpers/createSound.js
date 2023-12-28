import {
    getEventInstanceLength,
    getEventName,
} from '../fmodLogic/eventInstanceHelpers';

const createSound = ({
    eventInstance,
    eventPath,
    instrumentName,
    startTime,
}) => {
    const eventLength = getEventInstanceLength(eventInstance);
    const endTime = startTime + eventLength;
    const name = getEventName(eventInstance);

    return {
        endTime: parseFloat(endTime.toFixed(2)),
        eventInstance,
        eventLength,
        eventPath,
        id: eventInstance.$$.ptr,
        instrumentName,
        name,
        startTime: parseFloat(startTime.toFixed(2)),
    };
};

export default createSound;

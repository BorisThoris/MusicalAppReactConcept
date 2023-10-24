import { getEventInstanceLength } from '../fmodLogic/eventInstanceHelpers';

const createSound = ({ eventInstance, instrumentName, startTime }) => {
    const eventLength = getEventInstanceLength(eventInstance);
    const endTime = startTime + eventLength;

    return {
        endTime: parseFloat(endTime.toFixed(2)),
        eventInstance,
        instrumentName,
        startTime: parseFloat(startTime.toFixed(2)),
    };
};

export default createSound;

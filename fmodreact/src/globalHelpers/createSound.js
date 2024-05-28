import {
    createEventInstance,
    getEventInstanceLength,
    getEventInstanceParamaters,
    getEventName
} from '../fmodLogic/eventInstanceHelpers';

function processParameters(eventInstance, params) {
    return params.map((param) => {
        const { defaultvalue: defaultValue, maximum: max, minimum: min, name: paramName } = param;
        const paramValueObj = {};

        eventInstance.getParameterByName(paramName, paramValueObj, {});
        const validatedValue = Math.min(Math.max(paramValueObj.val || defaultValue, min), max);

        return { name: paramName, param, value: validatedValue };
    });
}

export const createSound = ({ eventInstance, eventPath, instrumentName, passedParams = [], startTime }) => {
    const eventLength = getEventInstanceLength(eventInstance);
    const endTime = startTime + eventLength;
    const name = getEventName(eventInstance);
    let params;

    if (passedParams.length > 0) {
        params = passedParams;
        params.forEach((paramData) => {
            const { param, value } = paramData;
            const { name: paramName } = param;

            eventInstance.setParameterByName(paramName, value, false);
        });
    } else {
        const rawParams = getEventInstanceParamaters(eventInstance);
        const paramsWithValues = processParameters(eventInstance, rawParams);
        params = paramsWithValues;
    }

    const idBasedOnPointer = `${eventInstance.$$.ptr}`;

    return {
        ...eventInstance,
        endTime: parseFloat(endTime.toFixed(2)),
        eventInstance,
        eventLength,
        eventPath,
        id: idBasedOnPointer,
        instrumentName,
        name,
        params,
        startTime: parseFloat(startTime?.toFixed(2))
    };
};

// Helper function to create a main event or sub-event
export const createEvent = (recording, instrumentName, parentId = null) => {
    const eventInstance = createEventInstance(recording.eventPath || 'Drum/Snare');
    const mainEvent = createSound({
        eventInstance,
        eventPath: recording.eventPath || 'Drum/Snare',
        instrumentName,
        passedParams: recording.params,
        startTime: recording.startTime
    });

    return {
        ...mainEvent,
        endTime: mainEvent.endTime,
        eventLength: mainEvent.eventLength,
        id: mainEvent.id,
        instrumentName: mainEvent.instrumentName,
        length: mainEvent.eventLength,
        locked: recording.locked,
        parentId,
        startTime: mainEvent.startTime
    };
};

export const recreateEvents = (passedGroups) => {
    const newRecordings = {};

    Object.keys(passedGroups).forEach((instrumentName) => {
        newRecordings[instrumentName] = Object.values(passedGroups[instrumentName]).map((recording) => {
            const group = createEvent(recording, instrumentName);
            const events = recording.events ? Object.values(recording.events) : [];

            group.events =
                events.length > 1
                    ? events.map((subEvent) => createEvent(subEvent, instrumentName, group.id))
                    : { [group.id]: { ...group, parentId: group.id } };

            return group;
        });
    });

    return newRecordings;
};

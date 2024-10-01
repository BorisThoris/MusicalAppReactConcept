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
export const createEvent = (recording, instrumentName, parentId = null, passedStartTime = null) => {
    const eventInstance = createEventInstance(recording.eventPath || 'Drum/Snare');
    const mainEvent = createSound({
        eventInstance,
        eventPath: recording.eventPath || 'Drum/Snare',
        instrumentName,
        passedParams: recording.params,
        startTime: passedStartTime || recording.startTime
    });

    let { startTime } = mainEvent;
    let { endTime } = mainEvent;

    // Process child events to determine the overall start and end times
    const events = recording.events ? Object.values(recording.events) : [];
    const childEvents = events.reduce((acc, subEvent) => {
        const subGroup = createEvent(subEvent, instrumentName, mainEvent.id, passedStartTime);
        acc[subGroup.id] = subGroup;

        if (subGroup.startTime < startTime) {
            startTime = subGroup.startTime;
        }
        if (subGroup.endTime > endTime) {
            endTime = subGroup.endTime;
        }

        return acc;
    }, {});

    // If there's only one child event, set its ID to match the main event's ID
    if (Object.values(childEvents).length === 1) {
        const singularEventKey = Object.keys(childEvents)[0];
        childEvents[mainEvent.id] = {
            ...childEvents[singularEventKey],
            id: mainEvent.id, // Override the child event's ID with the main event's ID
            parentId: mainEvent.id // Ensure the parentId also matches
        };
        delete childEvents[singularEventKey];
    }

    return {
        ...mainEvent,
        endTime: parseFloat(endTime.toFixed(2)),
        eventLength: endTime - startTime,
        events: childEvents,
        id: mainEvent.id,
        instrumentName: mainEvent.instrumentName,
        length: endTime - startTime,
        locked: recording.locked,
        parentId,
        startTime: parseFloat(startTime.toFixed(2))
    };
};

export const recreateEvents = (passedGroups) => {
    const newRecordings = {};

    Object.keys(passedGroups).forEach((instrumentName) => {
        newRecordings[instrumentName] = {};

        Object.values(passedGroups[instrumentName]).forEach((recording) => {
            const group = createEvent(recording, instrumentName);
            const events = recording.events ? Object.values(recording.events) : [];

            group.events =
                events.length > 1
                    ? events.reduce((acc, subEvent) => {
                          const subGroup = createEvent(subEvent, instrumentName, group.id);
                          acc[subGroup.id] = subGroup;
                          return acc;
                      }, {})
                    : { [group.id]: { ...group, parentId: group.id } };

            newRecordings[instrumentName][group.id] = { ...group, events: group.events };
        });
    });

    return newRecordings;
};

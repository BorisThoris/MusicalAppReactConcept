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
        const validatedValue = Math.min(Math.max(paramValueObj.val ?? defaultValue, min), max);

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
        params.forEach(({ param, value }) => {
            eventInstance.setParameterByName(param.name, value, false);
        });
    } else {
        const rawParams = getEventInstanceParamaters(eventInstance);
        params = processParameters(eventInstance, rawParams);
    }

    const id = `${eventInstance.$$.ptr}`;

    return {
        endTime: parseFloat(endTime.toFixed(2)),
        eventInstance,
        eventLength,
        eventPath,
        id,
        instrumentName,
        name,
        params,
        startTime: parseFloat(startTime.toFixed(2))
    };
};

export const createEvent = ({ instrumentName, parentId = null, passedStartTime = null, recording }) => {
    // Build the main event instance and sound data
    const newInstance = createEventInstance(recording.eventPath || 'Drum/Snare');
    const oldInstance = recording.eventInstance?.$$?.ptr ? recording.eventInstance : false;

    const sound = createSound({
        eventInstance: oldInstance || newInstance,
        eventPath: recording.eventPath || 'Drum/Snare',
        instrumentName,
        passedParams: recording.params,
        startTime: passedStartTime ?? recording.startTime
    });

    const { endTime, id, name, params, startTime } = sound;
    const length = endTime - startTime;

    // base event object
    const eventObj = {
        ...recording,
        ...sound,
        endTime: parseFloat(endTime.toFixed(2)),
        eventLength: parseFloat(length.toFixed(2)),
        id,
        instrumentName,
        isSelected: recording.isSelected || false,
        locked: recording.locked || false,
        parentId,
        startTime: parseFloat(startTime.toFixed(2))
    };

    // If this recording has an overlap-group, recreate its children
    if (recording.elements && Object.keys(recording.elements).length) {
        eventObj.elements = {};
        const groupOffset = (passedStartTime ?? recording.startTime) - recording.startTime;

        Object.values(recording.elements).forEach((child) => {
            const childOffsetRelative = child.startTime - recording.startTime;
            const childStart = (passedStartTime ?? recording.startTime) + childOffsetRelative;
            const childRecording = { ...child, eventInstance: null };

            const created = createEvent({
                instrumentName,
                parentId: eventObj.id,
                passedStartTime: parseFloat(childStart.toFixed(2)),
                recording: childRecording
            });

            eventObj.elements[created.id] = created;
        });
    }

    return eventObj;
};

export const copyEvent = (event, targetInstrumentName, startOffset) => {
    // simply delegate to createEvent; it will handle overlap-groups automatically
    const recording = { ...event, eventInstance: null, locked: true };
    const start = event.startTime + startOffset;
    return createEvent({
        instrumentName: targetInstrumentName,
        parentId: event.parentId,
        passedStartTime: parseFloat(start.toFixed(2)),
        recording
    });
};

export const recreateEvents = (passedGroups) => {
    const newRecordings = {};

    Object.entries(passedGroups).forEach(([instrumentName, groupMap]) => {
        newRecordings[instrumentName] = {};

        Object.values(groupMap).forEach((recording) => {
            const created = createEvent({ instrumentName, recording });
            newRecordings[instrumentName][created.id] = created;
        });
    });

    return newRecordings;
};

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

export const createEvent = ({ instrumentName, parentId = null, passedStartTime = null, recording }) => {
    const newEventInstance = createEventInstance(recording.eventPath || 'Drum/Snare');

    const oldEventInstance =
        recording.eventInstance && recording.eventInstance.$$ && recording.eventInstance.$$.ptr
            ? recording.eventInstance
            : false;

    const mainEvent = createSound({
        eventInstance: oldEventInstance || newEventInstance,
        eventPath: recording.eventPath || 'Drum/Snare',
        instrumentName,
        passedParams: recording.params,
        startTime: passedStartTime || recording.startTime
    });

    const { startTime } = mainEvent;
    const { endTime } = mainEvent;

    return {
        ...recording,
        ...mainEvent,
        endTime: parseFloat(endTime.toFixed(2)),
        eventLength: endTime - startTime,
        events: undefined,
        id: mainEvent.id,
        instrumentName: mainEvent.instrumentName,
        isSelected: recording.isSelected || false,
        length: endTime - startTime,
        locked: recording.locked || false,
        parentId,
        startTime: parseFloat(startTime.toFixed(2))
    };
};

export const copyEvent = (event, targetInstrumentName, startOffset) => {
    const newEvent = { ...event, eventInstance: null, locked: true };
    const adjustedStartTime = event.startTime + startOffset;

    return createEvent({
        instrumentName: targetInstrumentName,
        passedStartTime: adjustedStartTime,
        recording: newEvent
    });
};

export const recreateEvents = (passedGroups) => {
    const newRecordings = {};

    Object.keys(passedGroups).forEach((instrumentName) => {
        newRecordings[instrumentName] = {};

        Object.values(passedGroups[instrumentName]).forEach((recording) => {
            if (recording.overlapGroup) {
                const newOverlapGroup = {};
                const newEventIds = [];

                Object.entries(recording.overlapGroup).forEach(([id, overlapEvent]) => {
                    const recreatedEvent = createEvent({
                        instrumentName,
                        recording: overlapEvent
                    });
                    newOverlapGroup[recreatedEvent.id] = recreatedEvent;
                    newEventIds.push(recreatedEvent.id);
                });

                const newOverlapGroupId = newEventIds.join('-');
                newRecordings[instrumentName][newOverlapGroupId] = {
                    ...recording,
                    id: newOverlapGroupId,
                    overlapGroup: newOverlapGroup
                };
            } else {
                // Process regular events
                const recreatedEvent = createEvent({ instrumentName, recording });
                newRecordings[instrumentName][recreatedEvent.id] = { ...recreatedEvent };
            }
        });
    });

    return newRecordings;
};

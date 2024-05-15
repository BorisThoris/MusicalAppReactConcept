import first from 'lodash/first';
import last from 'lodash/last';
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

const createSound = ({ eventInstance, eventPath, instrumentName, passedParams = [], startTime }) => {
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

export const recreateEvents = (passedGroups) => {
    const parsedRecordings = passedGroups;
    const newRecordings = {};

    // Iterate over each instrument name in parsedRecordings
    Object.keys(parsedRecordings).forEach((instrumentName) => {
        // Convert the object of recordings for the instrument into an array using Object.values()
        newRecordings[instrumentName] = Object.values(parsedRecordings[instrumentName]).map((recording) => {
            const eventInstance = createEventInstance(recording.eventPath || 'Drum/Snare');
            const mainEvent = createSound({
                eventInstance,
                eventPath: recording.eventPath || 'Drum/Snare',
                instrumentName,
                passedParams: recording.params,
                startTime: recording.startTime
            });

            const group = {
                ...mainEvent,
                endTime: mainEvent.endTime,
                eventLength: mainEvent.eventLength,
                id: mainEvent.id,
                instrumentName: mainEvent.instrumentName,
                length: mainEvent.eventLength,
                locked: recording.locked,
                startTime: mainEvent.startTime
            };

            // Convert sub-events, if they exist, from an object to an array using Object.values()
            const recreatedEvents = recording.events
                ? Object.values(recording.events).map((subEvent) => {
                      const subEventInstance = createEventInstance(subEvent.eventPath || 'Drum/Snare');
                      const parentNotSub = mainEvent.id !== subEvent.id;

                      const parentId = parentNotSub && subEvent.parentId ? mainEvent.id : null;

                      const recreatedEvent = createSound({
                          eventInstance: subEventInstance,
                          eventPath: subEvent.eventPath || 'Drum/Snare',
                          instrumentName,
                          passedParams: subEvent.params,
                          startTime: subEvent.startTime
                      });

                      const id = parentNotSub && subEvent.parentId ? recreatedEvent.id : mainEvent.id;

                      return { ...recreatedEvent, id, parentId };
                  })
                : [];

            group.events = recreatedEvents;

            // Calculate the end and start time of the group based on its events
            group.endTime = recreatedEvents.length ? Math.max(...recreatedEvents.map((e) => e.endTime)) : group.endTime;
            group.startTime = recreatedEvents.length
                ? Math.min(...recreatedEvents.map((e) => e.startTime))
                : group.startTime;

            return group;
        });
    });

    return newRecordings;
};

export default createSound;

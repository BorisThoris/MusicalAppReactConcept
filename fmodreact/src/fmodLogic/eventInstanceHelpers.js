/* eslint-disable no-alert */
import { CHECK_RESULT, gSystem } from './index';

const showAlertIfSystemNotInitialized = () => {
    if (!gSystem) window.alert("FMOD system hasn't been initialized yet.");
};

export const getEventInstanceParamaters = (eventInstance) => {
    showAlertIfSystemNotInitialized();

    const eventDescription = {};
    CHECK_RESULT(eventInstance.getDescription(eventDescription));

    const id = {};
    eventDescription.val.getID(id);

    const eventInstanceParamsCount = {};
    eventDescription.val.getParameterDescriptionCount(eventInstanceParamsCount);

    const parameters = Array.from(
        { length: eventInstanceParamsCount.val },
        (_, index) => {
            const param = {};
            eventDescription.val.getParameterDescriptionByIndex(0, param);
            return param;
        }
    );

    return parameters;
};

export const createEventInstance = (eventPath) => {
    showAlertIfSystemNotInitialized();

    const eventDescription = {};
    CHECK_RESULT(gSystem.getEvent(`event:/${eventPath}`, eventDescription));

    const eventInstance = {};
    CHECK_RESULT(eventDescription.val.createInstance(eventInstance));

    return eventInstance.val;
};

export const getEventInstanceLength = (eventInstance) => {
    showAlertIfSystemNotInitialized();

    if (!eventInstance) {
        window.alert('Event instance is not valid.');
        return null;
    }

    const description = {};
    CHECK_RESULT(eventInstance.getDescription(description));

    const length = {};
    CHECK_RESULT(description.val.getLength(length));

    return length.val / 1000;
};

export const playEventInstance = (passedEventInstance) => {
    showAlertIfSystemNotInitialized();

    CHECK_RESULT(passedEventInstance.start());

    return passedEventInstance;
};

export const createAndPlayEventIntance = (eventPath) => {
    showAlertIfSystemNotInitialized();

    const eventInstance = createEventInstance(eventPath);
    if (eventInstance) playEventInstance(eventInstance);

    return eventInstance;
};

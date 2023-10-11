import { CHECK_RESULT, gSystem } from '.';

export const createEventInstance = (eventPath) => {
    if (!gSystem) {
        window.alert("FMOD system hasn't been initialized yet.");
        return null;
    }

    // Get the event description
    const eventDescription = {};
    const result1 = gSystem.getEvent(`event:/${eventPath}`, eventDescription);
    CHECK_RESULT(result1);

    // Create an instance of the event
    const eventInstance = {};
    const result2 = eventDescription.val.createInstance(eventInstance);
    CHECK_RESULT(result2);

    return eventInstance.val;
};

export const getEventInstanceLength = (eventInstance) => {
    if (!eventInstance) {
        window.alert('Event instance is not valid.');
        return null;
    }

    const eventInstanceDescription = {};
    const result1 = eventInstance.getDescription(eventInstanceDescription);
    CHECK_RESULT(result1);

    const eventLength = {};
    const result2 = eventInstanceDescription.val.getLength(eventLength);
    CHECK_RESULT(result2);

    // Transformed from MS to seconds
    return eventLength.val / 1000;
};

/**
 * Creates and plays an FMOD event instance.
 * @param {Object} passedEventInstance - The path to the event in FMOD.
 * or null if failed.
 */
export const playEventInstance = (passedEventInstance) => {
    if (!gSystem) {
        window.alert("FMOD system hasn't been initialized yet.");
        return null;
    }

    const result = passedEventInstance.start();
    CHECK_RESULT(result);

    return passedEventInstance;
};

/**
 * Creates and plays an FMOD event instance.
 * @param {string} eventPath - The path to the event in FMOD.
 * @returns {Object|null} - Returns the event instance if successful,
 * or null if failed.
 */
export const createAndPlayEventIntance = (eventPath) => {
    if (!gSystem) {
        window.alert("FMOD system hasn't been initialized yet.");
        return null;
    }

    // Create an instance of the event
    const eventInstance = createEventInstance(eventPath);
    if (!eventInstance) {
        return null;
    }

    playEventInstance(eventInstance);

    return eventInstance;
};

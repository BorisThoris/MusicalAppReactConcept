/* eslint-disable no-prototype-builtins */
/* eslint-disable no-restricted-syntax */
/* eslint-disable max-len */
/* eslint-disable no-alert */
import { CHECK_RESULT, FMOD, gSystem } from './index';

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
    },
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

export const stopAllPlayback = () => {
  showAlertIfSystemNotInitialized();

  // Get a reference to the master bus
  const masterBus = {};
  CHECK_RESULT(gSystem.getBus('bus:/', masterBus));

  if (!masterBus.val) {
    window.alert('Failed to get master bus.');
    return;
  }

  // Stop all events on the master bus
  CHECK_RESULT(masterBus.val.stopAllEvents(FMOD.STUDIO_STOP_IMMEDIATE));
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

export const getEventPath = (eventInstance) => {
  showAlertIfSystemNotInitialized();

  // Check if the event instance is valid
  if (!eventInstance) {
    window.alert('Event instance is not valid.');
    return null;
  }

  const eventDescription = {};
  CHECK_RESULT(eventInstance.getDescription(eventDescription));

  // Define the size of the buffer to receive the path
  const bufferSize = 512; // You can adjust this size as needed
  const pathBuffer = new Uint8Array(bufferSize);

  // Retrieve the path
  const retrieved = {};
  const result = eventDescription.val.getPath(
    pathBuffer,
    bufferSize,
    retrieved,
  );

  const parts = pathBuffer.val.split('event:/');
  return parts.length > 1 ? parts[1] : '';
};

export const getEventName = (eventInstance) => {
  const path = getEventPath(eventInstance);
  const pathParths = path.split('/');

  return pathParths[pathParths.length - 1];
};

/**
 * Converts a GUID-like object to a string representation, handling various shapes.
 * @param {object} guid - The GUID-like object to convert.
 * @returns {string} The string representation of the object.
 */
const guidToString = (guid) => {
  let stringRepresentation = '';

  for (const key in guid) {
    if (guid.hasOwnProperty(key)) {
      const element = guid[key];

      // If the element is an array, convert each element to a hex string
      if (Array.isArray(element)) {
        stringRepresentation += element
          .map((b) => b.toString(16).padStart(2, '0'))
          .join('');
      } else {
        // If the element is a number, convert it to a hex string
        stringRepresentation += element.toString(16).padStart(8, '0');
      }
    }
  }

  return stringRepresentation;
};

export const getEventDescriptionId = (eventInstance) => {
  showAlertIfSystemNotInitialized();

  if (!eventInstance) {
    window.alert('Event instance is not valid.');
    return null;
  }

  const eventDescription = {};
  CHECK_RESULT(eventInstance.getDescription(eventDescription));

  const id = {};
  CHECK_RESULT(eventDescription.val.getID(id));

  return id.val ? guidToString(id.val) : null;
};

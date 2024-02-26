import {
  getEventInstanceLength,
  getEventInstanceParamaters,
  getEventName,
} from "../fmodLogic/eventInstanceHelpers";

function processParameters(eventInstance, params) {
  return params.map((param) => {
    const {
      defaultvalue: defaultValue,
      maximum: max,
      minimum: min,
      name: paramName,
    } = param;
    const paramValueObj = {};

    eventInstance.getParameterByName(paramName, paramValueObj, {});
    const validatedValue = Math.min(
      Math.max(paramValueObj.val || defaultValue, min),
      max,
    );

    return { name: paramName, param, value: validatedValue };
  });
}

const createSound = ({
  eventInstance,
  eventPath,
  instrumentName,
  passedParams = [],
  startTime,
}) => {
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

  return {
    endTime: parseFloat(endTime.toFixed(2)),
    eventInstance,
    eventLength,
    eventPath,
    id: eventInstance.$$.ptr,
    instrumentName,
    name,
    params,
    startTime: parseFloat(startTime?.toFixed(2)),
  };
};

export default createSound;

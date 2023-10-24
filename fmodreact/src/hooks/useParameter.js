import { useCallback, useEffect, useState } from 'react';

const withValidation = (useParameterHook) => (eventInstance, param) => {
    const [paramDetails, handleParamChange] = useParameterHook(
        eventInstance,
        param
    );

    if (
        !paramDetails ||
        typeof paramDetails.paramValue !== 'number' ||
        typeof paramDetails.paramMin !== 'number' ||
        typeof paramDetails.paramMax !== 'number'
    ) {
        console.error(
            'Validation Failed: Invalid paramDetails object returned by the useParameter hook.'
        );
    }

    if (typeof handleParamChange !== 'function') {
        console.error(
            'Validation Failed: handleParamChange should be a function.'
        );
    }

    return [paramDetails, handleParamChange];
};

const useParameter = (eventInstance, param) => {
    const { maximum: max, minimum: min, name: paramName } = param;
    const [paramDetails, setParamDetails] = useState({
        paramMax: max,
        paramMin: min,
        paramValue: 0,
    });

    useEffect(() => {
        if (eventInstance && paramName) {
            const paramValueObj = {};
            eventInstance.getParameterByName(paramName, paramValueObj, {});

            const validatedValue = Math.min(
                Math.max(paramValueObj.val, min),
                max
            );
            setParamDetails({
                paramMax: max,
                paramMin: min,
                paramValue: validatedValue,
            });
        }
    }, [eventInstance, paramName, min, max]);

    const handleParamChange = useCallback(
        (event) => {
            let newValue = parseFloat(event.target.value);
            newValue = Math.min(Math.max(newValue, min), max);

            eventInstance.setParameterByName(paramName, newValue, false);
            setParamDetails((prevDetails) => ({
                ...prevDetails,
                paramValue: newValue,
            }));
        },
        [eventInstance, paramName, min, max]
    );

    return [paramDetails, handleParamChange];
};

// Usage
const validatedUseParameter = withValidation(useParameter);
export default validatedUseParameter;

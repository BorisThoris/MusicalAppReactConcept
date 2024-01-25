import { useCallback, useState } from 'react';
import { useInstrumentRecordingsOperations } from './useInstrumentRecordingsOperations';

const withValidation =
    (useParameterHook) =>
    ({ eventId, eventInstance, param, parent }) => {
        const [paramDetails, handleParamChange] = useParameterHook({
            eventId,
            eventInstance,
            paramData: param,
            parent,
        });

        // Validate paramDetails structure
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

const useParameter = ({ eventId, eventInstance, paramData, parent }) => {
    const { updateRecordingParams } = useInstrumentRecordingsOperations();

    const { param, value } = paramData;

    const { maximum: max, minimum: min, name: paramName } = param;

    const [paramDetails, setParamDetails] = useState({
        paramMax: max,
        paramMin: min,
        paramValue: value || 0,
    });

    const handleParamChange = useCallback(
        (event) => {
            let newValue = parseFloat(event.target.value);
            newValue = Math.min(Math.max(newValue, min), max);

            eventInstance.setParameterByName(paramName, newValue, false);

            setParamDetails((prevDetails) => ({
                ...prevDetails,
                paramValue: newValue,
            }));

            updateRecordingParams({
                eventId,
                parent,
                updatedParam: { ...paramData, value: newValue },
            });
        },
        [
            min,
            max,
            eventInstance,
            paramName,
            updateRecordingParams,
            eventId,
            parent,
            paramData,
        ]
    );

    return [paramDetails, handleParamChange];
};

// Usage
const validatedUseParameter = withValidation(useParameter);
export default validatedUseParameter;

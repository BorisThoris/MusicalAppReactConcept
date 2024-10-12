import { useCallback, useState } from 'react';
import { useInstrumentRecordingsOperations } from './useInstrumentRecordingsOperations';

const withValidation =
    (useParameterHook) =>
    ({ event, eventId, eventInstance, param }) => {
        const [paramDetails, handleParamChange] = useParameterHook({
            event,
            eventId,
            eventInstance,
            paramData: param
        });

        // Validate paramDetails structure
        if (
            !paramDetails ||
            typeof paramDetails.paramValue !== 'number' ||
            typeof paramDetails.paramMin !== 'number' ||
            typeof paramDetails.paramMax !== 'number'
        ) {
            console.error('Validation Failed: Invalid paramDetails object returned by the useParameter hook.');
        }

        if (typeof handleParamChange !== 'function') {
            console.error('Validation Failed: handleParamChange should be a function.');
        }

        return [paramDetails, handleParamChange];
    };

const useParameter = ({ event, paramData }) => {
    const { param, value } = paramData;
    const { maximum: max, minimum: min } = param;

    const [paramDetails, setParamDetails] = useState({
        paramMax: max,
        paramMin: min,
        paramValue: value || 0
    });

    const handleParamChange = useCallback(
        (passedEv) => {
            let newValue = parseFloat(passedEv.target.value);
            newValue = Math.min(Math.max(newValue, min), max);

            setParamDetails((prevDetails) => ({
                ...prevDetails,
                paramValue: newValue
            }));
        },
        [min, max]
    );

    return [paramDetails, handleParamChange];
};

// Usage
const validatedUseParameter = withValidation(useParameter);
export default validatedUseParameter;

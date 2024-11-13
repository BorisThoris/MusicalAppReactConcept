import { useCallback, useState } from 'react';
import { useInstrumentRecordingsOperations } from './useInstrumentRecordingsOperations';

const useParameter = ({ event, paramData }) => {
    const { param, value } = paramData;
    const { maximum: max, minimum: min } = param;

    console.log('EVENT');
    console.log(event);

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

export default useParameter;

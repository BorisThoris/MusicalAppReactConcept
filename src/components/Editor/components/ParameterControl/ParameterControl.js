import clamp from 'lodash/clamp';
import isEqual from 'lodash/isEqual';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useState } from 'react';
import { useInstrumentRecordingsOperations } from '../../../../hooks/useInstrumentRecordingsOperations';
import { ControlWrapper, ParamName, ParamValue, SliderInput } from './ParameterControl.styles';

const ParameterControl = React.memo(({ event, param }) => {
    const {
        name,
        param: { maximum: max, minimum: min },
        value = 0
    } = param;

    const { updateRecordingParams } = useInstrumentRecordingsOperations();
    const [paramValue, setParamValue] = useState(value);

    const handleParamChange = useCallback(
        (passedEv) => {
            const newValue = clamp(parseFloat(passedEv.target.value), min, max);
            setParamValue(newValue);
        },
        [min, max]
    );

    const onValueUpdate = useCallback((e) => {
        setParamValue(parseFloat(e.target.value));
    }, []);

    useEffect(() => {
        try {
            // Check if `eventInstance` exists and has the `setParameterByName` method
            if (event?.eventInstance?.setParameterByName) {
                event.eventInstance.setParameterByName(name, paramValue, false);

                console.log('LELELELE');
                console.log(event.eventInstance);
                // // Update recording parameters with the new value
                updateRecordingParams({
                    event,
                    updatedParam: { ...param, value: paramValue }
                });
            } else {
                console.warn('Invalid eventInstance object:', event.eventInstance);
            }
        } catch (error) {
            console.error('Error setting parameter by name:', error);
        }
    }, [event, name, paramValue, param, updateRecordingParams]);

    return (
        <ControlWrapper>
            <div>
                <ParamName>{name}</ParamName>
                <ParamValue>{paramValue}</ParamValue>
            </div>
            <SliderInput
                type="range"
                min={min}
                max={max}
                value={paramValue}
                onChange={onValueUpdate}
                onMouseUp={handleParamChange}
            />
        </ControlWrapper>
    );
}, isEqual);

ParameterControl.propTypes = {
    event: PropTypes.shape({
        eventInstance: PropTypes.shape({
            setParameterByName: PropTypes.func.isRequired
        }).isRequired
    }).isRequired,
    param: PropTypes.shape({
        name: PropTypes.string.isRequired,
        param: PropTypes.shape({
            maximum: PropTypes.number.isRequired,
            minimum: PropTypes.number.isRequired
        }).isRequired,
        value: PropTypes.number
    }).isRequired
};

export default ParameterControl;

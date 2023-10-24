import PropTypes from 'prop-types';
import React from 'react';
import useParameter from '../../../../hooks/useParameter';
import {
    ControlWrapper,
    ParamName,
    ParamValue,
    SliderInput,
} from './ParameterControl.styles';

// Main component
const ParameterControl = ({ eventInstance, param }) => {
    const [paramDetails, handleParamChange] = useParameter(
        eventInstance,
        param
    );

    return (
        <ControlWrapper>
            <div>
                <ParamName>{param.name}</ParamName>
                <ParamValue>{paramDetails.paramValue}</ParamValue>
            </div>
            <SliderInput
                type="range"
                min={paramDetails.paramMin}
                max={paramDetails.paramMax}
                value={paramDetails.paramValue}
                onChange={handleParamChange}
            />
        </ControlWrapper>
    );
};

ParameterControl.propTypes = {
    eventInstance: PropTypes.object.isRequired,
    param: PropTypes.shape({
        maximum: PropTypes.number,
        minimum: PropTypes.number,
        name: PropTypes.string,
    }).isRequired,
};

export default ParameterControl;

import isEqual from 'lodash/isEqual';
import PropTypes from 'prop-types';
import React from 'react';
import useParameter from '../../../../hooks/useParameter';
import {
    ControlWrapper,
    ParamName,
    ParamValue,
    SliderInput,
} from './ParameterControl.styles';

const ParameterControl = React.memo(
    ({ eventId, eventInstance, param, parent }) => {
        const [paramDetails, handleParamChange] = useParameter({
            eventId,
            eventInstance,
            param,
            parent,
        });

        console.log('PARENT');
        console.log(parent);

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
    },
    isEqual
);

ParameterControl.propTypes = {
    eventInstance: PropTypes.object.isRequired,
    param: PropTypes.shape({
        maximum: PropTypes.number,
        minimum: PropTypes.number,
        name: PropTypes.string,
    }).isRequired,
};

export default ParameterControl;

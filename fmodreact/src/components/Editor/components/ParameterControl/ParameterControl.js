import isEqual from 'lodash/isEqual';
import PropTypes from 'prop-types';
import React, { useCallback, useState } from 'react';
import useParameter from '../../../../hooks/useParameter';
import { ControlWrapper, ParamName, ParamValue, SliderInput } from './ParameterControl.styles';

const ParameterControl = React.memo(({ eventId, eventInstance, overlapGroup, param }) => {
    const [paramDetails, handleParamChange] = useParameter({
        eventId,
        eventInstance,
        param,
        parent: overlapGroup
    });

    const [val, setVal] = useState(paramDetails.paramValue);

    const test = useCallback((e) => {
        setVal(e.target?.value);
    }, []);

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
                value={val}
                onChange={test}
                onMouseUp={handleParamChange}
            />
        </ControlWrapper>
    );
}, isEqual);

ParameterControl.propTypes = {
    eventInstance: PropTypes.object.isRequired,
    param: PropTypes.shape({
        maximum: PropTypes.number,
        minimum: PropTypes.number,
        name: PropTypes.string
    }).isRequired
};

export default ParameterControl;

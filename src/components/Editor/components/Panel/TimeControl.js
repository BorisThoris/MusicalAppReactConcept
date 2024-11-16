import { isNaN } from 'lodash';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useState } from 'react';

const TimeControl = ({ endTime, onModifyStartTime, startTime }) => {
    const [tempStartTime, setTempStartTime] = useState(0);

    useEffect(() => {
        setTempStartTime(startTime && startTime !== null ? startTime.toFixed(2) : 0);
    }, [startTime]);

    useEffect(() => {}, [endTime]);

    const handleStartTimeChange = useCallback(
        (e) => {
            const { value } = e.target;
            if (/^\d*\.?\d{0,2}$/.test(value)) {
                setTempStartTime(value);
                const numericValue = parseFloat(value);
                if (!isNaN(numericValue)) {
                    onModifyStartTime({ delta: numericValue - startTime });
                }
            }
        },
        [onModifyStartTime, startTime]
    );

    const incrementStartTime = useCallback(() => {
        const value = parseFloat(tempStartTime) + 0.01;
        setTempStartTime(value.toFixed(2));

        const delta = 0.01;

        onModifyStartTime({ delta });
    }, [onModifyStartTime, tempStartTime]);

    const decrementStartTime = useCallback(() => {
        const value = parseFloat(tempStartTime) - 0.01;
        setTempStartTime(value.toFixed(2));

        const delta = -0.01;
        onModifyStartTime({ delta });
    }, [onModifyStartTime, tempStartTime]);

    return (
        <div>
            <div>
                <span>Start:</span>
                <button onClick={decrementStartTime}>-</button>
                <input
                    type="text"
                    value={tempStartTime}
                    onChange={handleStartTimeChange}
                    style={{ textAlign: 'center', width: '50px' }}
                />
                <button onClick={incrementStartTime}>+</button>
            </div>
            <div>
                <div>End: {endTime}</div>
            </div>
        </div>
    );
};

TimeControl.propTypes = {
    endTime: PropTypes.number.isRequired,
    onModifyEndTime: PropTypes.func.isRequired,
    onModifyStartTime: PropTypes.func.isRequired,
    startTime: PropTypes.number.isRequired
};

export default TimeControl;

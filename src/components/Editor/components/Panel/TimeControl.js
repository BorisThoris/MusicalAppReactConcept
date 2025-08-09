/* eslint-disable jsx-a11y/label-has-associated-control */
import React, { useCallback, useMemo } from 'react';
import { usePixelRatio } from '../../../../providers/PixelRatioProvider/PixelRatioProvider';

const TimeControl = ({ endTime, onModifyStartTime, startTime }) => {
    const pixelToSecondRatio = usePixelRatio();

    const handleStartTimeChange = useCallback(
        (e) => {
            const newStartTime = parseFloat(e.target.value);
            if (!Number.isNaN(newStartTime)) {
                const delta = newStartTime - startTime / pixelToSecondRatio;
                onModifyStartTime({ delta });
            }
        },
        [onModifyStartTime, startTime, pixelToSecondRatio]
    );

    // Memoize the time input style to avoid creating new objects on every render
    const timeInputStyle = useMemo(
        () => ({
            textAlign: 'center',
            width: '50px'
        }),
        []
    );

    return (
        <div>
            <div>
                <span>Start:</span>
                <input
                    type="text"
                    value={startTime ? (startTime / pixelToSecondRatio).toFixed(2) : '0.00'}
                    onChange={handleStartTimeChange}
                    style={timeInputStyle}
                />
            </div>
            <div>
                <div>End: {endTime ? (endTime / pixelToSecondRatio).toFixed(2) : '0.00'}</div>
            </div>
        </div>
    );
};

export default TimeControl;

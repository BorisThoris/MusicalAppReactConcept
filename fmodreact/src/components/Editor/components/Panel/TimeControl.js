import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useState } from 'react';
import { TimeMarker } from './Panel.styles';

const TimeControl = ({ endTime, onModifyStartTime, startTime }) => {
  const [isAdjusting, setIsAdjusting] = useState(false);
  const [adjustmentType, setAdjustmentType] = useState(null);

  const handleMouseDown = useCallback((action) => {
    setIsAdjusting(true);
    setAdjustmentType(action);
  }, []);

  const handleMouseUp = useCallback(() => {
    setIsAdjusting(false);
    setAdjustmentType(null);
  }, []);

  useEffect(() => {
    let intervalId;
    if (isAdjusting && adjustmentType) {
      intervalId = setInterval(() => {
        const delta = adjustmentType === 'increment' ? 0.01 : -0.01;
        onModifyStartTime(delta);
      }, 100);
    }
    return () => clearInterval(intervalId);
  }, [isAdjusting, adjustmentType, onModifyStartTime]);

  const increment = useCallback(() => {
    handleMouseDown('increment');
  }, [handleMouseDown]);

  const decrement = useCallback(() => {
    handleMouseDown('decrement');
  }, [handleMouseDown]);

  return (
      <TimeMarker>
          <div>
              <button onMouseDown={decrement} onMouseUp={handleMouseUp}>
                  -
              </button>
              <button onMouseDown={increment} onMouseUp={handleMouseUp}>
                  +
              </button>
              <div>Start: {startTime}</div>
          </div>
          <div>End: {endTime}</div>
      </TimeMarker>
  );
};

TimeControl.propTypes = {
  endTime: PropTypes.number.isRequired,
  onModifyStartTime: PropTypes.func.isRequired,
  startTime: PropTypes.number.isRequired,
};

export default TimeControl;

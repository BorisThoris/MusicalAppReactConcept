import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useMemo } from 'react';
import { Layer, Line } from 'react-konva';
import pixelToSecondRatio from '../../../../globalConstants/pixelToSeconds';

const TimelineTracker = ({
    furthestEndTime,
    setTrackerPosition,
    shouldTrack,
    trackerPosition = 0,
}) => {
    const calculatePoints = useMemo(
        () => [0 + 40 / 2, 0, 0 + 40 / 2, window.innerHeight],
        []
    );

    const maxPosition = furthestEndTime * pixelToSecondRatio;

    useEffect(() => {
        if (shouldTrack) {
            const secondPerPixel = 1 / pixelToSecondRatio;
            const updateInterval = secondPerPixel * 1000;

            const interval = setInterval(() => {
                setTrackerPosition((prev) => {
                    const nextPosition = prev + 1;

                    return nextPosition < maxPosition
                        ? nextPosition
                        : maxPosition;
                });
            }, updateInterval);

            return () => clearInterval(interval);
        }
    }, [furthestEndTime, maxPosition, setTrackerPosition, shouldTrack]);

    const handleDragEndCallback = useCallback(
        (e) => {
            const newStartTime = e.target.x();

            setTrackerPosition(newStartTime);
        },
        [setTrackerPosition]
    );

    return (
        <Layer>
            <Line
                x={trackerPosition}
                draggable
                points={calculatePoints}
                stroke="red"
                strokeWidth={40}
                onDragEnd={handleDragEndCallback}
            />
        </Layer>
    );
};

TimelineTracker.propTypes = {
    furthestEndTime: PropTypes.number.isRequired,
    setTrackerPosition: PropTypes.func.isRequired,
    shouldTrack: PropTypes.bool.isRequired,
    trackerPosition: PropTypes.number,
};

export default TimelineTracker;

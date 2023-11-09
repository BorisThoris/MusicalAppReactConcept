import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useState } from 'react';
import { Layer, Line, Stage } from 'react-konva';
import pixelToSecondRatio from '../../../../globalConstants/pixelToSeconds';

const TimelineTracker = ({ furthestEndTime, shouldTrack }) => {
    const [trackerPosition, setTrackerPosition] = useState(0);

    const calculatePoints = useCallback(
        (passedTrackerPosition) => [
            passedTrackerPosition * pixelToSecondRatio,
            0,
            passedTrackerPosition * pixelToSecondRatio,
            window.innerHeight,
        ],
        []
    );

    const maxPosition = furthestEndTime * pixelToSecondRatio;

    useEffect(() => {
        if (!shouldTrack) {
            return;
        }

        const interval = setInterval(() => {
            setTrackerPosition((prev) => {
                const nextPosition = prev + 0.01;
                return nextPosition < maxPosition ? nextPosition : maxPosition;
            });
        }, 10);

        return () => clearInterval(interval);
    }, [furthestEndTime, maxPosition, shouldTrack]);

    useEffect(() => {
        if (!shouldTrack) {
            setTrackerPosition(0);
        }
    }, [shouldTrack]);

    const onDragEnd = useCallback(() => {}, []);

    return (
        <Layer>
            <Line
                points={calculatePoints(trackerPosition)}
                stroke="red"
                strokeWidth={40}
                onClick={onDragEnd}
            />
        </Layer>
    );
};

TimelineTracker.propTypes = {
    furthestEndTime: PropTypes.number.isRequired,
    shouldTrack: PropTypes.bool.isRequired,
};

export default TimelineTracker;

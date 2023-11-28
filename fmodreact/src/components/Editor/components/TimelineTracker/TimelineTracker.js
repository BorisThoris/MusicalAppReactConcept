import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { Layer, Line } from 'react-konva/es/ReactKonvaCore';
import pixelToSecondRatio from '../../../../globalConstants/pixelToSeconds';

const TimelineTracker = ({
    furthestEndTime,
    setTrackerPosition,
    shouldTrack,
    trackerPosition = 0,
}) => {
    const trackerRef = useRef();

    const calculatePoints = useMemo(
        () => [
            trackerPosition / pixelToSecondRatio / 2,
            0,
            trackerPosition / pixelToSecondRatio / 2,
            window.innerHeight,
        ],
        [trackerPosition]
    );

    useEffect(() => {
        if (shouldTrack && trackerRef?.current) {
            trackerRef.current.to({
                duration:
                    furthestEndTime - trackerPosition / pixelToSecondRatio,
                scaleY: Math.random() + 0.8,
                x: furthestEndTime * pixelToSecondRatio,
            });
        }
    }, [furthestEndTime, setTrackerPosition, shouldTrack, trackerPosition]);

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
                ref={trackerRef}
                x={trackerPosition}
                draggable
                points={calculatePoints}
                stroke="red"
                strokeWidth={10}
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

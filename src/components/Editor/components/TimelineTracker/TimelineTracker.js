import PropTypes from 'prop-types';
import React, { useCallback, useContext, useEffect, useMemo, useRef } from 'react';
import { Line } from 'react-konva/es/ReactKonvaCore';
import pixelToSecondRatio from '../../../../globalConstants/pixelToSeconds';
import { RecordingsPlayerContext } from '../../../../providers/RecordingsPlayerProvider';
import { TimelineContext } from '../../../../providers/TimelineProvider';

const TimelineTracker = ({ furthestEndTime, shouldTrack }) => {
    const trackerRef = useRef();

    const { timelineState } = useContext(TimelineContext);

    const { setTrackerPosition, trackerPosition } = useContext(RecordingsPlayerContext);

    const trackerPositionInSec = useMemo(() => trackerPosition / pixelToSecondRatio, [trackerPosition]);
    const trackerPositionInSecHalf = trackerPositionInSec / 2;

    const calculatePoints = useMemo(
        () => [trackerPositionInSecHalf, 0, trackerPositionInSecHalf, window.innerHeight],
        [trackerPositionInSecHalf]
    );

    useEffect(() => {
        if (shouldTrack && trackerRef?.current) {
            trackerRef.current.to({
                duration: furthestEndTime - trackerPositionInSec,
                scaleY: Math.random() + 0.8,
                x: furthestEndTime * pixelToSecondRatio
            });
        }
    }, [furthestEndTime, setTrackerPosition, shouldTrack, trackerPositionInSec]);

    useEffect(() => {
        if (!shouldTrack) {
            trackerRef.current.to({
                duration: 0,
                scaleY: Math.random() + 0.8,
                x: trackerPosition
            });
        }
    }, [shouldTrack, trackerPosition]);

    const handleDragEndCallback = useCallback(
        (e) => {
            const newStartTime = e.target.x();
            const normalizedNewStartTime = newStartTime > 0 ? newStartTime : 0;

            trackerRef.current.to({
                duration: 0,
                scaleY: Math.random() + 0.8,
                x: normalizedNewStartTime
            });

            setTrackerPosition(normalizedNewStartTime);
        },
        [setTrackerPosition]
    );

    const restrictVerticalMovement = useCallback(
        (pos) => ({
            x: pos.x,
            y: trackerRef.current.getAbsolutePosition().y
        }),
        []
    );

    return (
        <Line
            offset={timelineState.panelCompensationOffset}
            ref={trackerRef}
            x={trackerPosition}
            draggable
            dragBoundFunc={restrictVerticalMovement}
            points={calculatePoints}
            stroke="red"
            strokeWidth={10}
            onDragEnd={handleDragEndCallback}
        />
    );
};

TimelineTracker.propTypes = {
    furthestEndTime: PropTypes.number.isRequired,
    panelCompensationOffset: PropTypes.object,
    setTrackerPosition: PropTypes.func.isRequired,
    shouldTrack: PropTypes.bool.isRequired,
    trackerPosition: PropTypes.number
};

export default TimelineTracker;

import { get } from 'lodash';
import React, { useCallback, useContext, useEffect, useMemo, useRef } from 'react';
import { Line } from 'react-konva';
import pixelToSecondRatio from '../../../../globalConstants/pixelToSeconds';
import { CollisionsContext } from '../../../../providers/CollisionsProvider/CollisionsProvider';
import { useRecordingPlayerContext } from '../../../../providers/RecordingsPlayerProvider';
import { TimelineContext } from '../../../../providers/TimelineProvider';
import { useTrackerAnimation } from './useTrackerAnimation';
import { useCollisionDetection } from './useTrackerCollisionDetection';

const TimelineTracker = () => {
    const trackerRef = useRef();
    const { changePlaybackStatus, mutedInstruments, playbackStatus, setTrackerPosition, trackerPosition } =
        useRecordingPlayerContext();
    const { furthestEndTime, getProcessedElements, getProcessedItems } = useContext(CollisionsContext);
    const { timelineState } = useContext(TimelineContext);

    const totalDurationInPixels = useMemo(() => furthestEndTime * pixelToSecondRatio, [furthestEndTime]);
    const calculatePoints = useMemo(() => [0, 0, 0, window.innerHeight], []);

    const { playCollidedElements } = useCollisionDetection(
        trackerRef,
        getProcessedElements(),
        mutedInstruments,
        playbackStatus
    );

    const resetTrackerPosition = useCallback(() => {
        setTrackerPosition(-0.1);
    }, [setTrackerPosition]);

    const { moveTracker } = useTrackerAnimation(
        trackerRef,
        trackerPosition,
        playbackStatus,
        totalDurationInPixels,
        changePlaybackStatus,
        playCollidedElements,
        resetTrackerPosition
    );

    useEffect(() => {
        if (playbackStatus.isPlaying) {
            moveTracker();
        } else {
            setTrackerPosition(trackerRef.current.x());
        }
    }, [playbackStatus.isPlaying, moveTracker, setTrackerPosition]);

    const restrictVerticalMovement = useCallback(
        (pos) => ({
            x: Math.max(0, pos.x),
            y: get(trackerRef, 'current.getAbsolutePosition().y', 0)
        }),
        []
    );

    const handleDragEndCallback = useCallback(
        (e) => {
            const newStartTime = e.target.x();
            const normalizedNewStartTime = newStartTime > 0 ? newStartTime : 0;

            setTrackerPosition(normalizedNewStartTime);
        },
        [setTrackerPosition]
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

export default TimelineTracker;

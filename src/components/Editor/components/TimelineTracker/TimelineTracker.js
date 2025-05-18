import { get } from 'lodash';
import React, { useCallback, useContext, useEffect, useMemo, useRef } from 'react';
import { Line } from 'react-konva';
import { CollisionsContext } from '../../../../providers/CollisionsProvider/CollisionsProvider';
import { usePixelRatio } from '../../../../providers/PixelRatioProvider/PixelRatioProvider';
import { useRecordingPlayerContext } from '../../../../providers/RecordingsPlayerProvider';
import { TimelineContext } from '../../../../providers/TimelineProvider';
import { useTrackerAnimation } from './useTrackerAnimation';
import { useCollisionDetection } from './useTrackerCollisionDetection';

const TimelineTracker = () => {
    const pixelToSecondRatio = usePixelRatio();
    const trackerRef = useRef();
    const { changePlaybackStatus, mutedInstruments, playbackStatus, setTrackerPosition, trackerPosition } =
        useRecordingPlayerContext();
    const { furthestEndTime, processedItems } = useContext(CollisionsContext);
    const { timelineState } = useContext(TimelineContext);

    const totalDurationInPixels = useMemo(
        () => furthestEndTime * pixelToSecondRatio,
        [furthestEndTime, pixelToSecondRatio]
    );
    const calculatePoints = useMemo(() => [0, 0, 0, window.innerHeight], []);

    const { playCollidedElements } = useCollisionDetection(
        trackerRef,
        processedItems,
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
            strokeWidth={5}
            onDragEnd={handleDragEndCallback}
        />
    );
};

export default TimelineTracker;

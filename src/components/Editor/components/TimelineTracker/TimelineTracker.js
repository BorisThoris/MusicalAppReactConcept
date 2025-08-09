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
    const trackerRef = useRef(null);
    const { changePlaybackStatus, mutedInstruments, playbackStatus, setTrackerPosition, trackerPosition } =
        useRecordingPlayerContext();
    const { furthestEndTime, processedItems } = useContext(CollisionsContext);
    const { panelCompensationOffset } = useContext(TimelineContext);

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
        } else if (trackerRef.current) {
            setTrackerPosition(trackerRef.current.x());
        }
    }, [playbackStatus.isPlaying, moveTracker, setTrackerPosition]);

    const restrictVerticalMovement = useCallback((pos) => {
        if (pos && typeof pos.x === 'number' && typeof pos.y === 'number') {
            return {
                x: Math.max(0, pos.x),
                y: pos.y
            };
        }
        const currentY = trackerRef.current?.getAbsolutePosition?.()?.y || 0;
        return {
            x: Math.max(0, pos?.x || 0),
            y: currentY
        };
    }, []);

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
            offset={panelCompensationOffset}
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

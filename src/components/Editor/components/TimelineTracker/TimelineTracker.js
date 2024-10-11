import get from 'lodash/get';
import PropTypes from 'prop-types';
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Line } from 'react-konva';
import { playEventInstance } from '../../../../fmodLogic/eventInstanceHelpers';
import pixelToSecondRatio from '../../../../globalConstants/pixelToSeconds';
import { CollisionsContext } from '../../../../providers/CollisionsProvider/CollisionsProvider';
import { useRecordingPlayerContext } from '../../../../providers/RecordingsPlayerProvider';
import { TimelineContext } from '../../../../providers/TimelineProvider';

const TimelineTracker = ({ shouldTrack }) => {
    const trackerRef = useRef();
    const playedInstancesRef = useRef(new Set());
    const animationRef = useRef(null);
    const { changePlaybackStatus, mutedInstruments, playbackStatus, setTrackerPosition, trackerPosition } =
        useRecordingPlayerContext();
    const { findAllSoundEventElements, getProcessedElements } = useContext(CollisionsContext);
    const { timelineState } = useContext(TimelineContext);

    // Function to calculate the furthest end time by finding elements in the Konva stage
    const calculateFurthestEndTime = () => {
        const soundEventElements = findAllSoundEventElements();
        let maxEndX = 0;

        soundEventElements.forEach((element) => {
            const elementRect = element.getClientRect();
            const elementEndX = elementRect.x + elementRect.width;

            if (elementEndX > maxEndX) {
                maxEndX = elementEndX;
            }
        });

        // Convert the maximum X position back into seconds based on the pixelToSecondRatio
        return maxEndX / pixelToSecondRatio;
    };

    const furthestEndTime = calculateFurthestEndTime();

    const totalDurationInPixels = useMemo(() => furthestEndTime * pixelToSecondRatio, [furthestEndTime]);

    const calculatePoints = useMemo(() => [0, 0, 0, window.innerHeight], []);

    const haveIntersection = useCallback((r1, r2) => {
        return !(
            r2.x > r1.x + r1.width ||
            r2.x + r2.width < r1.x ||
            r2.y > r1.y + r1.height ||
            r2.y + r2.height < r1.y
        );
    }, []);

    const playCollidedElements = useCallback(() => {
        // Only process collision detection if playback is active
        if (!playbackStatus.isPlaying || !trackerRef.current) return;

        const trackerRect = trackerRef.current.getClientRect();
        const processedElements = getProcessedElements();

        let hasCollided = false;

        processedElements.forEach(({ element, recording }) => {
            const elementRect = element.getClientRect();
            const { eventInstance, instrumentName } = recording;

            const shouldPlay =
                haveIntersection(trackerRect, elementRect) &&
                !mutedInstruments.includes(instrumentName) &&
                !playedInstancesRef.current.has(eventInstance);

            const shouldStop =
                !haveIntersection(trackerRect, elementRect) && playedInstancesRef.current.has(eventInstance);

            if (shouldPlay) {
                playEventInstance(eventInstance);
                playedInstancesRef.current.add(eventInstance);
                hasCollided = true;
            } else if (shouldStop) {
                playedInstancesRef.current.delete(eventInstance);
            }
        });
    }, [getProcessedElements, mutedInstruments, haveIntersection, playbackStatus.isPlaying]);

    const moveTracker = useCallback(() => {
        if (!trackerRef.current) return;

        const startTimestamp = performance.now() - (trackerPosition / pixelToSecondRatio) * 1000;

        const animate = (currentTime) => {
            if (!trackerRef.current || !playbackStatus.isPlaying) return;

            const elapsedTime = (currentTime - startTimestamp) / 1000;
            const newTrackerPosition = Math.min(
                trackerPosition + elapsedTime * pixelToSecondRatio,
                totalDurationInPixels
            );

            trackerRef.current.x(newTrackerPosition);
            playCollidedElements();

            if (newTrackerPosition < totalDurationInPixels) {
                animationRef.current = requestAnimationFrame(animate);
            } else {
                changePlaybackStatus(false);
            }
        };

        animationRef.current = requestAnimationFrame(animate);
    }, [changePlaybackStatus, playCollidedElements, totalDurationInPixels, playbackStatus.isPlaying, trackerPosition]);

    useEffect(() => {
        if (shouldTrack && playbackStatus.isPlaying) {
            playedInstancesRef.current.clear();
            moveTracker();
        } else {
            cancelAnimationFrame(animationRef.current);
            animationRef.current = null;
        }
    }, [shouldTrack, playbackStatus.isPlaying, moveTracker]);

    const restrictVerticalMovement = useCallback(
        (pos) => ({
            x: Math.max(0, pos.x), // Ensure x is not lower than 0
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

TimelineTracker.propTypes = {
    shouldTrack: PropTypes.bool.isRequired
};

export default TimelineTracker;

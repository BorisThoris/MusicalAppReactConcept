import { useCallback, useContext } from 'react';
import { TimelineContext } from '../providers/TimelineProvider';

export const useTimeline = () => {
    const context = useContext(TimelineContext);

    if (!context) {
        throw new Error('useTimeline must be used within a TimelineProvider');
    }

    // Helper function to convert time to pixels
    const timeToPixels = useCallback(
        (timeInMs) => {
            return timeInMs / context.pixelToSecondRatio;
        },
        [context.pixelToSecondRatio]
    );

    // Helper function to convert pixels to time
    const pixelsToTime = useCallback(
        (pixels) => {
            return pixels * context.pixelToSecondRatio;
        },
        [context.pixelToSecondRatio]
    );

    // Helper function to get visible time range
    const getVisibleTimeRange = useCallback(() => {
        const startTime = context.scrollPosition;
        const endTime = startTime + window.innerWidth / context.zoomLevel;
        return { endTime, startTime };
    }, [context.scrollPosition, context.zoomLevel]);

    // Helper function to check if a time is visible
    const isTimeVisible = useCallback(
        (timeInMs) => {
            const { endTime, startTime } = getVisibleTimeRange();
            return timeInMs >= startTime && timeInMs <= endTime;
        },
        [getVisibleTimeRange]
    );

    // Helper function to scroll to make a time visible
    const ensureTimeVisible = useCallback(
        (timeInMs, padding = 100) => {
            const { endTime, startTime } = getVisibleTimeRange();
            const timeInPixels = timeToPixels(timeInMs);

            if (timeInMs < startTime) {
                // Scroll to show the time at the beginning with padding
                context.updateScrollPosition(timeInPixels - padding);
            } else if (timeInMs > endTime) {
                // Scroll to show the time at the end with padding
                context.updateScrollPosition(timeInPixels - window.innerWidth + padding);
            }
        },
        [context, getVisibleTimeRange, timeToPixels]
    );

    // Helper function to get timeline duration in pixels
    const getTimelineDurationPixels = useCallback(() => {
        return context.calculatedStageWidth;
    }, [context.calculatedStageWidth]);

    // Helper function to get timeline duration in milliseconds
    const getTimelineDurationMs = useCallback(() => {
        return context.calculatedStageWidth * context.pixelToSecondRatio;
    }, [context.calculatedStageWidth, context.pixelToSecondRatio]);

    return {
        ...context,
        ensureTimeVisible,
        getTimelineDurationMs,
        getTimelineDurationPixels,
        getVisibleTimeRange,
        isTimeVisible,
        pixelsToTime,
        timeToPixels
    };
};

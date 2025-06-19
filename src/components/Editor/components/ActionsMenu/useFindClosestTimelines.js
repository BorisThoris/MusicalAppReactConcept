import React, { useCallback, useContext, useEffect, useState } from 'react';
import { getElementScreenPosition } from '../../../../globalHelpers/getElementScreenPosition';
import { CollisionsContext } from '../../../../providers/CollisionsProvider/CollisionsProvider';
import { markersAndTrackerOffset } from '../../../../providers/TimelineProvider';

export const useFindClosestTimelines = ({ copiedEvents, isHovering, menuPosition }) => {
    const { stageRef } = useContext(CollisionsContext);
    const [closestTimelines, setClosestTimelines] = useState({});

    const findClosestTimeline = useCallback(
        (eventYPosition) => {
            let closestTimeline = null;
            let minDistance = Infinity;

            const allTimelineElements = stageRef.find((node) => node.attrs?.id?.includes('timelineRect'));

            allTimelineElements.forEach((timelineElement) => {
                const timelineBox = getElementScreenPosition(timelineElement);
                const distance = Math.abs(eventYPosition - (timelineBox.y + markersAndTrackerOffset));

                if (distance < minDistance) {
                    minDistance = distance;
                    closestTimeline = timelineElement;
                }
            });

            return closestTimeline;
        },
        [stageRef]
    );

    useEffect(() => {
        if (isHovering && copiedEvents.length > 0) {
            const tempClosestTimelines = {};

            // Get the initial position of the first copied event
            const initialEventPosition = copiedEvents[0].rect.y - markersAndTrackerOffset;

            copiedEvents.forEach((event, index) => {
                // Calculate each event's relative offset based on its natural position relative to the first event
                const relativeOffset = event.rect.y - initialEventPosition;

                // Position each event based on menuPosition plus its relative offset
                const eventYPosition = menuPosition.y + relativeOffset;

                const closestTimeline = findClosestTimeline(eventYPosition);

                tempClosestTimelines[`${event.id}`] = closestTimeline;
            });

            setClosestTimelines(tempClosestTimelines);
        } else {
            setClosestTimelines([]);
        }
    }, [findClosestTimeline, isHovering, copiedEvents, menuPosition]);

    return { closestTimelines, setClosestTimelines };
};

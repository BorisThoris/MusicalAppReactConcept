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

            const allTimelineElements = stageRef.current.find((node) => node.attrs?.id?.includes('timelineRect'));

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

            copiedEvents.forEach((event) => {
                const elementPos = event.element.attrs['data-timeline-y'] - markersAndTrackerOffset;
                const eventYPosition = menuPosition.y + elementPos;

                const closestTimeline = findClosestTimeline(eventYPosition);

                tempClosestTimelines[`${event.id}`] = closestTimeline;
            });

            setClosestTimelines(tempClosestTimelines);
        } else {
            setClosestTimelines([]);
        }
    }, [findClosestTimeline, isHovering, copiedEvents, menuPosition.y, menuPosition]);

    return { closestTimelines, setClosestTimelines };
};

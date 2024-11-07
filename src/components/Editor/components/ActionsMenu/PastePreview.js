import React, { useCallback, useContext, useEffect, useState } from 'react';
import styled from 'styled-components';
import pixelToSecondRatio from '../../../../globalConstants/pixelToSeconds';
import { getElementScreenPosition } from '../../../../globalHelpers/getElementScreenPosition';
import { CollisionsContext } from '../../../../providers/CollisionsProvider/CollisionsProvider';
import { markersAndTrackerOffset, TimelineHeight } from '../../../../providers/TimelineProvider';

const PreviewOverlay = styled.div`
    position: absolute;
    background: rgba(0, 0, 255, 0.3);
    height: 50px;
    z-index: 999;
    pointer-events: none;
    left: ${({ position }) => `${position.x}px`};
    top: ${({ position }) => `${position.y}px`};
    width: ${({ width }) => `${width}px`};
`;

const PasteOverview = ({ isHovering, menuPosition }) => {
    const { copiedEvents, stageRef } = useContext(CollisionsContext);
    const [closestTimeline, setClosestTimeline] = useState(null);

    const findClosestTimeline = useCallback(
        (position) => {
            let clTimeline = null;
            let minDistance = Infinity;

            const allTimelineElements = stageRef.current.find((node) => node.attrs?.id?.includes('Timeline-'));

            allTimelineElements.forEach((timelineElement) => {
                const timelineBox = getElementScreenPosition(timelineElement);

                const distance = Math.abs(position.y - TimelineHeight - timelineBox.y + markersAndTrackerOffset);
                if (distance < minDistance) {
                    minDistance = distance;
                    clTimeline = timelineElement;
                }
            });

            return clTimeline;
        },
        [stageRef]
    );

    useEffect(() => {
        if (isHovering) {
            setClosestTimeline(findClosestTimeline(menuPosition));
        } else {
            setClosestTimeline(null);
        }
    }, [findClosestTimeline, isHovering, menuPosition]);

    useEffect(() => {
        if (closestTimeline) {
            closestTimeline.fill('yellow');
            closestTimeline.getLayer().batchDraw();
        }

        return () => {
            if (closestTimeline) {
                closestTimeline.fill('white');
            }
        };
    }, [closestTimeline, isHovering]);

    if (!isHovering || copiedEvents.length === 0) return null;

    // Find the earliest start time in copied events to use as a baseline
    const baseStartTime = Math.min(...copiedEvents.map((e) => e.startTime));

    return (
        <>
            {copiedEvents.map((event, index) => {
                // Calculate the relative start position for each event based on the menu position
                const relativeStartX = (event.startTime - baseStartTime) * pixelToSecondRatio;
                const eventWidth = event.eventLength * pixelToSecondRatio;

                return (
                    <PreviewOverlay
                        key={index}
                        // eslint-disable-next-line react-perf/jsx-no-new-object-as-prop
                        position={{ x: relativeStartX, y: -60 }}
                        width={eventWidth}
                    />
                );
            })}
        </>
    );
};

export default PasteOverview;

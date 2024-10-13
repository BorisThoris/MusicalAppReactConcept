import { isEqual } from 'lodash';
import React, { useCallback, useContext, useLayoutEffect, useState } from 'react';
import { Group, Rect } from 'react-konva';
// Import the painting context
import pixelToSecondRatio from '../../../../globalConstants/pixelToSeconds';
import { CollisionsContext } from '../../../../providers/CollisionsProvider/CollisionsProvider';
import { usePaintings } from '../../../../providers/PaintingProvider';
import { SoundEventDragContext } from '../../../../providers/SoundEventDragProvider';
import { TimelineContext } from '../../../../providers/TimelineProvider';
import SoundEventElement from '../SoundEventElement/SoundEventElement';

export const TimelineEvents = React.memo(({ eventGroups, instrumentName, timelineHeight, timelineY }) => {
    const { timelineState } = useContext(TimelineContext);
    const { addTimelineRef, removeTimelineRef } = useContext(CollisionsContext);
    const { dragBoundFunc, handleDragEnd, handleDragMove, handleDragStart, isElementBeingDragged } =
        useContext(SoundEventDragContext);
    const { paintEvent } = usePaintings(); // Get the paintEvent method from PaintingProvider

    const timelineRef = React.useRef();
    const [paintedEvents, setPaintedEvents] = useState([]); // State to store dynamically painted events

    // Add timeline reference for collision detection or other contextual interactions
    useLayoutEffect(() => {
        const currentTimelineRef = timelineRef.current;

        if (currentTimelineRef) {
            currentTimelineRef.timelineY = timelineY;
            addTimelineRef(`${instrumentName}`, currentTimelineRef);
        }

        return () => {
            if (currentTimelineRef) {
                removeTimelineRef(instrumentName);
            }
        };
    }, [addTimelineRef, removeTimelineRef, instrumentName, timelineY]);

    // Function to render the newly painted event
    const renderEvent = useCallback((newEvent) => {
        setPaintedEvents((prevEvents) => [...prevEvents, newEvent]);
    }, []);

    // Function to handle click on timeline and create a new event
    const handleTimelineClick = useCallback(
        (e) => {
            const { x } = e.target.getStage().getPointerPosition();

            // Invoke the paintEvent method with the renderEvent callback
            paintEvent({
                renderEvent,
                target: instrumentName,
                x
            });
        },
        [paintEvent, instrumentName, renderEvent]
    );

    // Function to render SoundEventElement from paintedEvents
    const renderPaintedEvents = () => {
        return paintedEvents.map((event, index) => (
            <SoundEventElement
                key={event.id}
                timelineHeight={timelineHeight}
                recording={event} // Use event data for the recording
                index={index}
                timelineY={event.timelineY}
                handleDragEnd={handleDragEnd}
                handleDragStart={handleDragStart}
                dragBoundFunc={dragBoundFunc}
                handleDragMove={handleDragMove}
                isElementBeingDragged={isElementBeingDragged}
            />
        ));
    };

    return (
        <Group offset={timelineState.panelCompensationOffset} id={`${instrumentName}-events`} ref={timelineRef}>
            {/* Background rect to capture click events for painting */}
            <Rect
                x={0}
                y={0}
                width={180 * pixelToSecondRatio}
                height={timelineHeight}
                fill="green"
                onClick={handleTimelineClick}
            />

            {/* Paint existing SoundEventElements (from original eventGroups) */}
            {Object.values(eventGroups).map((groupData, index) => {
                return (
                    <SoundEventElement
                        key={groupData.id}
                        timelineHeight={timelineHeight}
                        recording={groupData}
                        index={index}
                        timelineY={timelineY}
                        handleDragEnd={handleDragEnd}
                        handleDragStart={handleDragStart}
                        dragBoundFunc={dragBoundFunc}
                        handleDragMove={handleDragMove}
                        isElementBeingDragged={isElementBeingDragged}
                    />
                );
            })}

            {/* Render dynamically painted events */}
            {renderPaintedEvents()}
        </Group>
    );
}, isEqual);

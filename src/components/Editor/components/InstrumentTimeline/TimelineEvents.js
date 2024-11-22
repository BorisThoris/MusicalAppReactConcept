import React, { useCallback, useContext, useLayoutEffect, useRef, useState } from 'react';
import { Group, Rect } from 'react-konva';
import pixelToSecondRatio from '../../../../globalConstants/pixelToSeconds';
import { CollisionsContext } from '../../../../providers/CollisionsProvider/CollisionsProvider';
import { usePaintings } from '../../../../providers/PaintingProvider';
import { SoundEventDragContext } from '../../../../providers/SoundEventDragProvider';
import { TimelineContext } from '../../../../providers/TimelineProvider';
import { GroupElement } from '../GroupElement/GroupElement';
import SoundEventElement from '../SoundEventElement/SoundEventElement';

export const TimelineEvents = React.memo(({ eventGroups, instrumentName, timelineHeight, timelineY }) => {
    const { timelineState } = useContext(TimelineContext);
    const { addTimelineRef, findGroupForEvent, removeTimelineRef } = useContext(CollisionsContext);
    const { dragBoundFunc, handleDragEnd, handleDragMove, handleDragStart, isElementBeingDragged } =
        useContext(SoundEventDragContext);
    const { paintEvent, paintingTarget } = usePaintings();

    const timelineRef = useRef();
    const [paintedEvents, setPaintedEvents] = useState([]);

    const handleDragEndWithOverlapCheck = useCallback(
        (e) => {
            handleDragEnd(e);
        },
        [handleDragEnd]
    );

    // Add timeline reference for collision detection
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

    // Render newly painted event
    const renderEvent = useCallback((newEvent) => {
        setPaintedEvents((prevEvents) => [...prevEvents, newEvent]);
    }, []);

    // Handle timeline click to create a new event
    const handleTimelineClick = useCallback(
        (e) => {
            const { x } = e.target.getStage().getPointerPosition();
            paintEvent({ renderEvent, target: instrumentName, x });
        },
        [paintEvent, instrumentName, renderEvent]
    );

    // Render dynamically painted events
    const renderPaintedEvents = () => {
        return paintedEvents.map((event, index) => (
            <SoundEventElement
                key={event.id}
                timelineHeight={timelineHeight}
                recording={event}
                index={index}
                timelineY={event.timelineY}
                handleDragEnd={handleDragEndWithOverlapCheck}
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
            {paintingTarget && (
                <Rect
                    x={0}
                    y={0}
                    width={180 * pixelToSecondRatio}
                    height={timelineHeight}
                    fill="transparent"
                    onClick={handleTimelineClick}
                />
            )}

            {/* Render existing SoundEventElements */}
            {Object.values(eventGroups).map((groupData, index) => {
                if (!groupData.overlapGroup) {
                    return (
                        <SoundEventElement
                            key={index}
                            timelineHeight={timelineHeight}
                            recording={groupData}
                            index={index}
                            timelineY={timelineY}
                            handleDragEnd={handleDragEndWithOverlapCheck}
                            handleDragStart={handleDragStart}
                            dragBoundFunc={dragBoundFunc}
                            handleDragMove={handleDragMove}
                            isElementBeingDragged={isElementBeingDragged}
                        />
                    );
                }

                return (
                    <GroupElement
                        key={index}
                        groupData={groupData}
                        index={index}
                        timelineY={timelineY}
                        handleDragEnd={handleDragEndWithOverlapCheck}
                        handleDragStart={handleDragStart}
                        dragBoundFunc={dragBoundFunc}
                        handleDragMove={handleDragMove}
                        isElementBeingDragged={isElementBeingDragged}
                        findGroupForEvent={findGroupForEvent}
                    />
                );
            })}

            {/* Render dynamically painted events */}
            {renderPaintedEvents()}
        </Group>
    );
});

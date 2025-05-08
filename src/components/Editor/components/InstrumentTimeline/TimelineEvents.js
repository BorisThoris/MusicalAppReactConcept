import React, { useCallback, useContext, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Group, Rect } from 'react-konva';
import { CollisionsContext } from '../../../../providers/CollisionsProvider/CollisionsProvider';
import { usePaintings } from '../../../../providers/PaintingProvider';
import { usePixelRatio } from '../../../../providers/PixelRatioProvider/PixelRatioProvider';
import { SoundEventDragContext } from '../../../../providers/SoundEventDragProvider';
import { TimelineContext } from '../../../../providers/TimelineProvider';
import { GroupElement } from '../GroupElement/GroupElement';
import SoundEventElement from '../SoundEventElement/SoundEventElement';

export const TimelineEvents = React.memo(({ eventGroups, instrumentName, timelineHeight, timelineY }) => {
    const pixelToSecondRatio = usePixelRatio();
    const { timelineState } = useContext(TimelineContext);
    const { addTimelineRef, removeTimelineRef } = useContext(CollisionsContext);
    const { handleDragEnd, handleDragMove, handleDragStart, isElementBeingDragged } = useContext(SoundEventDragContext);
    const { paintEvent, paintingTarget } = usePaintings();

    const timelineRef = useRef();
    const [paintedEvents, setPaintedEvents] = useState([]);

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

    useEffect(() => {
        return () => {
            setPaintedEvents([]);
        };
    }, [eventGroups]);

    // Render dynamically painted events
    const renderPaintedEvents = () => {
        return paintedEvents.map((event, index) => (
            <SoundEventElement
                key={event.id}
                timelineHeight={timelineHeight}
                recording={event}
                index={index}
                timelineY={event.timelineY}
                handleDragEnd={handleDragEnd}
                handleDragStart={handleDragStart}
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
                if (!groupData?.elements) {
                    return (
                        <SoundEventElement
                            key={index}
                            timelineHeight={timelineHeight}
                            recording={groupData}
                            index={index}
                            timelineY={timelineY}
                            handleDragEnd={handleDragEnd}
                            handleDragStart={handleDragStart}
                            handleDragMove={handleDragMove}
                            isElementBeingDragged={isElementBeingDragged}
                        />
                    );
                }

                return (
                    <GroupElement
                        key={index}
                        groupData={groupData}
                        timelineY={timelineY}
                        handleDragEnd={handleDragEnd}
                        handleDragStart={handleDragStart}
                        handleDragMove={handleDragMove}
                        isElementBeingDragged={isElementBeingDragged}
                    />
                );
            })}

            {/* Render dynamically painted events */}
            {renderPaintedEvents()}
        </Group>
    );
});

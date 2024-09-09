import { isEqual } from 'lodash';
import React, { useContext, useLayoutEffect } from 'react';
import { Group } from 'react-konva';
import { CollisionsContext } from '../../../../providers/CollisionsProvider/CollisionsProvider';
import { SoundEventDragContext } from '../../../../providers/SoundEventDragProvider';
import { TimelineContext } from '../../../../providers/TimelineProvider';
import { OverlapGroupElement } from '../OverlapGroupElement/OverlapGroupElement';
import SoundEventElement from '../SoundEventElement/SoundEventElement';

export const TimelineEvents = React.memo(({ eventGroups, instrumentName, timelineHeight, timelineY }) => {
    const { timelineState } = useContext(TimelineContext);

    const { addTimelineRef, removeTimelineRef } = useContext(CollisionsContext);
    const { dragBoundFunc, handleDragEnd, handleDragMove, handleDragStart, isElementBeingDragged } =
        useContext(SoundEventDragContext);

    const timelineRef = React.useRef();
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

    return (
        <Group offset={timelineState.panelCompensationOffset} id={`${instrumentName}-events`} ref={timelineRef}>
            {Object.values(eventGroups).map((groupData, index) => {
                const events = Object.values(groupData.events || {});

                if (events.length === 1) {
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
                }
                if (events.length > 1) {
                    return (
                        <OverlapGroupElement
                            key={`group-${index}`}
                            groupData={groupData}
                            index={index}
                            timelineHeight={timelineHeight}
                            timelineY={timelineY}
                            handleChildDragEnd={handleDragEnd}
                            handleChildDragStart={handleDragStart}
                            childDragBoundFunc={dragBoundFunc}
                            handleChildDragMove={handleDragMove}
                            isChildElementBeingDragged={isElementBeingDragged}
                        />
                    );
                }

                return null;
            })}
        </Group>
    );
}, isEqual);

export default TimelineEvents;

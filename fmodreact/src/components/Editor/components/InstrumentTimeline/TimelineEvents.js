import { isEqual } from 'lodash';
import React, { useContext, useLayoutEffect } from 'react';
import { Group } from 'react-konva';
import { CollisionsContext } from '../../../../providers/CollisionsProvider/CollisionsProvider';
import { TimelineContext } from '../../../../providers/TimelineProvider';
import { OverlapGroupElement } from '../OverlapGroupElement/OverlapGroupElement';
import SoundEventElement from '../SoundEventElement/SoundEventElement';

export const TimelineEvents = React.memo(({ eventGroups, instrumentName, timelineHeight, timelineY }) => {
    const { timelineState } = useContext(TimelineContext);

    const { addTimelineRef, removeTimelineRef } = useContext(CollisionsContext);
    const timelineRef = React.useRef(); // Ref for the entire timeline group

    useLayoutEffect(() => {
        const currentTimelineRef = timelineRef.current; // Capture the current ref value

        if (currentTimelineRef) {
            currentTimelineRef.timelineY = timelineY; // Attach timelineY to the ref
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
                        />
                    );
                }

                return null;
            })}
        </Group>
    );
}, isEqual);

export default TimelineEvents;

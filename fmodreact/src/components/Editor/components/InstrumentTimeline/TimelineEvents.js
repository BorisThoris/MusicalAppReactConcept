import React, { useContext } from 'react';
import { Group } from 'react-konva';
import { TimelineContext } from '../../../../providers/TimelineProvider';
import OverlapGroupElement from '../OverlapGroupElement/OverlapGroupElement';
import SoundEventElement from '../SoundEventElement/SoundEventElement';

export const TimelineEvents = ({ eventGroups, timelineHeight, timelineY }) => {
    const { timelineState } = useContext(TimelineContext);

    return (
        <Group offset={timelineState.panelCompensationOffset}>
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
};

export default TimelineEvents;

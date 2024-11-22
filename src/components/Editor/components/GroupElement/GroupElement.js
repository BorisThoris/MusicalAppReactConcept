import React from 'react';
import { Group } from 'react-konva';
import { TimelineHeight } from '../../../../providers/TimelineProvider';
import SoundEventElement from '../SoundEventElement/SoundEventElement';

export const GroupElement = ({
    dragBoundFunc,
    groupData,
    handleDragEnd,
    handleDragMove,
    handleDragStart,
    isElementBeingDragged,
    timelineY
}) => {
    const groupEvents = Object.values(groupData.overlapGroup);
    const groupLength = groupEvents.length;

    return (
        <Group>
            {groupEvents.map((event, index) => (
                <SoundEventElement
                    key={event.id}
                    timelineHeight={TimelineHeight}
                    recording={event}
                    index={index}
                    timelineY={timelineY}
                    handleDragEnd={handleDragEnd}
                    handleDragStart={handleDragStart}
                    dragBoundFunc={dragBoundFunc}
                    handleDragMove={handleDragMove}
                    isElementBeingDragged={isElementBeingDragged}
                    // eslint-disable-next-line react-perf/jsx-no-new-object-as-prop
                    groupChild={{
                        index,
                        scale: (index + 1) / groupLength
                    }}
                />
            ))}
        </Group>
    );
};

export default GroupElement;

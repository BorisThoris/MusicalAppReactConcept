import React, { useCallback, useRef } from 'react';
import { Group } from 'react-konva';
import pixelToSecondRatio from '../../../../globalConstants/pixelToSeconds';
import { TimelineHeight } from '../../../../providers/TimelineProvider';
import { Lock } from '../Lock/Lock';
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
    const groupRef = useRef();
    const { id, locked, overlapGroup, startTime } = groupData;

    const groupX = startTime * pixelToSecondRatio;
    const groupEvents = Object.values(overlapGroup);
    const groupLength = groupEvents.length;

    const onLockSoundEventElement = useCallback(() => {
        if (!groupRef.current) return;

        const prevData = groupRef.current.attrs['data-overlap-group'];

        groupRef.current.setAttrs({
            'data-overlap-group': { ...prevData, locked: !prevData.locked }
        });
    }, []);

    console.log('GROUPDATA', groupData);
    console.log('GROUP LOCKED: ', locked);

    return (
        <Group x={groupX} data-overlap-group={groupData} ref={groupRef} id={`overlap-group-${id}`}>
            <Group offsetX={groupX}>
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

            <Lock isLocked={locked} onClick={onLockSoundEventElement} />
        </Group>
    );
};

export default GroupElement;

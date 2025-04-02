import { isEqual } from 'lodash';
import React, { useCallback, useMemo, useRef } from 'react';
import { Group, Text } from 'react-konva';
import { GROUP_ELEMENT_ID_PREFIX } from '../../../../globalConstants/elementIds';
import pixelToSecondRatio from '../../../../globalConstants/pixelToSeconds';
import { TimelineHeight } from '../../../../providers/TimelineProvider';
import { Lock } from '../Lock/Lock';
import SoundEventElement from '../SoundEventElement/SoundEventElement';

export const GroupElement = React.memo(
    ({
        dragBoundFunc,
        groupData,
        handleDragEnd,
        handleDragMove,
        handleDragStart,
        isElementBeingDragged,
        timelineY
    }) => {
        const groupRef = useRef();
        const { elements, id, locked, startTime } = groupData;

        // Calculate the initial X position of the group based on its start time.
        const groupX = startTime * pixelToSecondRatio || 100;

        // Sort the group events to maintain a consistent order.
        const groupEvents = useMemo(() => {
            return Object.values(elements).sort((a, b) => a.startTime - b.startTime);
        }, [elements]);

        const groupLength = groupEvents.length;

        // Toggle the group's locked state.
        const onLockGroup = useCallback(() => {
            if (!groupRef.current) return;
            const prevData = groupRef.current.attrs['data-overlap-group'];
            groupRef.current.setAttrs({
                'data-overlap-group': { ...prevData, locked: !prevData.locked }
            });
            groupRef.current.getLayer().draw();
        }, []);

        const groupId = `${GROUP_ELEMENT_ID_PREFIX}${id}`;

        // Optional: Function to toggle selection state (if needed)
        const toggleSelection = useCallback(() => {
            const prevData = groupRef.current.attrs['data-data-overlap-group'];
            const updatedState = { ...prevData, isSelected: true };
            groupRef.current.setAttrs({
                'data-recording': updatedState
            });
            groupRef.current.getLayer().draw();
        }, []);

        // Optional: Click handler (if you want to add additional click behavior)
        const onGroupClick = useCallback(() => {}, []);

        return (
            <Group
                x={groupX}
                data-overlap-group={groupData}
                ref={groupRef}
                data-group-id={groupId}
                id={groupId}
                onClick={onGroupClick}
                // Make the group draggable only if it is locked.
                draggable={locked}
                // Attach drag handlers from the drag provider if the group is locked.
                onDragStart={locked ? handleDragStart : undefined}
                onDragMove={locked ? handleDragMove : undefined}
                onDragEnd={locked ? handleDragEnd : undefined}
            >
                <Text x={5} y={-15} text={`GROUP ${groupId}`} fill="black" fontSize={15} listening={false} />

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
                            childScale={(index + 1) / groupLength}
                            groupRef={groupRef.current}
                            parentGroupId={groupId}
                        />
                    ))}
                </Group>

                <Lock isLocked={locked} onClick={onLockGroup} />
            </Group>
        );
    },
    isEqual
);

export default GroupElement;

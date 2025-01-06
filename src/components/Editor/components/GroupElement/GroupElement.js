import { isEqual } from 'lodash';
import React, { useCallback, useRef } from 'react';
import { Group } from 'react-konva';
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

        const groupX = startTime * pixelToSecondRatio || 100;

        const groupEvents = Object.values(elements).sort((a, b) => {
            return a.startTime - b.startTime;
        });
        const groupLength = groupEvents.length;

        const onLockSoundEventElement = useCallback(() => {
            if (!groupRef.current) return;

            const prevData = groupRef.current.attrs['data-overlap-group'];

            groupRef.current.setAttrs({
                'data-overlap-group': { ...prevData, locked: !prevData.locked }
            });
            groupRef.current.getLayer().draw();
        }, []);

        return (
            <Group x={groupX} data-overlap-group={groupData} ref={groupRef} id={`overlap-group-${id}`}>
                <Group offsetX={groupX}>
                    {groupEvents.map((event, index) => {
                        return (
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
                                childScale={(index + 1) / groupLength}
                                groupRef={groupRef.current}
                            />
                        );
                    })}
                </Group>

                <Lock isLocked={locked} onClick={onLockSoundEventElement} />
            </Group>
        );
    },
    isEqual
);

export default GroupElement;

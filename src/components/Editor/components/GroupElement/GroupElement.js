import { isEqual } from 'lodash';
import React, { useCallback, useContext, useMemo, useRef } from 'react';
import { Group, Rect, Text } from 'react-konva';
import { GROUP_ELEMENT_ID_PREFIX } from '../../../../globalConstants/elementIds';
import { Portal } from '../../../../globalHelpers/Portal';
import { usePixelRatio } from '../../../../providers/PixelRatioProvider/PixelRatioProvider';
import { SelectionContext } from '../../../../providers/SelectionsProvider';
import { TimelineHeight } from '../../../../providers/TimelineProvider';
import { Lock } from '../Lock/Lock';
import SoundEventElement from '../SoundEventElement/SoundEventElement';

export const GroupElement = React.memo(
    ({ groupData, handleDragEnd, handleDragMove, handleDragStart, isElementBeingDragged, timelineY }) => {
        const pixelToSecondRatio = usePixelRatio();
        const groupRef = useRef();
        const portalRef = useRef(null);
        const { isItemSelected } = useContext(SelectionContext);

        const { elements, eventLength, id, locked, startTime } = groupData;

        const shouldSelect = isItemSelected(id); // Main group selection

        const groupEvents = useMemo(
            () => Object.values(elements).sort((a, b) => a.startTime - b.startTime),
            [elements]
        );

        const groupLength = groupEvents.length;

        const onLockGroup = useCallback(() => {
            if (!groupRef.current) return;
            const prevData = groupRef.current.attrs['data-overlap-group'];
            groupRef.current.setAttrs({
                'data-overlap-group': { ...prevData, locked: !prevData.locked }
            });
            groupRef.current.getLayer().draw();
        }, []);

        const groupId = `${GROUP_ELEMENT_ID_PREFIX}${id}`;
        const isDragging = isElementBeingDragged(groupId);
        const controlledPositionProps = !isDragging ? { x: startTime * pixelToSecondRatio, y: 0 } : {};
        const lengthBasedWidth = eventLength * pixelToSecondRatio;

        const isDraggable = shouldSelect || locked;

        return (
            <Portal selector=".top-layer" enabled={isDragging} outerRef={portalRef}>
                <Group
                    y={isDragging ? timelineY : 0}
                    ref={groupRef}
                    data-overlap-group={groupData}
                    name={groupId}
                    data-group-id={groupId}
                    id={groupId}
                    draggable={isDraggable}
                    onDragStart={isDraggable ? handleDragStart : undefined}
                    onDragMove={isDraggable ? handleDragMove : undefined}
                    onDragEnd={isDraggable ? handleDragEnd : undefined}
                    {...controlledPositionProps}
                >
                    <Rect
                        x={0}
                        y={0}
                        width={lengthBasedWidth + 100}
                        height={TimelineHeight}
                        fill={shouldSelect ? 'red' : 'transparent'}
                    />

                    <Text x={5} y={-15} text={`GROUP ${groupId}`} fill="black" fontSize={15} listening={false} />

                    <Group offsetX={startTime * pixelToSecondRatio}>
                        {groupEvents.map((event, index) => (
                            <SoundEventElement
                                key={event.id}
                                timelineHeight={TimelineHeight}
                                recording={event}
                                index={index}
                                timelineY={timelineY}
                                handleDragEnd={handleDragEnd}
                                handleDragStart={handleDragStart}
                                handleDragMove={handleDragMove}
                                isElementBeingDragged={isElementBeingDragged}
                                childScale={(index + 1) / groupLength}
                                groupRef={groupRef}
                                parentGroupId={groupId}
                                isSelected={isItemSelected(event.id)}
                            />
                        ))}
                    </Group>

                    <Lock isLocked={locked} onClick={onLockGroup} />
                </Group>
            </Portal>
        );
    },
    isEqual
);

export default GroupElement;

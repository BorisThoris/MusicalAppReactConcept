import { isEqual } from 'lodash';
import React, { useCallback, useContext, useEffect, useMemo, useRef } from 'react';
import { Group, Text } from 'react-konva';
import { GROUP_ELEMENT_ID_PREFIX } from '../../../../globalConstants/elementIds';
import { Portal } from '../../../../globalHelpers/Portal';
import { usePixelRatio } from '../../../../providers/PixelRatioProvider/PixelRatioProvider';
import { SelectionContext } from '../../../../providers/SelectionsProvider';
import { TimelineHeight } from '../../../../providers/TimelineProvider';
import { Lock } from '../Lock/Lock';
import SoundEventElement from '../SoundEventElement/SoundEventElement';

export const GroupElement = React.memo(
    ({ groupData, handleDragEnd, handleDragMove, handleDragStart, isElementBeingDragged, timelineY }) => {
        const { elements, id, locked, startTime } = groupData;

        const pixelToSecondRatio = usePixelRatio();
        const groupRef = useRef();
        const portalRef = useRef(null);

        const stableInitialIdRef = useRef(id);
        const initialId = stableInitialIdRef.current;

        const { isItemSelected, updateSelectedItemById } = useContext(SelectionContext);

        const isSelected = isItemSelected(initialId);
        const groupId = `${GROUP_ELEMENT_ID_PREFIX}${id}`;
        const isDragging = isElementBeingDragged(groupId);
        const isDraggable = isSelected || locked;

        const groupEvents = useMemo(
            () => Object.values(elements).sort((a, b) => a.startTime - b.startTime),
            [elements]
        );

        const groupLength = groupEvents.length;

        const selectedGroup = useMemo(
            () => ({
                ...groupData,
                element: groupRef.current,
                initialId,
                isSelected
            }),
            [groupData, initialId, isSelected]
        );

        const onLockGroup = useCallback((e) => {
            e.cancelBubble = true;
            if (!groupRef.current) return;
            const prevData = groupRef.current.attrs['data-overlap-group'];
            groupRef.current.setAttrs({ 'data-overlap-group': { ...prevData, locked: !prevData.locked } });
            groupRef.current.getLayer().draw();
        }, []);

        useEffect(() => {
            const node = groupRef.current;
            if (!node) return;

            updateSelectedItemById({
                id,
                isSelected: selectedGroup.isSelected,
                updates: selectedGroup
            });

            if (initialId !== id) {
                stableInitialIdRef.current = id;
            }

            return () => {
                updateSelectedItemById({
                    id,
                    isSelected: false,
                    updates: { ...selectedGroup }
                });
            };
        }, [id, initialId, selectedGroup, updateSelectedItemById]);

        const controlledPositionProps = !isDragging ? { x: startTime * pixelToSecondRatio, y: 0 } : {};

        return (
            <Portal selector=".top-layer" enabled={isDragging} outerRef={portalRef}>
                <Group
                    y={isDragging ? timelineY : 0}
                    ref={groupRef}
                    data-overlap-group={selectedGroup}
                    name={groupId}
                    data-group-id={groupId}
                    id={groupId}
                    draggable={isDraggable}
                    onDragStart={isDraggable ? handleDragStart : undefined}
                    onDragMove={isDraggable ? handleDragMove : undefined}
                    onDragEnd={isDraggable ? handleDragEnd : undefined}
                    {...controlledPositionProps}
                    fill={'green'}
                >
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

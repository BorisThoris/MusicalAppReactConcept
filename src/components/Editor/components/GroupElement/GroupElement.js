import { isEqual } from 'lodash';
import React, { useCallback, useContext, useEffect, useMemo, useRef } from 'react';
import { Group } from 'react-konva';
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
        const { isItemSelected, selectedItems, toggleItem, updateSelectedItemById } = useContext(SelectionContext);

        const { elements, eventLength, id, locked, startTime } = groupData;

        // Stable initialId tracking and updating
        const stableInitialIdRef = useRef(id);
        const initialId = stableInitialIdRef.current;

        const isSelected = isItemSelected(initialId); // Use stable ID for selection

        const groupEvents = useMemo(
            () => Object.values(elements).sort((a, b) => a.startTime - b.startTime),
            [elements]
        );

        const groupLength = groupEvents.length;

        const onLockGroup = useCallback((e) => {
            e.cancelBubble = true;

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

        const isDraggable = isSelected || locked;
        const shouldSelect = isDraggable;

        const selectedGroup = useMemo(() => {
            return {
                ...groupData,
                initialId,
                isSelected: shouldSelect
            };
        }, [groupData, initialId, shouldSelect]);

        useEffect(() => {
            const groupNode = groupRef.current;
            if (!groupNode) return;

            // On mount: update selection state
            updateSelectedItemById({
                id,
                isSelected: selectedGroup.isSelected,
                updates: selectedGroup
            });

            // Update the stable initialId if the ID changed
            if (initialId !== id) {
                stableInitialIdRef.current = id;
            }

            // On unmount: update or clean up selection
            return () => {
                const cleanupUpdates = {
                    ...selectedGroup
                };

                updateSelectedItemById({
                    id,
                    isSelected: false,
                    updates: cleanupUpdates
                });
            };
        }, [groupEvents, id, initialId, selectedGroup, updateSelectedItemById]);

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

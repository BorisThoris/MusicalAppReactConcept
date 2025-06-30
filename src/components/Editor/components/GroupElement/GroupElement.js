import { isEqual } from 'lodash';
import React, { useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { Group, Text } from 'react-konva';
import { GROUP_ELEMENT_ID_PREFIX } from '../../../../globalConstants/elementIds';
import { KonvaHtml } from '../../../../globalHelpers/KonvaHtml';
import { Portal } from '../../../../globalHelpers/Portal';
import { usePixelRatio } from '../../../../providers/PixelRatioProvider/PixelRatioProvider';
import { SelectionContext } from '../../../../providers/SelectionsProvider';
import { TimelineHeight } from '../../../../providers/TimelineProvider';
import { Lock } from '../Lock/Lock';
import SoundEventElement from '../SoundEventElement/SoundEventElement';

export const GroupElement = React.memo(
    ({ groupData, handleDragEnd, handleDragMove, handleDragStart, isElementBeingDragged, timelineY }) => {
        const { elements, id, isSelected: dataIsSelected, locked, startTime } = groupData;

        const pixelToSecondRatio = usePixelRatio();
        const groupRef = useRef();
        const portalRef = useRef(null);
        const hasToggledRef = useRef(false);
        const stableInitialIdRef = useRef(id);
        const initialId = stableInitialIdRef.current;

        const { isItemSelected, toggleItem, updateSelectedItemById } = useContext(SelectionContext);

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

        const handleToggle = useCallback(() => {
            toggleItem({ ...selectedGroup, element: groupRef.current });
        }, [selectedGroup, toggleItem]);

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

        useEffect(() => {
            const shouldToggle = !isSelected && dataIsSelected;
            if (shouldToggle && !hasToggledRef.current) {
                toggleItem({ ...selectedGroup, element: groupRef.current });
                hasToggledRef.current = true;
            }
        }, [dataIsSelected, isSelected, selectedGroup, toggleItem]);

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

                    <KonvaHtml
                        // eslint-disable-next-line react/no-children-prop
                        children={
                            <button
                                // eslint-disable-next-line react-perf/jsx-no-new-function-as-prop
                                onClick={handleToggle}
                                style={{
                                    background: '#222',
                                    border: '1px solid #555',
                                    borderRadius: 4,
                                    color: '#fff',
                                    cursor: 'pointer',
                                    padding: '8px 12px',
                                    position: 'absolute',
                                    right: 10,
                                    top: 10,
                                    zIndex: 9999
                                }}
                            >
                                Toggle Test Element
                            </button>
                        }
                    />

                    <Lock isLocked={locked} onClick={onLockGroup} />
                </Group>
            </Portal>
        );
    },
    isEqual
);

export default GroupElement;

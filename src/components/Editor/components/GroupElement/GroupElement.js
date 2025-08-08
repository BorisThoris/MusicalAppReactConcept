// GroupElement.jsx
// @ts-nocheck

import { isEqual } from 'lodash';
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Group, Rect } from 'react-konva';
import { GROUP_ELEMENT_ID_PREFIX } from '../../../../globalConstants/elementIds';
import { KonvaHtml } from '../../../../globalHelpers/KonvaHtml';
import { Portal } from '../../../../globalHelpers/Portal';
import { usePixelRatio } from '../../../../providers/PixelRatioProvider/PixelRatioProvider';
import { SelectionContext } from '../../../../providers/SelectionsProvider';
import { TimelineContext, TimelineHeight } from '../../../../providers/TimelineProvider';
import SoundEventElement from '../SoundEventElement/SoundEventElement';
import { GroupTopHeader } from './GroupTopHeader';

/* --------------------------------- CONSTS --------------------------------- */
const RADIUS = 10;
const OPACITY = 0.96;
const HEADER_H = 28; // px

export const GroupElement = React.memo(
    ({ groupData, handleDragEnd, handleDragMove, handleDragStart, isElementBeingDragged, timelineY }) => {
        const { elements, eventLength, id, locked, startTime } = groupData;

        const pixelToSecondRatio = usePixelRatio();
        const { isItemSelected, updateSelectedItemById } = useContext(SelectionContext);
        const { timelineState } = useContext(TimelineContext);

        const groupRef = useRef(null);
        const portalRef = useRef(null);

        const width = eventLength * pixelToSecondRatio;

        const stableInitialIdRef = useRef(id);
        const initialId = stableInitialIdRef.current;

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
            const node = groupRef.current;
            if (!node) return;
            const prevData = node.attrs['data-overlap-group'] || {};
            node.setAttrs({ 'data-overlap-group': { ...prevData, locked: !prevData.locked } });
            node.getLayer()?.draw();
        }, []);

        useEffect(() => {
            const node = groupRef.current;
            if (!node) return;

            // Only update selection state if the group is actually selected
            // Don't auto-update when ID changes due to moving between timelines
            if (isSelected) {
                updateSelectedItemById({ id, isSelected: true, updates: selectedGroup });
            }

            if (initialId !== id) stableInitialIdRef.current = id;

            return () => {
                // Only clear selection if the group was actually selected
                if (isSelected) {
                    updateSelectedItemById({ id, isSelected: false, updates: { ...selectedGroup } });
                }
            };
        }, [id, initialId, selectedGroup, updateSelectedItemById, isSelected]);

        // Let Konva own Y while dragging so you can move between lanes
        const controlledPositionProps = !isDragging
            ? { x: startTime * pixelToSecondRatio, y: 0 }
            : { x: undefined, y: undefined };

        // Clamp X only - but don't constrain during drag to allow precise positioning
        const contentWidth = timelineState?.contentWidth ?? timelineState?.width ?? timelineState?.timelineWidth ?? 1e9;

        const dragBoundFunc = useCallback(
            (pos) => {
                // Only apply bounds when not actively dragging to allow precise positioning
                if (isDragging) {
                    return pos; // Allow free movement during drag
                }
                const minX = 0;
                const maxX = Math.max(0, contentWidth - width);
                const x = Math.min(Math.max(pos.x, minX), maxX);
                return { x, y: pos.y };
            },
            [contentWidth, width, isDragging]
        );

        const baseBg = '#ffffff';
        const lenLabel = typeof eventLength === 'number' ? `${eventLength.toFixed(2)}s` : `${String(eventLength)}s`;
        const [expanded, setExpanded] = useState(true);

        const handleChevronClick = useCallback((e) => {
            e.stopPropagation();
            setExpanded((v) => !v);
        }, []);

        const handleLockClick = useCallback(
            (e) => {
                e.stopPropagation();
                onLockGroup(e);
            },
            [onLockGroup]
        );

        return (
            <Portal selector=".top-layer" enabled={isDragging} outerRef={portalRef}>
                <Group
                    ref={groupRef}
                    data-overlap-group={selectedGroup}
                    name={groupId}
                    data-group-id={groupId}
                    id={groupId}
                    draggable={isDraggable}
                    dragBoundFunc={isDraggable ? dragBoundFunc : undefined}
                    onDragStart={isDraggable ? handleDragStart : undefined}
                    onDragMove={isDraggable ? handleDragMove : undefined}
                    onDragEnd={isDraggable ? handleDragEnd : undefined}
                    {...controlledPositionProps}
                >
                    {/* 0) Hit area */}

                    <Rect
                        x={0}
                        y={0}
                        width={width}
                        height={TimelineHeight}
                        fill="rgba(0,0,0,0.01)"
                        cornerRadius={RADIUS}
                        listening
                        perfectDrawEnabled={false}
                    />

                    {/* 2) Children (between overlays) */}
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
                    {/* 3) Top header (above children) */}
                    <GroupTopHeader
                        width={width}
                        isSelected={isSelected}
                        locked={locked}
                        groupId={id}
                        groupLength={groupLength}
                        lenLabel={lenLabel}
                        expanded={expanded}
                        onToggleExpand={handleChevronClick}
                        onToggleLock={handleLockClick}
                    />
                </Group>
            </Portal>
        );
    },
    isEqual
);

export default GroupElement;

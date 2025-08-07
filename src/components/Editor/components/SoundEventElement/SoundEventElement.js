// SoundEventElement.jsx
// @ts-nocheck

import get from 'lodash/get';
import isEqual from 'lodash/isEqual';
import PropTypes from 'prop-types';
import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Group, Rect } from 'react-konva';
import { ELEMENT_ID_PREFIX } from '../../../../globalConstants/elementIds';
import { KonvaHtml } from '../../../../globalHelpers/KonvaHtml';
import { Portal } from '../../../../globalHelpers/Portal';
import { CollisionsContext } from '../../../../providers/CollisionsProvider/CollisionsProvider';
import { usePixelRatio } from '../../../../providers/PixelRatioProvider/PixelRatioProvider';
import { SelectionContext } from '../../../../providers/SelectionsProvider';
import { TimelineContext } from '../../../../providers/TimelineProvider';
import { useCursorEffects } from './hooks/useCursorEffects';
import { useUnifiedDynamicStyles } from './hooks/useDynamicStyles';
import { useEventFocus } from './hooks/useEventFocus';
import { useClickHandlers } from './useEventClickHandlers';

const RADIUS = 8;
const OPACITY = 0.8;

const SoundEventElement = React.memo((props) => {
    const {
        childScale,
        groupRef,
        handleDragEnd,
        handleDragMove,
        handleDragStart,
        index,
        isElementBeingDragged,
        listening,
        parentGroupId,
        recording,
        timelineHeight,
        timelineY
    } = props;

    const { eventLength, id, isSelected: dataIsSelected, locked, name, startTime } = recording;
    const pixelToSecondRatio = usePixelRatio();
    const { isItemSelected, toggleItem, updateSelectedItemById } = useContext(SelectionContext);
    const { timelineState } = useContext(TimelineContext);
    const { getGroupById } = useContext(CollisionsContext);
    const parent = getGroupById(parentGroupId);

    const containerRef = useRef();
    const portalRef = useRef();
    const [originalZ, setOriginalZ] = useState(null);

    const { handleMouseEnter, isFocused, restoreZIndex } = useEventFocus(id);
    const { handleClick, handleContextMenu, handleDelete, handleDoubleClick } = useClickHandlers({
        elementContainerRef: containerRef,
        parent,
        recording,
        toggleItem
    });

    const isSelected = isItemSelected(id);
    const isDragging = isElementBeingDragged(`${ELEMENT_ID_PREFIX}${id}`);
    const parentData = groupRef?.current?.attrs['data-overlap-group'];
    const shouldDrag = !parentData?.locked && !parentData?.isSelected;
    const shouldUsePortal = isDragging && !locked && !!groupRef;

    const width = eventLength * pixelToSecondRatio;
    const position = isDragging ? {} : { x: startTime * pixelToSecondRatio, y: 0 };

    const unifiedDynamicStyles = useUnifiedDynamicStyles({
        childScale,
        groupRef,
        isFocused,
        isSelected,
        shouldDrag,
        timelineHeight
    });
    const { withCursor } = useCursorEffects();

    const selectedRecording = useMemo(
        () => ({ ...recording, isSelected: isSelected || false }),
        [recording, isSelected]
    );

    const prevRecordingRef = useRef();

    useEffect(() => {
        if (!containerRef.current || parentGroupId) return;
        if (!isEqual(prevRecordingRef.current, selectedRecording)) {
            updateSelectedItemById({
                id,
                isSelected: selectedRecording.isSelected,
                updates: selectedRecording
            });
            prevRecordingRef.current = selectedRecording;
        }
    }, [id, parentGroupId, selectedRecording, updateSelectedItemById]);

    useEffect(() => {
        if (portalRef.current && !isFocused) {
            const currentZ = portalRef.current.zIndex();
            if (originalZ === null) setOriginalZ(currentZ);
            else if (originalZ !== currentZ) portalRef.current.zIndex(originalZ);
        }
    }, [isFocused, originalZ]);

    useEffect(() => {
        if (isFocused && portalRef.current) portalRef.current.moveToTop();
    }, [isFocused]);

    useEffect(() => {
        if (containerRef.current) {
            const currentZ = containerRef.current.zIndex();
            if (originalZ === null) setOriginalZ(currentZ);
            else if (originalZ !== currentZ) containerRef.current.zIndex(originalZ);
        }
    }, [isFocused, originalZ]);

    // Compute horizontal bounds (fallbacks to a very large canvas if unknown)
    const contentWidth = timelineState?.contentWidth ?? timelineState?.width ?? timelineState?.timelineWidth ?? 1e9;

    // eslint-disable-next-line react-perf/jsx-no-new-function-as-prop
    const dragBoundFunc = (pos) => {
        const minX = 0;
        const maxX = Math.max(0, (timelineState?.contentWidth ?? timelineState?.width ?? 1e9) - width);
        const x = Math.min(Math.max(pos.x, minX), maxX);
        return { x, y: pos.y }; // ← do NOT clamp/override Y
    };
    // Visuals via HTML
    const bg = unifiedDynamicStyles.fill || '#fff';
    const borderColor = isSelected ? '#3b82f6' : '#00000022';
    const cardOpacity = typeof unifiedDynamicStyles.opacity === 'number' ? unifiedDynamicStyles.opacity : OPACITY;

    return (
        <Portal selector=".top-layer" enabled={shouldUsePortal} outerRef={portalRef}>
            <Group
                ref={containerRef}
                key={index}
                y={isDragging ? timelineY : 0}
                offset={isDragging ? timelineState.panelCompensationOffset : undefined}
                data-recording={selectedRecording}
                data-group-child={groupRef}
                draggable={shouldDrag}
                dragBoundFunc={dragBoundFunc}
                onContextMenu={handleContextMenu}
                onDragStart={withCursor('grabbing', handleDragStart)}
                onDragMove={withCursor('grabbing', handleDragMove)}
                onDragEnd={withCursor('grab', handleDragEnd)}
                onClick={shouldDrag && handleClick}
                onDblClick={handleDoubleClick}
                onMouseEnter={withCursor('pointer', handleMouseEnter)}
                onMouseLeave={withCursor('default', restoreZIndex)}
                listening={listening}
                id={`${ELEMENT_ID_PREFIX}${id}`}
                data-portal-parent={portalRef?.current}
                data-parent-group-id={parentGroupId}
                {...position}
            >
                {/* Invisible hit area so Group can be dragged even though visuals are HTML */}
                <Rect
                    x={0}
                    y={0}
                    width={width}
                    height={timelineHeight}
                    fill="rgba(0,0,0,0.01)" // ~invisible but hit-testable
                    cornerRadius={RADIUS}
                    listening // keep events on
                    perfectDrawEnabled={false}
                />

                {/* All visible UI is HTML (non-interactive by default to preserve drag) */}
                <KonvaHtml
                    transform
                    // eslint-disable-next-line react-perf/jsx-no-new-object-as-prop
                    divProps={{
                        style: {
                            height: `${timelineHeight}px`,
                            pointerEvents: 'none',
                            width: `${width}px`
                        }
                    }}
                >
                    <div
                        style={{
                            alignItems: 'center',
                            background: bg,
                            border: `1px solid ${borderColor}`,
                            borderRadius: `${RADIUS}px`,
                            boxShadow: 'rgba(0,0,0,0.5) 8px 5px 5px',
                            boxSizing: 'border-box',
                            display: 'flex',
                            gap: 10,
                            height: '100%',
                            opacity: cardOpacity,
                            outline: isFocused ? '2px solid #3b82f680' : 'none',
                            overflow: 'hidden',
                            padding: '8px 12px',
                            position: 'relative',
                            userSelect: 'none',
                            width: '100%'
                        }}
                    >
                        {/* Avatar */}
                        <img
                            src="https://i1.sndcdn.com/avatars-000156138298-c54tbb-t240x240.jpg"
                            alt="Profile"
                            width={40}
                            height={40}
                            style={{ borderRadius: '50%', flex: '0 0 auto', objectFit: 'cover', pointerEvents: 'none' }}
                        />

                        {/* Texts */}
                        <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, pointerEvents: 'none' }}>
                            <div
                                title={name}
                                style={{
                                    color: '#111',
                                    fontSize: 14,
                                    fontWeight: 600,
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap'
                                }}
                            >
                                {name}
                            </div>
                            <div style={{ color: '#555', fontSize: 12 }}>#{id}</div>
                        </div>

                        <div style={{ flex: 1, pointerEvents: 'none' }} />

                        {/* Delete button is the ONLY interactive DOM control */}
                        <button
                            // eslint-disable-next-line react-perf/jsx-no-new-function-as-prop
                            onClick={(e) => {
                                e.stopPropagation();
                                handleDelete?.(e);
                            }}
                            title="Delete"
                            style={{
                                background: '#ef4444',
                                border: 'none',
                                borderRadius: 6,
                                boxShadow: 'rgba(0,0,0,0.2) 0 1px 2px',
                                color: 'white',
                                cursor: 'pointer',
                                fontSize: 12,
                                padding: '6px 8px',
                                pointerEvents: 'auto'
                            }}
                        >
                            Delete
                        </button>

                        {locked && (
                            <div
                                style={{
                                    background: '#111',
                                    borderRadius: 4,
                                    color: 'white',
                                    fontSize: 10,
                                    left: 6,
                                    opacity: 0.9,
                                    padding: '2px 6px',
                                    pointerEvents: 'none',
                                    position: 'absolute',
                                    top: 6
                                }}
                            >
                                LOCKED
                            </div>
                        )}
                    </div>
                </KonvaHtml>
            </Group>
        </Portal>
    );
}, isEqual);

SoundEventElement.propTypes = {
    childScale: PropTypes.number.isRequired,
    groupRef: PropTypes.any,
    handleDragEnd: PropTypes.func.isRequired,
    handleDragMove: PropTypes.func.isRequired,
    handleDragStart: PropTypes.func.isRequired,
    index: PropTypes.number.isRequired,
    isElementBeingDragged: PropTypes.func.isRequired,
    listening: PropTypes.bool.isRequired,
    parentGroupId: PropTypes.string,
    recording: PropTypes.shape({
        eventLength: PropTypes.number.isRequired,
        id: PropTypes.number.isRequired,
        isSelected: PropTypes.bool,
        locked: PropTypes.bool,
        name: PropTypes.string.isRequired,
        startTime: PropTypes.number.isRequired
    }).isRequired,
    timelineHeight: PropTypes.number.isRequired,
    timelineY: PropTypes.number.isRequired
};

SoundEventElement.defaultProps = {
    groupRef: null,
    parentGroupId: null
};

export default SoundEventElement;

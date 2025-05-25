// SoundEventElement.jsx
// @ts-nocheck
import get from 'lodash/get';
import isEqual from 'lodash/isEqual';
import PropTypes from 'prop-types';
import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Circle, Group, Rect, Text } from 'react-konva';
// External/Internal Dependencies
import { ELEMENT_ID_PREFIX } from '../../../../globalConstants/elementIds';
import { Portal } from '../../../../globalHelpers/Portal';
import { CollisionsContext } from '../../../../providers/CollisionsProvider/CollisionsProvider';
import { usePixelRatio } from '../../../../providers/PixelRatioProvider/PixelRatioProvider';
import { SelectionContext } from '../../../../providers/SelectionsProvider';
import { TimelineContext } from '../../../../providers/TimelineProvider';
import { Lock } from '../Lock/Lock';
import { useCursorEffects } from './hooks/useCursorEffects';
import { useUnifiedDynamicStyles } from './hooks/useDynamicStyles';
import { useEventFocus } from './hooks/useEventFocus';
import { useClickHandlers } from './useEventClickHandlers';

// Constants
const CONSTANTS = {
    CORNER_RADIUS: 5,
    GRADIENT_END: { x: 100, y: 0 },
    GRADIENT_START: { x: 0, y: 0 },
    LOCK_OFFSET_Y: -10,
    SHADOW: { BLUR: 5, OFFSET: { x: 8, y: 5 }, OPACITY: 0.5 },
    STROKE_WIDTH: 2,
    TEXT_FONT_SIZE: 18,
    TEXT_STYLE: {
        fill: 'black',
        fontSize: 15,
        x: 5,
        y: 15
    },
    TRANSPARENCY_VALUE: 0.8
};

// Helper function for comparing props
const areEqual = (prevProps, nextProps) => {
    const equal = isEqual(prevProps, nextProps);
    // Uncomment below for detailed logging when props change:
    // if (!equal) {
    //   Object.keys(prevProps).forEach((key) => {
    //     if (!isEqual(prevProps[key], nextProps[key])) {
    //       console.log(`Prop '${key}' changed:`, {
    //         next: nextProps[key],
    //         prev: prevProps[key]
    //       });
    //     }
    //   });
    // }
    return equal;
};

// Main Component Definition
const SoundEventElement = React.memo(
    ({
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
    }) => {
        const pixelToSecondRatio = usePixelRatio();

        // Destructure recording properties
        const { eventLength, id, locked, name, startTime } = recording;

        // Refs
        const elementContainerRef = useRef();
        const elementRef = useRef();
        const portalRef = useRef(null);

        // State for z-index management
        const [originalZIndex, setOriginalZIndex] = useState(null);

        // Contexts
        const { isItemSelected, selectedItems, toggleItem, updateSelectedItemById } = useContext(SelectionContext);
        const { timelineState } = useContext(TimelineContext);
        const { getGroupById } = useContext(CollisionsContext);

        // Retrieve parent group data if it exists
        const parent = getGroupById(parentGroupId);
        const parentData = groupRef?.current?.attrs['data-overlap-group'];

        // Use our custom focus hook
        const { handleMouseEnter, isFocused, restoreZIndex } = useEventFocus(id);

        // Use the click hook for all click-related behaviors.
        const { handleClick, handleContextMenu, handleDelete, handleDoubleClick, handleLock } = useClickHandlers({
            elementContainerRef,
            parent,
            recording,
            toggleItem
        });

        const isSelected = isItemSelected(id);

        const shouldSelect = isSelected;

        // Get the unified dynamic styles.
        // This hook unifies both the focus/selection based styles and the layout-based styles.
        const unifiedDynamicStyles = useUnifiedDynamicStyles({
            childScale,
            groupRef,
            isFocused,
            isSelected: shouldSelect,
            timelineHeight
        });
        const { withCursor } = useCursorEffects();

        const lengthBasedWidth = eventLength * pixelToSecondRatio;

        const handleMouseEnterWithCursor = withCursor('pointer', handleMouseEnter);
        const handleMouseLeaveWithCursor = withCursor('default', restoreZIndex);
        const handleDragStartWithCursor = withCursor('grabbing', handleDragStart);
        const handleDragMoveWithCursor = withCursor('grabbing', handleDragMove);
        const handleDragEndWithCursor = withCursor('grab', handleDragEnd);

        const formattedId = `${ELEMENT_ID_PREFIX}${id}`;
        const isDragging = isElementBeingDragged(formattedId);

        const controlledPositionProps = !isDragging ? { x: startTime * pixelToSecondRatio, y: 0 } : {};

        const isNotInGroup = !groupRef;

        useEffect(() => {
            const existing = selectedItems[id];

            if (!elementContainerRef.current || !existing) {
                return;
            }

            updateSelectedItemById(id, {
                element: elementContainerRef.current,
                eventLength: recording.eventLength,
                locked: recording.locked,
                name: recording.name,
                startTime: recording.startTime
            });
        }, [id, recording, updateSelectedItemById, selectedItems]);

        useEffect(() => {
            if (portalRef.current && !isFocused) {
                const currentZIndex = portalRef.current.zIndex();
                if (originalZIndex === null) {
                    setOriginalZIndex(currentZIndex);
                } else if (originalZIndex !== currentZIndex) {
                    portalRef.current.zIndex(originalZIndex);
                }
            }
        }, [isFocused, originalZIndex]);

        useEffect(() => {
            if (isFocused && portalRef.current) {
                portalRef.current.moveToTop();
            }
        }, [isFocused]);

        const portalTarget = '.top-layer';
        const shouldDrag = !parentData?.locked && !parentData?.isSelected;
        const shouldUsePortal = isDragging && !(groupRef && locked);

        const selectedRecording = useMemo(() => {
            const shldSelect = shouldDrag ? shouldSelect : false;
            return { ...recording, isSelected: shldSelect };
        }, [recording, shouldDrag, shouldSelect]);

        return (
            <Portal selector={portalTarget} enabled={shouldUsePortal} outerRef={portalRef}>
                <Group
                    onContextMenu={handleContextMenu}
                    ref={elementContainerRef}
                    key={index}
                    y={isDragging ? timelineY : 0}
                    offset={isDragging ? timelineState.panelCompensationOffset : undefined}
                    data-recording={selectedRecording}
                    data-group-child={groupRef}
                    draggable={shouldDrag}
                    onDragStart={handleDragStartWithCursor}
                    onDragMove={handleDragMoveWithCursor}
                    onDragEnd={handleDragEndWithCursor}
                    onClick={handleClick}
                    onDblClick={handleDoubleClick}
                    listening={listening}
                    id={formattedId}
                    data-portal-parent={portalRef?.current}
                    data-parent-group-id={parentGroupId}
                    {...controlledPositionProps}
                >
                    <Rect
                        onMouseEnter={handleMouseEnterWithCursor}
                        onMouseLeave={handleMouseLeaveWithCursor}
                        ref={elementRef}
                        x={0}
                        y={0}
                        width={lengthBasedWidth}
                        {...unifiedDynamicStyles}
                        {...(!shouldDrag ? { fill: 'orange' } : {})}
                        cornerRadius={CONSTANTS.CORNER_RADIUS}
                        shadowOffset={CONSTANTS.SHADOW.OFFSET}
                        shadowOpacity={CONSTANTS.SHADOW.OPACITY}
                        opacity={CONSTANTS.TRANSPARENCY_VALUE}
                    />
                    <Text
                        x={5}
                        y={5}
                        text={name}
                        fontSize={CONSTANTS.TEXT_STYLE.fontSize}
                        fill={CONSTANTS.TEXT_STYLE.fill}
                    />
                    <Text
                        x={5}
                        y={25}
                        text={`${id}`}
                        fontSize={CONSTANTS.TEXT_STYLE.fontSize}
                        fill={CONSTANTS.TEXT_STYLE.fill}
                    />
                    {isNotInGroup && <Lock isLocked={locked} onClick={handleLock} />}
                    <Circle x={lengthBasedWidth - 10} y={10} radius={8} fill="red" onClick={handleDelete} listening />
                    {parentGroupId && (
                        <Text
                            x={5}
                            y={45 + index * 20}
                            text={`Parent Group ID ${parentGroupId}`}
                            fontSize={CONSTANTS.TEXT_STYLE.fontSize}
                            fill={CONSTANTS.TEXT_STYLE.fill}
                        />
                    )}
                </Group>
            </Portal>
        );
    },
    areEqual
);

SoundEventElement.propTypes = {
    childScale: PropTypes.number.isRequired,
    groupRef: PropTypes.bool,
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
    groupRef: false,
    parentGroupId: null
};

export default SoundEventElement;

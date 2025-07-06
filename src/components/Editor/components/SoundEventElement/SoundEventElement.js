// SoundEventElement.jsx
// @ts-nocheck

// External Libraries
import get from 'lodash/get';
import isEqual from 'lodash/isEqual';
import PropTypes from 'prop-types';
import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Circle, Group, Rect, Text } from 'react-konva';
// Internal Dependencies
import { ELEMENT_ID_PREFIX } from '../../../../globalConstants/elementIds';
import { Portal } from '../../../../globalHelpers/Portal';
import { CollisionsContext } from '../../../../providers/CollisionsProvider/CollisionsProvider';
import { usePixelRatio } from '../../../../providers/PixelRatioProvider/PixelRatioProvider';
import { SelectionContext } from '../../../../providers/SelectionsProvider';
import { TimelineContext } from '../../../../providers/TimelineProvider';
// Component-specific Hooks
import { Lock } from '../Lock/Lock';
import { useCursorEffects } from './hooks/useCursorEffects';
import { useUnifiedDynamicStyles } from './hooks/useDynamicStyles';
import { useEventFocus } from './hooks/useEventFocus';
import { useClickHandlers } from './useEventClickHandlers';

// Constants
const RADIUS = 5;
const SHADOW = { BLUR: 5, OFFSET: { x: 8, y: 5 }, OPACITY: 0.5 };
const TEXT_STYLE = { fill: 'black', fontSize: 15 };
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

    const elementRef = useRef();
    const containerRef = useRef();
    const portalRef = useRef();

    const [originalZ, setOriginalZ] = useState(null);

    const { handleMouseEnter, isFocused, restoreZIndex } = useEventFocus(id);
    const { handleClick, handleContextMenu, handleDelete, handleDoubleClick, handleLock } = useClickHandlers({
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
    const notInGroup = !groupRef;
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
        () => ({ ...recording, isSelected: shouldDrag ? isSelected : false }),
        [recording, shouldDrag, isSelected]
    );

    const prevRecordingRef = useRef();

    useEffect(() => {
        if (!containerRef.current) return;
        if (!isEqual(prevRecordingRef.current, selectedRecording)) {
            updateSelectedItemById({
                id,
                isSelected: selectedRecording.isSelected,
                updates: selectedRecording
            });
            prevRecordingRef.current = selectedRecording;
        }
    }, [id, selectedRecording, updateSelectedItemById]);

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

    const hasToggledRef = useRef(false);
    useEffect(() => {
        const shouldToggle = !isSelected && dataIsSelected;
        if (shouldToggle && !hasToggledRef.current && notInGroup) {
            toggleItem({ ...selectedRecording, element: containerRef.current });
            hasToggledRef.current = true;
        }
    }, [dataIsSelected, isSelected, selectedRecording, toggleItem, notInGroup]);

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
                onContextMenu={handleContextMenu}
                onDragStart={withCursor('grabbing', handleDragStart)}
                onDragMove={withCursor('grabbing', handleDragMove)}
                onDragEnd={withCursor('grab', handleDragEnd)}
                onClick={handleClick}
                onDblClick={handleDoubleClick}
                listening={listening}
                id={`${ELEMENT_ID_PREFIX}${id}`}
                data-portal-parent={portalRef?.current}
                data-parent-group-id={parentGroupId}
                {...position}
            >
                <Rect
                    ref={elementRef}
                    x={0}
                    y={0}
                    width={width}
                    cornerRadius={RADIUS}
                    shadowOffset={SHADOW.OFFSET}
                    shadowOpacity={SHADOW.OPACITY}
                    opacity={OPACITY}
                    {...unifiedDynamicStyles}
                    onMouseEnter={withCursor('pointer', handleMouseEnter)}
                    onMouseLeave={withCursor('default', restoreZIndex)}
                />
                <Text x={5} y={5} text={name} {...TEXT_STYLE} />
                <Text x={5} y={25} text={`${id}`} {...TEXT_STYLE} />
                <Circle x={width - 10} y={10} radius={8} fill="red" onClick={handleDelete} listening />
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

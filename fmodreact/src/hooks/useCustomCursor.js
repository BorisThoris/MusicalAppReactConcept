import React, { useCallback, useState } from 'react';
import { Group, Path, Text } from 'react-konva';

export const useCustomCursor = ({ initialVisibility = false, parentY = 0 }) => {
    const [cursorPos, setCursorPos] = useState({ screenX: 0, screenY: 0, x: 0, y: 0 });
    const [isVisible, setIsVisible] = useState(initialVisibility);

    const handleMouseMove = useCallback(
        (event) => {
            const stage = event.target.getStage();
            const pointerPosition = stage ? stage.getPointerPosition() : { x: 0, y: 0 };
            const offset = { x: event.target?.attrs?.offsetX, y: event.target?.attrs?.offsetY };

            setCursorPos({
                screenX: event.evt.clientX + offset.x,
                screenY: event.evt.clientY,
                x: pointerPosition.x,
                y: pointerPosition.y - parentY + 10
            });
        },
        [parentY]
    );

    const handleMouseEnter = useCallback(() => {
        setIsVisible(true);
    }, []);

    const handleMouseLeave = useCallback(() => {
        setIsVisible(false);
    }, []);

    const pointerPath = 'M10 0 L0 20 L10 10 L20 20 Z';

    const Cursor = isVisible && (
        <Group x={cursorPos.x} y={cursorPos.y - 10} listening={false}>
            <Text text={'sadec'} />
            <Path data={pointerPath} fill="black" />
        </Group>
    );

    return {
        Cursor,
        cursorPos,
        handleMouseEnter,
        handleMouseLeave,
        handleMouseMove,
        isVisible,
        pointerPath
    };
};

export default useCustomCursor;

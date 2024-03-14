import React, { useCallback, useState } from 'react';
import { Group, Path } from 'react-konva';

export const useCustomCursor = ({ initialVisibility = false, parentY = 0 }) => {
    const [cursorPos, setCursorPos] = useState({ screenX: 0, screenY: 0, x: 0, y: 0 });
    const [isVisible, setIsVisible] = useState(initialVisibility);
    const [isClicked, setIsClicked] = useState(false); // New state to manage click state

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

    const handleClick = useCallback(() => {
        setIsClicked(!isClicked); // Toggle the click state
    }, [isClicked]);

    // Change the pointerPath based on the isClicked state
    const pointerPath = isClicked ? 'M10 0 L10 20 L20 10 L0 10 Z' : 'M10 0 L0 20 L10 10 L20 20 Z';

    const Cursor = isVisible && (
        <Group x={cursorPos.x} y={cursorPos.y - 10} listening={false} onClick={handleClick}>
            <Path data={pointerPath} fill="black" />
        </Group>
    );

    return {
        Cursor,
        cursorPos,
        handleClick,
        handleMouseEnter,
        handleMouseLeave,
        handleMouseMove, // Make sure to return this
        isVisible,
        pointerPath
    };
};

export default useCustomCursor;

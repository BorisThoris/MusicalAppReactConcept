import React, { useCallback, useState } from 'react';

export const useCustomCursor = ({ initialVisibility = false }) => {
    const [cursorPos, setCursorPos] = useState({ screenX: 0, screenY: 0, x: 0, y: 0 });
    const [isVisible, setIsVisible] = useState(initialVisibility);
    const [isClicked, setIsClicked] = useState(false);

    const handleMouseMove = useCallback((event) => {
        const stage = event.target.getStage() || event.target.parent.getStage();
        const pointerPosition = stage ? stage.getPointerPosition() : { x: 0, y: 0 };

        const isNestedDeeply =
            event.target?.parent?.parent?.attrs?.offsetX ||
            event.target.parent?.parent?.parent?.attrs?.offsetX ||
            event.target.parent?.parent?.parent?.parent?.attrs?.offsetX;

        const offset = isNestedDeeply
            ? { x: isNestedDeeply, y: 0 }
            : { x: event.target?.attrs?.offsetX, y: event.target?.attrs?.offsetY };

        setCursorPos({
            screenX: event.evt.clientX + offset.x,
            screenY: event.evt.clientY,
            x: pointerPosition.x,
            y: pointerPosition.y
        });
    }, []);

    const handleMouseEnter = useCallback(() => {
        setIsVisible(true);
    }, []);

    const handleMouseLeave = useCallback(() => {
        setIsVisible(false);
    }, []);

    const handleClick = useCallback(() => {
        setIsClicked(!isClicked);
    }, [isClicked]);

    const pointerPath = isClicked ? 'M10 0 L10 20 L20 10 L0 10 Z' : 'M10 0 L0 20 L10 10 L20 20 Z';

    return {
        cursorPos,
        handleClick,
        handleMouseEnter,
        handleMouseLeave,
        handleMouseMove,
        isVisible,
        pointerPath
    };
};

export default useCustomCursor;

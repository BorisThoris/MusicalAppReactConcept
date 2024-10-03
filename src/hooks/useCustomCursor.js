import React, { useCallback, useState } from 'react';

export const useCustomCursor = ({ initialVisibility = false }) => {
    const [cursorPos, setCursorPos] = useState({ screenX: 0, screenY: 0, x: 0, y: 0 });
    const [isVisible, setIsVisible] = useState(initialVisibility);
    const [isClicked, setIsClicked] = useState(false);
    const [isInteracting, setIsInteracting] = useState(false); // Track if user is interacting

    const updateCursorPos = useCallback(
        (event) => {
            // Update the cursor position only if interacting
            if (!isInteracting) return;

            let pointerPosition = { x: event.clientX, y: event.clientY }; // Default for DOM events
            let offset = { x: 0, y: 0 };

            // Check if the target is a Konva node
            if (event.target.getStage) {
                const stage = event.target.getStage();
                if (stage) {
                    pointerPosition = stage.getPointerPosition() || { x: 0, y: 0 };
                }

                const isNestedDeeply =
                    event.target?.parent?.parent?.attrs?.offsetX ||
                    event.target.parent?.parent?.parent?.attrs?.offsetX ||
                    event.target.parent?.parent?.parent?.parent?.attrs?.offsetX;

                offset = isNestedDeeply
                    ? { x: isNestedDeeply, y: 0 }
                    : { x: event.target?.attrs?.offsetX, y: event.target?.attrs?.offsetY };
            }

            setCursorPos({
                screenX: event.clientX + offset.x,
                screenY: event.clientY,
                x: pointerPosition.x,
                y: pointerPosition.y
            });
        },
        [isInteracting]
    );

    // handleMouseMove now delegates to updateCursorPos but only acts if interacting
    const handleMouseMove = useCallback(
        (event) => {
            updateCursorPos(event);
        },
        [updateCursorPos]
    );

    // handleClick manages the clicked state
    const handleClick = useCallback(() => {
        setIsClicked((prev) => !prev);
        setIsInteracting((prev) => !prev); // Toggle interaction on click
    }, []);

    const handleMouseEnter = useCallback(() => {
        setIsVisible(true);
    }, []);

    const handleMouseLeave = useCallback(() => {
        setIsVisible(false);
        setIsInteracting(false); // Stop interaction when leaving
    }, []);

    const handleMouseDown = useCallback(() => {
        setIsClicked(true);
        setIsInteracting(true); // Start interaction on mouse down
    }, []);

    const handleMouseUp = useCallback(() => {
        setIsClicked(false);
        setIsInteracting(false); // End interaction on mouse up
    }, []);

    const pointerPath = isClicked ? 'M10 0 L10 20 L20 10 L0 10 Z' : 'M10 0 L0 20 L10 10 L20 20 Z';

    return {
        cursorPos,
        handleClick,
        handleMouseDown,
        handleMouseEnter,
        handleMouseLeave,
        handleMouseMove,
        handleMouseUp,
        isVisible,
        pointerPath
    };
};

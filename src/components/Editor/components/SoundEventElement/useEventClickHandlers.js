import { useCallback } from 'react';
import { playEventInstance } from '../../../../fmodLogic/eventInstanceHelpers';

export const useClickHandlers = ({ elementContainerRef, parent, recording, toggleItem }) => {
    const { eventInstance } = recording;

    // Handle a regular click event.
    const handleClick = useCallback(
        (evt) => {
            evt.evt.preventDefault();
            const isParentPresent = !!parent;
            const overlapGroup = parent?.attrs?.['data-overlap-group'];
            const locked = overlapGroup?.locked ?? false;

            if (isParentPresent && locked) {
                console.log('Parent group is locked; click event handled accordingly.');
                return;
            }

            toggleItem(elementContainerRef.current.attrs['data-recording']);
        },
        [elementContainerRef, parent, toggleItem]
    );

    // Handle double-click events.
    const handleDoubleClick = useCallback(() => playEventInstance(eventInstance), [eventInstance]);

    // Delete the element when requested.
    const handleDelete = useCallback(() => {
        if (elementContainerRef.current) {
            elementContainerRef.current.destroy();
        }
    }, [elementContainerRef]);

    // Toggle the locked state for the sound event element.
    const handleLock = useCallback(
        (e) => {
            e.cancelBubble = true;

            if (elementContainerRef.current) {
                const prevData = elementContainerRef.current.attrs['data-recording'];
                const updatedState = { ...prevData, locked: !prevData.locked };

                elementContainerRef.current.setAttrs({
                    'data-recording': updatedState
                });
                elementContainerRef.current.getLayer().draw();
            }
        },
        [elementContainerRef]
    );

    // Prevent default context menu on right-click.
    const handleContextMenu = useCallback((evt) => {
        evt.evt.preventDefault();
    }, []);

    return { handleClick, handleContextMenu, handleDelete, handleDoubleClick, handleLock };
};

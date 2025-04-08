import { useCallback } from 'react';
import { playEventInstance } from '../../../../fmodLogic/eventInstanceHelpers';

export const useClickHandlers = ({ elementContainerRef, parent, recording }) => {
    const { eventInstance } = recording;

    // Toggle selection state.
    const toggleSelection = useCallback(() => {
        if (elementContainerRef.current) {
            const prevData = elementContainerRef.current.attrs['data-recording'];
            const updatedState = { ...prevData, isSelected: !prevData.isSelected };
            elementContainerRef.current.setAttrs({
                'data-recording': updatedState
            });
            elementContainerRef.current.getLayer().draw();
        }
    }, [elementContainerRef]);

    // Handle a regular click event.
    const handleClick = useCallback(
        (evt) => {
            evt.evt.preventDefault();
            const isParentPresent = !!parent;
            const overlapGroup = parent?.attrs?.['data-overlap-group'];
            const locked = overlapGroup?.locked ?? false;

            toggleSelection();

            if (isParentPresent && locked) {
                console.log('Parent group is locked; click event handled accordingly.');
            }
        },
        [parent, toggleSelection]
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
    const handleLock = useCallback(() => {
        if (elementContainerRef.current) {
            const prevData = elementContainerRef.current.attrs['data-recording'];
            const updatedState = { ...prevData, locked: !prevData.locked };

            elementContainerRef.current.setAttrs({
                'data-recording': updatedState
            });
            elementContainerRef.current.getLayer().draw();
        }
    }, [elementContainerRef]);

    // Prevent default context menu on right-click.
    const handleContextMenu = useCallback((evt) => {
        evt.evt.preventDefault();
    }, []);

    return { handleClick, handleContextMenu, handleDelete, handleDoubleClick, handleLock };
};

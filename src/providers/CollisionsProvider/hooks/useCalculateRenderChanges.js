import React, { useEffect, useMemo, useRef } from 'react';

export const useCalculateRenderChanges = ({ findOverlaps, getProcessedElements, getProcessedGroups }) => {
    const elements = getProcessedElements();
    const groups = getProcessedGroups();

    // Store previous rects to compare changes
    const prevRectsRef = useRef([]);

    const elementRects = useMemo(() => {
        const elementRectsData = elements.map((el) => ({
            data: el.element.attrs['data-recording'],
            id: el.element.attrs['data-recording'].id,
            rect: el.element.getClientRect(),
            type: 'element' // Include data-recording attributes
        }));

        const groupRectsData = groups.map((group) => ({
            data: group.group.attrs['data-overlap-group'],
            id: group.group.attrs['data-overlap-group'].id,
            rect: group.group.getClientRect(),
            type: 'group' // Include data-overlap-group attributes
        }));

        return [...elementRectsData, ...groupRectsData];
    }, [elements, groups]);

    useEffect(() => {
        // Compare new rects with the previous rects
        const hasChanges = elementRects.some((rect, index) => {
            const prevRect = prevRectsRef.current[index];
            if (!prevRect) return true; // New rect

            const isDifferent =
                rect.id !== prevRect.id || // ID changed
                rect.type !== prevRect.type || // Type changed
                rect.rect.x !== prevRect.rect.x || // X position changed
                rect.rect.y !== prevRect.rect.y || // Y position changed
                rect.rect.width !== prevRect.rect.width || // Width changed
                rect.rect.height !== prevRect.rect.height || // Height changed
                JSON.stringify(rect.data) !== JSON.stringify(prevRect.data); // Data attributes changed

            return isDifferent;
        });

        if (hasChanges) {
            findOverlaps();
            prevRectsRef.current = elementRects; // Update the previous rects
        }
    }, [elementRects, findOverlaps]);
};

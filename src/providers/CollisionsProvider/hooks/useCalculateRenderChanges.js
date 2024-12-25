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
            // Include data-overlap-group attributes
            group: group.group,
            id: group.group.attrs['data-overlap-group'].id,
            rect: group.group.getClientRect(),
            type: 'group'
        }));

        return [...elementRectsData, ...groupRectsData];
    }, [elements, groups]);

    useEffect(() => {
        // Compare new rects with the previous rects
        const hasChanges = elementRects.some((rect, index) => {
            const prevRect = prevRectsRef.current[index];
            if (!prevRect) return true; // New rect

            const isDifferent = JSON.stringify(rect) !== JSON.stringify(prevRect); // Data attributes changed

            return isDifferent;
        });

        if (hasChanges) {
            console.log('FIND OVERLAPS');
            findOverlaps();
            prevRectsRef.current = elementRects;
        }
    }, [elementRects, findOverlaps]);
};

import React, { useEffect, useMemo } from 'react';

export const useCalculateRenderChanges = ({ findOverlaps, getProcessedElements, getProcessedGroups }) => {
    const elements = getProcessedElements();
    const groups = getProcessedGroups();

    const elementRects = useMemo(() => {
        const elementRectsData = elements.map((el) => ({
            id: el.element.attrs['data-recording'].id,
            rect: el.element.getClientRect(),
            type: 'element'
        }));

        const groupRectsData = groups.map((group) => ({
            id: group.group.attrs['data-overlap-group'].id,
            rect: group.group.getClientRect(),
            type: 'group'
        }));

        return [...elementRectsData, ...groupRectsData];
    }, [elements, groups]);

    useEffect(() => {
        findOverlaps();
    }, [elementRects, findOverlaps]);
};

/* eslint-disable no-restricted-syntax */
/* eslint-disable no-param-reassign */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

// Utility function for detecting overlaps
const isOverlapping = (rectA, rectB) =>
    !(
        rectA.x > rectB.x + rectB.width ||
        rectA.x + rectA.width < rectB.x ||
        rectA.y > rectB.y + rectB.height ||
        rectA.y + rectA.height < rectB.y
    );

// Union-Find helper functions
const find = (parent, id, visited = new Set()) => {
    if (visited.has(id)) {
        console.warn(`Infinite recursion detected for id: ${id}`);
        return id; // Break the cycle and return the current ID
    }

    visited.add(id);

    if (parent[id] !== id) {
        parent[id] = find(parent, parent[id], visited); // Path compression with recursion protection
    }
    return parent[id];
};

const union = (parent, rank, idA, idB) => {
    const rootA = find(parent, idA);
    const rootB = find(parent, idB);

    if (rootA !== rootB) {
        if (rank[rootA] > rank[rootB]) {
            parent[rootB] = rootA;
        } else if (rank[rootA] < rank[rootB]) {
            parent[rootA] = rootB;
        } else {
            parent[rootB] = rootA;
            rank[rootA] += 1;
        }
    }
};

export const useOverlaps = ({ getProcessedElements, overlapGroups, previousBeat, setOverlapGroups }) => {
    const elements = getProcessedElements();

    const [overlapsCalculated, setOverlapsCalculated] = useState(false);

    const previousElementsRef = useRef([]);

    const elementRects = useMemo(() => {
        return elements.map((el) => ({
            event: el,
            id: el.element.attrs['data-recording'].id,
            instrumentName: el.element.attrs['data-recording'].instrumentName,
            rect: el.element.getClientRect()
        }));
    }, [elements]);

    const findOverlaps = useCallback(() => {
        const parent = {};
        const rank = {};

        // Initialize Union-Find
        elementRects.forEach(({ id }) => {
            parent[id] = id;
            rank[id] = 0;
        });

        // Build overlapping relationships
        elementRects.forEach((elementA, idxA) => {
            const rectA = elementA.rect;
            const idA = elementA.id;

            for (let idxB = idxA + 1; idxB < elementRects.length; idxB += 1) {
                const elementB = elementRects[idxB];
                const rectB = elementB.rect;

                if (isOverlapping(rectA, rectB)) {
                    union(parent, rank, idA, elementB.id);
                }
            }
        });

        const tempGroups = {};

        elementRects.forEach(({ event, id, instrumentName }) => {
            const elementData = event.element.attrs['data-recording'];
            const rootId = find(parent, id); // Find the root ID for this element

            if (!tempGroups[instrumentName]) {
                tempGroups[instrumentName] = {};
            }

            // Add to group or as a singular event
            if (!tempGroups[instrumentName][rootId]) {
                tempGroups[instrumentName][rootId] = {
                    elements: {}, // To store element data
                    ids: new Set() // To collect unique element IDs
                };
            }

            tempGroups[instrumentName][rootId].elements[elementData.id] = { ...elementData };
            tempGroups[instrumentName][rootId].ids.add(elementData.id);
        });

        // Separate singular events from overlap groups
        const finalGroups = {};
        Object.keys(tempGroups).forEach((instrumentName) => {
            if (!finalGroups[instrumentName]) {
                finalGroups[instrumentName] = {};
            }

            Object.keys(tempGroups[instrumentName]).forEach((rootId) => {
                const group = tempGroups[instrumentName][rootId];
                const concatenatedId = Array.from(group.ids).sort().join('-'); // Concatenate sorted IDs

                if (group.ids.size === 1) {
                    // If it's a singular event, use the individual ID as the key
                    const [singleId] = Array.from(group.ids);
                    finalGroups[instrumentName][singleId] = group.elements[singleId];
                } else {
                    // Otherwise, add it as an overlap group
                    finalGroups[instrumentName][concatenatedId] = { overlapGroup: group.elements };
                }
            });
        });

        setOverlapGroups((prevGroups) => {
            const mergedGroups = { ...prevGroups }; // Start with a copy of the previous groups

            // Add new groups from finalGroups
            Object.keys(finalGroups).forEach((instrumentName) => {
                if (!mergedGroups[instrumentName]) {
                    mergedGroups[instrumentName] = {};
                }

                Object.keys(finalGroups[instrumentName]).forEach((groupId) => {
                    mergedGroups[instrumentName][groupId] = finalGroups[instrumentName][groupId];
                });
            });

            // Filter out singular IDs that appear in overlap groups
            Object.keys(mergedGroups).forEach((instrumentName) => {
                const instrumentGroups = mergedGroups[instrumentName];

                // Collect all overlap group IDs
                const allOverlapIds = new Set();
                Object.keys(instrumentGroups).forEach((groupId) => {
                    const group = instrumentGroups[groupId];
                    if (group.overlapGroup) {
                        Object.keys(group.overlapGroup).forEach((id) => allOverlapIds.add(id));
                    }
                });

                // Remove singular IDs that appear in any overlap group
                Object.keys(instrumentGroups).forEach((groupId) => {
                    if (!instrumentGroups[groupId].overlapGroup && allOverlapIds.has(groupId)) {
                        delete instrumentGroups[groupId];
                    }
                });
            });

            if (JSON.stringify(previousBeat.current) !== JSON.stringify(mergedGroups)) {
                console.log('TRUE');
                console.log(previousBeat.current);
                console.log(mergedGroups);

                previousBeat.current = mergedGroups;
                return mergedGroups;
            }
            return prevGroups;
        });

        setOverlapsCalculated(true);
    }, [elementRects, previousBeat, setOverlapGroups]);

    const findGroupForEvent = useCallback(
        (id) => {
            for (const [instrumentName, instrumentGroups] of Object.entries(overlapGroups)) {
                for (const [groupId, group] of Object.entries(instrumentGroups)) {
                    if (group.overlapGroup) {
                        if (group.overlapGroup[id]) {
                            return {
                                groupId,
                                instrumentName
                            };
                        }
                    } else if (group.id === id) {
                        return {
                            groupId: id,
                            instrumentName
                        };
                    }
                }
            }
            return null; // If no group is found
        },
        [overlapGroups]
    );

    useEffect(() => {
        const previousElements = previousElementsRef.current;

        if (elements.length > 0 && (!overlapsCalculated || previousElements !== elements)) {
            findOverlaps();
            previousElementsRef.current = elements;
        }
    }, [elements, overlapsCalculated, findOverlaps]);

    const resetOverlaps = useCallback(() => {
        setOverlapsCalculated(false);
    }, []);

    return { findGroupForEvent, findOverlaps, resetOverlaps };
};

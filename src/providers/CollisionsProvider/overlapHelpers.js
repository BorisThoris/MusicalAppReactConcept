/* eslint-disable no-param-reassign */
/* eslint-disable no-restricted-syntax */
import { useCallback } from 'react';
// Assume utility functions are modularized

// Utility function for detecting overlaps
export const isOverlapping = (elA, elB) => {
    if (!elA.rect || !elB.rect) return;

    const rectA = elA.rect;
    const rectB = elB.rect;

    // Check basic rectangle overlap
    const isOvrlp = !(
        rectA.x > rectB.x + rectB.width ||
        rectA.x + rectA.width < rectB.x ||
        rectA.y > rectB.y + rectB.height ||
        rectA.y + rectA.height < rectB.y
    );

    return isOvrlp;
};

const isGroupOverlapping = (element, groupElement) => {
    const groupEls = groupElement.elements;

    // eslint-disable-next-line guard-for-in
    for (const key in groupEls) {
        const groupChild = groupEls[key];

        if (isOverlapping(element, groupChild)) {
            return true;
        }
    }
    return false;
};

const checkOverlap = (elA, elB) => {
    const aGroup = elA.elements;
    const bGroup = elB.elements;

    if (aGroup && bGroup) {
        // eslint-disable-next-line guard-for-in
        for (const keyA in aGroup) {
            for (const keyB in bGroup) {
                if (isOverlapping(aGroup[keyA], bGroup[keyB])) {
                    return true;
                }
            }
        }

        return false;
    }
    if (aGroup) {
        return isGroupOverlapping(elB, elA);
    }
    if (bGroup) {
        return isGroupOverlapping(elA, elB);
    }
    // Neither is a group, check single overlap
    return isOverlapping(elA, elB);
};

// Union-Find helper functions
const initializeUnionFind = (elements) => {
    const parent = {};
    const rank = {};

    elements.forEach(({ id }) => {
        parent[id] = id;
        rank[id] = 0;
    });

    return { parent, rank };
};

const find = (parent, id, visited = new Set()) => {
    if (visited.has(id)) {
        console.warn(`Infinite recursion detected for id: ${id}`);
        return id; // Break the cycle
    }

    visited.add(id);

    if (parent[id] !== id) {
        parent[id] = find(parent, parent[id], visited); // Path compression
    }
    return parent[id];
};

const union = (parent, rank, elementA, elementB) => {
    const idA = elementA.id;
    const idB = elementB.id;

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

export const findOverlaps = (processedData) => {
    if (!processedData) return;

    const allElements = Object.entries(processedData).flatMap(([instrumentName, events]) => {
        return Object.values(events).map((event) => ({ ...event, instrumentName }));
    });

    const { parent, rank } = initializeUnionFind(allElements);

    // Detect overlaps and union groups
    allElements.forEach((elementA, idxA) => {
        for (let idxB = idxA + 1; idxB < allElements.length; idxB += 1) {
            const elementB = allElements[idxB];

            const elementALocked = elementA.locked || false;
            const elementBLocked = elementB.locked || false;
            const elementsNotLocked = !elementALocked && !elementBLocked;

            const areElementsOverlapping = checkOverlap(elementA, elementB);

            if (elementsNotLocked && areElementsOverlapping) {
                union(parent, rank, elementA, elementB);
            }
        }
    });

    const tempGroups = allElements.reduce((groups, currentElement) => {
        const { id, instrumentName } = currentElement;
        const rootId = find(parent, id);

        if (!groups[instrumentName]) groups[instrumentName] = {};
        if (!groups[instrumentName][rootId]) {
            groups[instrumentName][rootId] = {
                elements: {},
                ids: new Set()
            };
        }

        groups[instrumentName][rootId].ids.add(id);
        groups[instrumentName][rootId].elements[id] = currentElement;

        return groups;
    }, {});

    const finalGroups = Object.entries(tempGroups).reduce((result, [instrumentName, groups]) => {
        result[instrumentName] = Object.entries(groups).reduce((acc, [rootId, group]) => {
            const idsArray = Array.from(group.ids);

            if (idsArray.length === 1) {
                const [singleId] = idsArray;
                acc[singleId] = group.elements[singleId];
            } else {
                const startTime = Math.min(...idsArray.map((id) => group.elements[id].startTime));
                const endTime = Math.max(...idsArray.map((id) => group.elements[id].endTime));
                const length = endTime - startTime;

                acc[rootId] = {
                    ...group,
                    endTime,
                    id: rootId,
                    instrumentName,
                    length,
                    startTime
                };
            }
            return acc;
        }, {});

        return result;
    }, {});

    return finalGroups;
};

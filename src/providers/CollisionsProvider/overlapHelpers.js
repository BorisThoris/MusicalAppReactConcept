/* eslint-disable no-param-reassign */
/* eslint-disable no-restricted-syntax */

// Assume utility functions are modularized

// Utility function for detecting overlaps
export const isOverlapping = (elA, elB) => {
    if (!elA.rect || !elB.rect) return false;

    const { endTime: aEndTime, startTime: aStartTime } = elA;
    const { endTime: bEndTime, startTime: bStartTime } = elB;

    const rectA = elA.rect;
    const rectB = elB.rect;

    // Check basic rectangle overlap
    const isRectOverlapping = !(
        rectA.x > rectB.x + rectB.width ||
        rectA.x + rectA.width < rectB.x ||
        rectA.y > rectB.y + rectB.height ||
        rectA.y + rectA.height < rectB.y
    );

    // Check time overlap
    const isTimeOverlapping = !(aEndTime <= bStartTime || bEndTime <= aStartTime);

    return isRectOverlapping && isTimeOverlapping;
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

    const getAllElements = (element) => {
        if (element.elements) {
            return Object.values(element.elements);
        }
        return [element];
    };

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

            const groupA = getAllElements(elementA);
            const groupB = getAllElements(elementB);

            const areGroupsOverlapping = groupA.some((elA) => groupB.some((elB) => isOverlapping(elA, elB)));

            if (elementsNotLocked && areGroupsOverlapping) {
                union(parent, rank, elementA, elementB);
            }
        }
    });

    const tempGroups = allElements.reduce((groups, currentElement) => {
        const rootId = find(parent, currentElement.id);
        const actualElements = getAllElements(currentElement);

        if (!groups[currentElement.instrumentName]) {
            groups[currentElement.instrumentName] = {};
        }
        if (!groups[currentElement.instrumentName][rootId]) {
            groups[currentElement.instrumentName][rootId] = {
                elements: {},
                ids: new Set(),
                isSelected: currentElement.selected,
                locked: currentElement.locked
            };
        }

        actualElements.forEach((actualElement) => {
            groups[currentElement.instrumentName][rootId].ids.add(actualElement.id);
            groups[currentElement.instrumentName][rootId].elements[actualElement.id] = actualElement;
        });

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

    // Sort the final groups by instrumentName alphabetically
    const sortedFinalGroups = {};
    Object.keys(finalGroups)
        .sort((a, b) => a.localeCompare(b))
        .forEach((instrumentName) => {
            sortedFinalGroups[instrumentName] = finalGroups[instrumentName];
        });

    return sortedFinalGroups;
};

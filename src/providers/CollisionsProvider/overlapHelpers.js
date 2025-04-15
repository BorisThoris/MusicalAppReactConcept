/* eslint-disable no-continue */
/* eslint-disable no-param-reassign */
/* eslint-disable no-restricted-syntax */

/**
 * Helper function that uses Konva’s absolute transform to compute the absolute rectangle from a node.
 */
const getAbsoluteRect = (node) => {
    if (!node) {
        return { height: 0, width: 0, x: 0, y: 0 };
    }
    const clientRect = node.getClientRect({ skipTransform: false });
    const absTransform = node.getAbsolutePosition();
    return {
        height: clientRect.height,
        width: clientRect.width,
        x: absTransform.x,
        y: absTransform.y
    };
};

/**
 * Returns true if both the time intervals overlap and the horizontal (X) portions of their rectangles overlap.
 * The function immediately returns false if the instrumentNames differ.
 */
export const isOverlapping = (elA, elB) => {
    // Ensure elements belong to the same instrument/layer.
    if (elA.recording.instrumentName !== elB.recording.instrumentName) return false;

    const normRectA = getAbsoluteRect(elA?.node || elA?.element);
    const normRectB = getAbsoluteRect(elB?.node || elB?.element);

    // Only compute horizontal rectangle overlap (ignore Y axis).
    const isRectOverlapping = !(
        normRectA.x > normRectB.x + normRectB.width || normRectA.x + normRectA.width < normRectB.x
    );

    // Compute time interval overlap.
    const isTimeOverlapping = !(elA.endTime <= elB.startTime || elB.endTime <= elA.startTime);

    return isRectOverlapping && isTimeOverlapping;
};

/**
 * Checks if rectA is entirely contained within rectB.
 */
const isRectContained = (rectA, rectB) =>
    rectA.x >= rectB.x &&
    rectA.y >= rectB.y &&
    rectA.x + rectA.width <= rectB.x + rectB.width &&
    rectA.y + rectA.height <= rectB.y + rectB.height;

/**
 * Returns key group data from an element.
 */
const getGroupData = (element) => ({
    endTime: element.endTime,
    rect: element.rect,
    startTime: element.startTime
});

/**
 * Initializes union-find data structures for elements.
 */
const initializeUnionFind = (elements) => {
    const parent = {};
    const rank = {};
    elements.forEach(({ id }) => {
        parent[id] = id;
        rank[id] = 0;
    });
    return { parent, rank };
};

/**
 * Union-Find "find" function with path compression.
 */
const find = (parent, id, visited = new Set()) => {
    if (visited.has(id)) {
        console.warn(`Infinite recursion detected for id: ${id}`);
        return id;
    }
    visited.add(id);
    if (parent[id] !== id) {
        parent[id] = find(parent, parent[id], visited);
    }
    return parent[id];
};

/**
 * Union-Find "union" function that merges two sets.
 */
const union = (parent, rank, elementA, elementB) => {
    const rootA = find(parent, elementA.id);
    const rootB = find(parent, elementB.id);
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

/**
 * Main function to find overlapping groups.
 * This version ensures only events with the same instrumentName are merged and uses the adjusted overlap check.
 */
export const findOverlaps = (processedData) => {
    if (!processedData) return;

    // Returns an array of elements (if grouped, returns its elements; else wraps the element in an array).
    const getAllElements = (element) => (element.elements ? Object.values(element.elements) : [element]);

    // Gather all elements and annotate each with its instrument name.
    // NOTE: instruments with no events will result in an empty array here.
    const allElements = Object.entries(processedData).flatMap(([instrumentName, events]) =>
        Object.values(events).map((event) => ({ ...event, instrumentName }))
    );

    const { parent, rank } = initializeUnionFind(allElements);

    // Compare each pair using group-level data.
    allElements.forEach((elementA, idxA) => {
        // Precompute group data for elementA.
        const groupDataA = getGroupData(elementA);
        for (let idxB = idxA + 1; idxB < allElements.length; idxB += 1) {
            const elementB = allElements[idxB];

            // Skip if either element is locked.
            if (elementA.locked || elementB.locked) continue;

            // Precompute group data for elementB.
            const groupDataB = getGroupData(elementB);

            const overlapCheck = isOverlapping(
                {
                    endTime: groupDataA.endTime,
                    node: elementA.node,
                    recording: { instrumentName: elementA.instrumentName },
                    rect: groupDataA.rect,
                    startTime: groupDataA.startTime
                },
                {
                    endTime: groupDataB.endTime,
                    node: elementB.node,
                    recording: { instrumentName: elementB.instrumentName },
                    rect: groupDataB.rect,
                    startTime: groupDataB.startTime
                }
            );

            let rectContained = false;
            if (groupDataA.rect && groupDataB.rect) {
                rectContained =
                    isRectContained(groupDataA.rect, groupDataB.rect) ||
                    isRectContained(groupDataB.rect, groupDataA.rect);
            }

            // Merge groups if either the overlap or containment condition holds.
            if (overlapCheck || rectContained) {
                union(parent, rank, elementA, elementB);
            }
        }
    });

    // Build temporary groups from the union-find structure.
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

    // Build final groups by computing overall start/end times, lengths, and preserving the stored group rect.
    const finalGroups = Object.entries(tempGroups).reduce((result, [instrumentName, groups]) => {
        result[instrumentName] = Object.entries(groups).reduce((acc, [rootId, group]) => {
            const idsArray = Array.from(group.ids);
            if (idsArray.length === 1) {
                const [singleId] = idsArray;
                acc[singleId] = group.elements[singleId];
            } else {
                const startTime = Math.min(...Object.values(group.elements).map((el) => el.startTime));
                const endTime = Math.max(...Object.values(group.elements).map((el) => el.endTime));
                const length = endTime - startTime;
                // Use the stored rect from the first element (or any agreed-upon source) in the group.
                const storedRect = group.elements[idsArray[0]].rect;
                acc[rootId] = {
                    ...group,
                    endTime,
                    id: rootId,
                    instrumentName,
                    length,
                    rect: storedRect,
                    startTime
                };
            }
            return acc;
        }, {});
        return result;
    }, {});

    // Optionally sort final groups by instrumentName alphabetically.
    const sortedFinalGroups = {};
    Object.keys(finalGroups)
        .sort((a, b) => a.localeCompare(b))
        .forEach((instrumentName) => {
            sortedFinalGroups[instrumentName] = finalGroups[instrumentName];
        });

    // Ensure that instrument layers/names with no events
    // (i.e. those present in processedData but missing in sortedFinalGroups)
    // are persisted as empty objects.
    Object.keys(processedData).forEach((instrumentName) => {
        if (!(instrumentName in sortedFinalGroups)) {
            sortedFinalGroups[instrumentName] = {};
        }
    });

    return sortedFinalGroups;
};

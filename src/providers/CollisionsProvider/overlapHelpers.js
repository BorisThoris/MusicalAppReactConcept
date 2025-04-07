/* eslint-disable no-param-reassign */
/* eslint-disable no-restricted-syntax */

// Helper function: uses Konva’s absolute transform to get the absolute rect from a node.
const getAbsoluteRect = (node) => {
    // Check if node exists. If not, return a fallback rectangle.
    if (!node) {
        return {
            height: 0,
            width: 0,
            x: 0,
            y: 0
        };
    }

    // If node exists, calculate the absolute rectangle.
    const clientRect = node.getClientRect({ skipTransform: false });
    // Compute the absolute top-left position using the node’s transform.
    const absTransform = node.getAbsolutePosition();

    return {
        height: clientRect.height,
        width: clientRect.width,
        x: absTransform.x,
        y: absTransform.y
    };
};

export const isOverlapping = (elA, elB) => {
    // Always use the absolute rect from the node reference.
    // Assumes element.node exists and is valid.
    const normRectA = getAbsoluteRect(elA?.node || elA?.element);
    const normRectB = getAbsoluteRect(elB?.node || elB?.element);

    if (!normRectA || !normRectB) {
        return false;
    }

    const { endTime: aEndTime, startTime: aStartTime } = elA;
    const { endTime: bEndTime, startTime: bStartTime } = elB;

    let isRectOverlapping = true;
    let isTimeOverlapping = true;

    // Standard rectangle overlap check using the normalized absolute values
    if (normRectA.x > normRectB.x + normRectB.width) {
        isRectOverlapping = false;
    }
    if (normRectA.x + normRectA.width < normRectB.x) {
        isRectOverlapping = false;
    }
    if (normRectA.y > normRectB.y + normRectB.height) {
        isRectOverlapping = false;
    }
    if (normRectA.y + normRectA.height < normRectB.y) {
        isRectOverlapping = false;
    }

    // Check time overlap conditions
    if (aEndTime <= bStartTime) {
        isTimeOverlapping = false;
    }
    if (bEndTime <= aStartTime) {
        isTimeOverlapping = false;
    }

    return isRectOverlapping && isTimeOverlapping;
};

// Helper to check if rectA is entirely contained within rectB
const isRectContained = (rectA, rectB) => {
    return (
        rectA.x >= rectB.x &&
        rectA.y >= rectB.y &&
        rectA.x + rectA.width <= rectB.x + rectB.width &&
        rectA.y + rectA.height <= rectB.y + rectB.height
    );
};

// Helper to get group data. If the element is a group (has an "elements" property),
// we now use its stored rect, startTime, and endTime. Otherwise, use its own properties.
const getGroupData = (element) => {
    if (element.elements) {
        // Use the group's stored values (no union computation)
        return {
            endTime: element.endTime,
            rect: element.rect,
            startTime: element.startTime
        };
    }
    return {
        endTime: element.endTime,
        rect: element.rect,
        startTime: element.startTime
    };
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
        return id;
    }
    visited.add(id);
    if (parent[id] !== id) {
        parent[id] = find(parent, parent[id], visited);
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

// Updated findOverlaps function that uses stored group rect values when groups are involved.
export const findOverlaps = (processedData) => {
    if (!processedData) return;

    // Helper to return an array of elements (if grouped, return its elements; else wrap in an array)
    const getAllElements = (element) => {
        return element.elements ? Object.values(element.elements) : [element];
    };

    // Gather all elements (each with instrumentName attached)
    const allElements = Object.entries(processedData).flatMap(([instrumentName, events]) =>
        Object.values(events).map((event) => ({ ...event, instrumentName }))
    );

    const { parent, rank } = initializeUnionFind(allElements);

    // Compare each pair using group-level stored data.
    allElements.forEach((elementA, idxA) => {
        for (let idxB = idxA + 1; idxB < allElements.length; idxB += 1) {
            const elementB = allElements[idxB];

            // Skip if either is locked.
            // eslint-disable-next-line no-continue
            if (elementA.locked || elementB.locked) continue;

            const groupDataA = getGroupData(elementA);
            const groupDataB = getGroupData(elementB);

            // Use group-level overlap check based solely on stored rect, startTime, and endTime.
            const overlapCheck = isOverlapping(
                {
                    endTime: groupDataA.endTime,
                    node: elementA.node,
                    rect: groupDataA.rect,
                    startTime: groupDataA.startTime // Ensure node is passed for absolute positioning
                },
                {
                    endTime: groupDataB.endTime,
                    node: elementB.node,
                    rect: groupDataB.rect,
                    startTime: groupDataB.startTime // Ensure node is passed for absolute positioning
                }
            );

            // Also check if one group's rect is entirely contained within the other.
            let rectContained = false;
            if (groupDataA.rect && groupDataB.rect) {
                rectContained =
                    isRectContained(groupDataA.rect, groupDataB.rect) ||
                    isRectContained(groupDataB.rect, groupDataA.rect);
            }

            // If either condition is true, merge the groups.
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

    // Build final groups, computing overall start/end times, lengths, and keeping the stored group rect.
    const finalGroups = Object.entries(tempGroups).reduce((result, [instrumentName, groups]) => {
        result[instrumentName] = Object.entries(groups).reduce((acc, [rootId, group]) => {
            const idsArray = Array.from(group.ids);
            if (idsArray.length === 1) {
                const [singleId] = idsArray;
                acc[singleId] = group.elements[singleId];
            } else {
                // When groups are merged, we now preserve the stored rect from the group.
                // (Assumes that when a group is created, its rect property is properly set.)
                const startTime = Math.min(...Object.values(group.elements).map((el) => el.startTime));
                const endTime = Math.max(...Object.values(group.elements).map((el) => el.endTime));
                const length = endTime - startTime;
                // Use the stored rect from the first element in the group (or any other agreed-upon source)
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

    // Optionally sort the final groups by instrumentName alphabetically.
    const sortedFinalGroups = {};
    Object.keys(finalGroups)
        .sort((a, b) => a.localeCompare(b))
        .forEach((instrumentName) => {
            sortedFinalGroups[instrumentName] = finalGroups[instrumentName];
        });

    return sortedFinalGroups;
};

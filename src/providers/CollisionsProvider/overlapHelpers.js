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
// Returns an array of actual elements (unwrapping grouped elements)
function getAllElements(element) {
    return element.elements ? Object.values(element.elements) : [element];
}

// Flattens processedData into a single array of annotated elements
function collectAllElements(processedData) {
    return Object.entries(processedData).flatMap(([instrumentName, events]) =>
        Object.values(events).map((event) => ({ ...event, instrumentName }))
    );
}

// Iterate through each pair of elements and union overlapping or contained ones
function mergeOverlapGroups(allElements, parent, rank) {
    const len = allElements.length;

    for (let i = 0; i < len; i += 1) {
        const elemA = allElements[i];
        if (elemA.locked) continue;

        const dataA = getGroupData(elemA);
        for (let j = i + 1; j < len; j += 1) {
            const elemB = allElements[j];
            if (elemB.locked) continue;

            const dataB = getGroupData(elemB);
            const overlap = isOverlapping(
                { ...dataA, recording: { instrumentName: elemA.instrumentName } },
                { ...dataB, recording: { instrumentName: elemB.instrumentName } }
            );

            let contained = false;
            if (dataA.rect && dataB.rect) {
                contained = isRectContained(dataA.rect, dataB.rect) || isRectContained(dataB.rect, dataA.rect);
            }

            if (overlap || contained) {
                union(parent, rank, elemA, elemB);
            }
        }
    }
}

// Build groups keyed by instrument and root ID, aggregating elements and metadata
function buildTempGroups(allElements, parent) {
    return allElements.reduce((groups, elem) => {
        const root = find(parent, elem.id);
        const actuals = getAllElements(elem);
        const inst = elem.instrumentName;

        groups[inst] = groups[inst] || {};
        if (!groups[inst][root]) {
            groups[inst][root] = { elements: {}, ids: new Set(), isSelected: elem.selected, locked: elem.locked };
        }

        actuals.forEach((a) => {
            groups[inst][root].ids.add(a.id);
            groups[inst][root].elements[a.id] = a;
        });

        return groups;
    }, {});
}

// Compute final merged groups and singletons with aggregated times and rects
function buildFinalGroups(tempGroups) {
    const result = {};

    Object.entries(tempGroups).forEach(([inst, groups]) => {
        result[inst] = {};

        Object.entries(groups).forEach(([root, group]) => {
            const ids = Array.from(group.ids);

            if (ids.length === 1) {
                const single = group.elements[ids[0]];
                result[inst][ids[0]] = single;
            } else {
                const times = Object.values(group.elements).map((el) => ({ end: el.endTime, start: el.startTime }));
                const startTime = Math.min(...times.map((t) => t.start));
                const endTime = Math.max(...times.map((t) => t.end));
                const eventLength = endTime - startTime;
                const { rect } = group.elements[ids[0]];

                result[inst][root] = {
                    ...group,
                    endTime,
                    eventLength,
                    id: root,
                    instrumentName: inst,
                    rect,
                    startTime
                };
            }
        });
    });

    return result;
}

// Ensure instruments with no events are present as empty objects
function ensureAllInstruments(groups, processedData) {
    Object.keys(processedData).forEach((inst) => {
        if (!groups[inst]) groups[inst] = {};
    });
    return groups;
}

export function processOverlaps(allElements) {
    const { parent, rank } = initializeUnionFind(allElements);

    mergeOverlapGroups(allElements, parent, rank);

    const temp = buildTempGroups(allElements, parent);
    const merged = buildFinalGroups(temp);
    const sorted = Object.keys(merged)
        .sort((a, b) => a.localeCompare(b))
        .reduce((acc, inst) => {
            acc[inst] = merged[inst];
            return acc;
        }, {});

    return sorted;
}

// Main API
export function findOverlaps(processedData) {
    if (!processedData) return {};

    const allElements = collectAllElements(processedData);
    const sorted = processOverlaps(allElements);

    return ensureAllInstruments(sorted, processedData);
}

/* eslint-disable no-restricted-syntax */
/* eslint-disable no-param-reassign */
import { useCallback } from 'react';
import { createEvent } from '../../../../globalHelpers/createSound';

// Utility function for detecting overlaps
const isOverlapping = (elA, elB) => {
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
    // Iterate through all elements in the overlap group
    // eslint-disable-next-line guard-for-in
    for (const key in groupElement.overlapGroup) {
        const groupChild = groupElement.overlapGroup[key];
        if (isOverlapping(element, groupChild)) {
            return true; // If any overlaps, return true
        }
    }
    return false; // No overlaps found
};

const checkOverlap = (elA, elB) => {
    if (elA.groupData && elB.groupData) {
        // Both elements are groups
        // eslint-disable-next-line guard-for-in
        for (const keyA in elA.groupData.overlapGroup) {
            for (const keyB in elB.groupData.overlapGroup) {
                if (isOverlapping(elA.groupData.overlapGroup[keyA], elB.groupData.overlapGroup[keyB])) {
                    return true;
                }
            }
        }
        return false;
    }
    if (elA.groupData) {
        // elA is a group, check against all elements in elA's group
        return isGroupOverlapping(elB, elA);
    }
    if (elB.groupData) {
        // elB is a group, check against all elements in elB's group
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

export const useOverlaps = ({
    getProcessedElements,
    getProcessedGroups,
    overlapGroups,
    previousBeat,
    setOverlapGroups,
    timelineRefs
}) => {
    const processBeat = useCallback(() => {
        const processedElements = getProcessedElements();
        const processedGroups = getProcessedGroups();

        if (!processedElements || processedElements.length === 0) return {};

        // Sort processed elements
        const sortedElements = processedElements.sort((a, b) => {
            if (a.recording.instrumentName < b.recording.instrumentName) return -1;
            if (a.recording.instrumentName > b.recording.instrumentName) return 1;
            return a.recording.id - b.recording.id;
        });

        // Build the structured object to save
        const objToSave = sortedElements.reduce((acc, { element, recording }) => {
            const newRec = createEvent({ instrumentName: recording.instrumentName, recording });

            if (!acc[recording.instrumentName]) acc[recording.instrumentName] = {};
            acc[recording.instrumentName][recording.id] = {
                ...newRec,
                rect: element.getClientRect()
            };
            return acc;
        }, {});

        // Include all timelines from timelineRefs
        Object.keys(timelineRefs).forEach((timelineName) => {
            if (!objToSave[timelineName]) {
                objToSave[timelineName] = {};
            }
        });

        // Persist processed groups
        processedGroups.forEach(({ group, groupData, height, timelineY, width, x, y }) => {
            const instrumentName = groupData?.instrumentName || 'unknown';

            if (!objToSave[instrumentName]) {
                objToSave[instrumentName] = {};
            }

            objToSave[instrumentName][groupData.id] = {
                elements: groupData.overlapGroup,
                endTime: groupData.endTime,
                groupData,
                rect: { height, width, x, y },
                startTime: groupData.startTime,
                timelineY // Persist overlap group elements if applicable
            };
        });

        return objToSave;
    }, [getProcessedElements, getProcessedGroups, timelineRefs]);

    const findOverlaps = useCallback(() => {
        const processedData = processBeat();

        if (!processedData) return;

        const allElements = Object.entries(processedData).flatMap(([timeline, events]) =>
            Object.values(events).map((event) => {
                return {
                    ...event,
                    timeline
                };
            })
        );

        const { parent, rank } = initializeUnionFind(allElements);

        // Detect overlaps and union groups
        allElements.forEach((elementA, idxA) => {
            for (let idxB = idxA + 1; idxB < allElements.length; idxB += 1) {
                const elementB = allElements[idxB];

                if (!elementA.locked && !elementB.locked && checkOverlap(elementA, elementB)) {
                    union(parent, rank, elementA.id, elementB.id);
                }
            }
        });

        // Organize overlap groups
        const tempGroups = allElements.reduce((groups, { id, timeline }) => {
            const rootId = find(parent, id);

            if (!processedData[timeline] || !processedData[timeline][id]) return groups;

            const group = groups[timeline]?.[rootId] || { elements: {}, ids: new Set() };
            const { element, rect, ...filteredEvent } = processedData[timeline][id];

            return {
                ...groups,
                [timeline]: {
                    ...groups[timeline],
                    [rootId]: {
                        ...group,
                        elements: { ...group.elements, [id]: filteredEvent },
                        ids: new Set([...group.ids, id])
                    }
                }
            };
        }, {});

        // Finalize groups and calculate timings
        const finalGroups = Object.entries(tempGroups).reduce((result, [timeline, groups]) => {
            console.log('tempGroups', tempGroups);

            const timelineResult = Object.entries(groups).reduce((acc, [rootId, group]) => {
                if (group.ids.size === 1) {
                    const [singleId] = Array.from(group.ids);
                    return { ...acc, [singleId]: group.elements[singleId] };
                }

                const idsArray = Array.from(group.ids);
                // Combine IDs into a single identifier
                const combinedId = idsArray.join('-');
                // Calculate startTime, endTime, and length for overlap groups
                const times = idsArray.map((id) => ({
                    endTime: group.elements[id].endTime,
                    startTime: group.elements[id].startTime
                }));
                const startTime = Math.min(...times.map((t) => t.startTime));
                const endTime = Math.max(...times.map((t) => t.endTime));
                const length = endTime - startTime;

                // console.log('Group', group);

                return {
                    ...acc,
                    [combinedId]: {
                        endTime,
                        id: combinedId,
                        instrumentName: timeline,
                        length,
                        locked: false,
                        overlapGroup: group.elements,
                        startTime
                    }
                };
            }, {});

            return { ...result, [timeline]: timelineResult };
        }, {});

        // Update overlap groups immutably
        setOverlapGroups((prevGroups) => {
            const mergedGroups = { ...prevGroups, ...finalGroups };

            // Avoid redundant updates
            if (JSON.stringify(previousBeat.current) !== JSON.stringify(mergedGroups)) {
                previousBeat.current = mergedGroups;
                return mergedGroups;
            }
            return prevGroups;
        });
    }, [processBeat, setOverlapGroups, previousBeat]);

    const findGroupForEvent = useCallback(
        (id) => {
            for (const [timeline, groups] of Object.entries(overlapGroups)) {
                for (const [groupId, group] of Object.entries(groups)) {
                    if (group.overlapGroup && group.overlapGroup[id]) {
                        return { groupId, timeline };
                    }
                    if (!group.overlapGroup && group.id === id) {
                        return { groupId: id, timeline };
                    }
                }
            }
            return null;
        },
        [overlapGroups]
    );

    return { findGroupForEvent, findOverlaps, processBeat };
};

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

    const elementsA = parent[rootA];
    const elementsB = parent[rootB];
    console.log('elementA', rootA);
    console.log('elementsB', rootB);

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

const verifyAndSortOverlapGroup = (overlapGroups, getProcessedElements) => {
    const orphanElements = [];

    overlapGroups.forEach((overlapGroup) => {
        const groupElement = overlapGroup.group;
        const childElements = getProcessedElements(groupElement);

        const overlappingElements = {};

        // Check for overlaps and build the overlappingElements object
        Object.values(childElements).forEach((currentElementA) => {
            let hasOverlap = false;

            Object.values(childElements).forEach((currentElementB) => {
                if (currentElementA !== currentElementB && isOverlapping(currentElementA, currentElementB)) {
                    hasOverlap = true;

                    overlappingElements[currentElementA.recording.id] = currentElementA.recording;
                    overlappingElements[currentElementB.recording.id] = currentElementB.recording;
                }
            });

            if (!hasOverlap) {
                currentElementA.element.destroy();
                orphanElements.push(currentElementA);
            }
        });

        if (orphanElements.length > 0) {
            // Update the group attributes with filtered elements

            overlapGroup.group.setAttrs({
                ...overlapGroup.group.attrs,
                'data-overlap-group': {
                    ...overlapGroup.group.attrs['data-overlap-group'],
                    elements: {}
                }
            });
        }
    });

    return { orphanElements };
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

        const { orphanElements } = verifyAndSortOverlapGroup(processedGroups, getProcessedElements);

        // Sort processed

        const test = [...processedElements, ...orphanElements];

        const sortedElements = test.sort((a, b) => {
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
        processedGroups.forEach((ovrlpGrp) => {
            const instrumentName = ovrlpGrp?.instrumentName || 'unknown';
            const hasElements = Object.keys(ovrlpGrp.group?.attrs['data-overlap-group'].elements || {}).length > 0;

            if (!objToSave[instrumentName]) {
                objToSave[instrumentName] = {};
            }

            if (!ovrlpGrp || !hasElements) {
                return;
            }

            objToSave[instrumentName][ovrlpGrp.id] = {
                elements: ovrlpGrp.elements,
                endTime: ovrlpGrp.endTime,
                id: ovrlpGrp.id,
                ids: ovrlpGrp.ids,
                instrumentName: ovrlpGrp.instrumentName,
                length: ovrlpGrp.length,
                locked: ovrlpGrp.locked,
                startTime: ovrlpGrp.startTime
            };
        });

        return objToSave;
    }, [getProcessedElements, getProcessedGroups, timelineRefs]);

    const findOverlaps = useCallback(() => {
        const processedData = processBeat();

        if (!processedData) return;
        const allElements = Object.entries(processedData).flatMap(([timeline, events]) => {
            return Object.values(events).flatMap((event) => {
                // if (event.groupData) {
                //     // Map over the elements and return individual objects
                //     return Object.values(event.elements).map((element) => ({
                //         ...element,
                //         timeline
                //     }));
                // }

                return {
                    ...event,
                    timeline
                };
            });
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

        console.log('allElements', allElements);

        // Organize overlap groups without mutations
        const tempGroups = allElements.reduce((groups, currentGroup) => {
            const { id, locked, timeline } = currentGroup;

            // Find the root ID and retrieve existing group data
            const rootId = find(parent, id);
            const existingGroup = processedData[timeline]?.[id] || {};

            // Ensure a consistent structure for the target group
            const targetGroup = groups[timeline]?.[rootId] || {
                ...existingGroup,
                ids: new Set()
            };

            const groupElements = Object.values(existingGroup.elements || {});

            // Helper to create or update a group
            const assignToGroup = (currentGroups, timelineKey, group, element) => {
                const updatedIds = new Set([...group.ids, element.id]);
                const formattedId = [...updatedIds].sort().join('-'); // Consistent ID format

                return {
                    ...currentGroups,
                    [timelineKey]: {
                        ...(currentGroups[timelineKey] || {}),
                        [formattedId]: {
                            elements: {
                                ...(group.elements || {}),
                                [element.id]: element
                            },
                            ids: updatedIds,
                            locked
                        }
                    }
                };
            };

            // Check if there are elements and assign them accordingly
            let updatedGroups = groups;
            if (groupElements.length === 0) {
                updatedGroups = assignToGroup(updatedGroups, timeline, targetGroup, existingGroup);
            } else {
                groupElements.forEach((element) => {
                    updatedGroups = assignToGroup(updatedGroups, timeline, targetGroup, element);
                });
            }

            return updatedGroups;
        }, {});

        // Finalize groups and calculate timings
        const finalGroups = Object.entries(tempGroups).reduce((result, [timeline, groups]) => {
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

                const sameGroup = processedData[timeline][combinedId];

                return {
                    ...acc,
                    [combinedId]: {
                        ...group,
                        ...sameGroup,
                        endTime,
                        id: combinedId,
                        instrumentName: timeline,
                        length,
                        locked: sameGroup?.locked || false,
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

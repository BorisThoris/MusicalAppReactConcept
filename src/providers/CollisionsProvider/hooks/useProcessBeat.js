import _, { isEqual } from 'lodash';
import { useCallback, useRef } from 'react';
import { createEvent } from '../../../globalHelpers/createSound';
import { isOverlapping } from '../overlapHelpers';

const verifyAndSortOverlapGroup = (overlapGroups, getProcessedElements) => {
    const orphanElements = [];
    const mergedOverlapGroups = [];

    // 1. Gather all child elements and record each element’s locked state.
    //    Each element’s locked state comes from its parent group.
    const allChildElements = [];
    const lockedMap = {}; // Map from recording id -> locked boolean

    overlapGroups.forEach(({ group, locked }) => {
        const children = Object.values(getProcessedElements(group));
        children.forEach((el) => {
            allChildElements.push(el);
            // Persist the locked state of the originating overlapGroup.
            lockedMap[el.recording.id] = locked || false;
        });
    });

    // If there are no elements, exit early.
    if (!allChildElements.length) {
        return { orphanElements, overlapGroups: [] };
    }

    // 2. Set up union-find for all elements.
    const parent = {};
    allChildElements.forEach((el) => {
        parent[el.recording.id] = el.recording.id;
    });

    // Find with path compression.
    const find = (id) => {
        if (parent[id] !== id) {
            parent[id] = find(parent[id]);
        }
        return parent[id];
    };

    // Union only if both elements have the same locked state.
    const union = (idA, idB) => {
        const repA = find(idA);
        const repB = find(idB);
        // If one element is locked and the other isn’t, do not merge.
        if (lockedMap[repA] !== lockedMap[repB]) return;
        if (repA !== repB) {
            parent[repB] = repA;
            // No need to update lockedMap since both are equal.
        }
    };

    // 3. For every pair, if they overlap, attempt a union.
    //    Overlap is determined by the global isOverlapping(el1, el2) function.
    for (let i = 0; i < allChildElements.length; i += 1) {
        for (let j = i + 1; j < allChildElements.length; j += 1) {
            if (isOverlapping(allChildElements[i], allChildElements[j])) {
                union(allChildElements[i].recording.id, allChildElements[j].recording.id);
            }
        }
    }

    // 4. Group elements by their union-find representative.
    const groupsByRoot = {};
    allChildElements.forEach((el) => {
        const rep = find(el.recording.id);
        if (!groupsByRoot[rep]) groupsByRoot[rep] = [];
        groupsByRoot[rep].push(el);
    });

    // 5. For each group: if more than one element, merge them; else treat as orphan.
    Object.values(groupsByRoot).forEach((groupArray) => {
        if (groupArray.length > 1) {
            const startTime = Math.min(...groupArray.map((el) => el.recording.startTime));
            const endTime = Math.max(...groupArray.map((el) => el.recording.endTime));
            const newId = groupArray[0].recording.id;
            const { instrumentName, rect } = groupArray[0].recording;

            // Determine the locked state from the union-find representative.
            const groupLocked = lockedMap[find(newId)];

            mergedOverlapGroups.push({
                elements: groupArray.reduce((acc, el) => {
                    acc[el.recording.id] = el.recording;
                    return acc;
                }, {}),
                endTime,
                group: null,
                id: newId,
                instrumentName,
                length: endTime - startTime,
                // Original group is no longer used.
                locked: groupLocked,
                node: groupArray[0].element,
                rect,
                startTime
            });
        } else {
            orphanElements.push(groupArray[0]);
        }
    });

    return { orphanElements, overlapGroups: mergedOverlapGroups };
};

export const useProcessBeat = ({ getProcessedElements, getProcessedGroups, timelineRefs }) => {
    const prevElementsRef = useRef(null);
    const prevGroupsRef = useRef(null);
    const prevResultRef = useRef(null);

    const processBeat = useCallback(() => {
        const processedElements = getProcessedElements();
        const processedGroups = getProcessedGroups();

        // Compare with previous elements and groups
        const elementsChanged = !prevElementsRef.current || !isEqual(processedElements, prevElementsRef.current);
        const groupsChanged = !prevGroupsRef.current || !isEqual(processedGroups, prevGroupsRef.current);

        if (!elementsChanged && !groupsChanged) {
            return prevResultRef.current; // Return cached result if no changes
        }

        // Process overlap groups with the union-find helper.
        const { orphanElements, overlapGroups } = verifyAndSortOverlapGroup(processedGroups, getProcessedElements);

        prevElementsRef.current = processedElements;
        prevGroupsRef.current = overlapGroups;

        // Create a set of element IDs found in any overlap group.
        const groupElementIds = new Set();
        overlapGroups.forEach((overlapGroup) => {
            const groupElements = Object.values(overlapGroup.elements);
            groupElements.forEach((el) => groupElementIds.add(el.id));
        });

        // Remove elements that are already in an overlap group.
        const uniqueProcessedElements = processedElements.filter((el) => !groupElementIds.has(el.recording.id));

        // Merge uniqueProcessedElements with orphanElements.
        const allElements = [...uniqueProcessedElements, ...orphanElements];

        const sortedElements = allElements.sort((a, b) => {
            if (a.recording.instrumentName < b.recording.instrumentName) return -1;
            if (a.recording.instrumentName > b.recording.instrumentName) return 1;
            return a.recording.id - b.recording.id;
        });

        // Process individual (non-group) elements.
        const objToSave = sortedElements.reduce((acc, { element, recording }) => {
            const newRec = createEvent({ instrumentName: recording.instrumentName, recording });

            if (!acc[recording.instrumentName]) acc[recording.instrumentName] = {};

            acc[recording.instrumentName][recording.id] = {
                ...newRec,
                node: element,
                rect: element.getClientRect() // retain the original element as node
            };

            return acc;
        }, {});

        // Ensure timeline keys exist in the result.
        Object.keys(timelineRefs).forEach((timelineName) => {
            if (!objToSave[timelineName]) {
                objToSave[timelineName] = {};
            }
        });

        // Process each overlap group and map to new IDs.
        overlapGroups.forEach(
            ({
                elements = {},
                endTime,
                id,
                instrumentName = 'FALL BACK TIMELINE VALUE',
                length,
                locked,
                node,
                rect,
                startTime // representative node from the union-find grouping
            }) => {
                const hasElements = Object.keys(elements).length > 0;
                if (!id || !hasElements) return;

                objToSave[instrumentName] = objToSave[instrumentName] || {};

                const recreatedElements = Object.fromEntries(
                    Object.values(elements).map((element) => {
                        const newElement = createEvent({ instrumentName: element.instrumentName, recording: element });
                        return [newElement.id, newElement];
                    })
                );

                objToSave[instrumentName][id] = {
                    elements: recreatedElements,
                    endTime,
                    id,
                    ids: Object.keys(recreatedElements),
                    instrumentName,
                    length,
                    locked,
                    node,
                    rect,
                    startTime // attach the representative node for the group
                };
            }
        );

        prevResultRef.current = objToSave; // Cache the result.
        return objToSave;
    }, [getProcessedElements, getProcessedGroups, timelineRefs]);

    return { processBeat };
};

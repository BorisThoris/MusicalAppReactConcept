import _, { isEqual } from 'lodash';
import { useCallback, useRef } from 'react';
import { createEvent } from '../../../globalHelpers/createSound';
import { isOverlapping } from '../overlapHelpers';

/**
 * Groups overlapping elements and ensures each merged group retains its representative DOM node.
 * This updated version now uses instrumentName/layer to determine if two elements even qualify for grouping,
 * and it only compares horizontal (X) overlap (ignoring the Y axis).
 */
const verifyAndSortOverlapGroup = (overlapGroups, getProcessedElements) => {
    const orphanElements = [];
    const mergedOverlapGroups = [];

    // 1. Gather all child elements and record each element’s locked state.
    const allChildElements = [];
    const lockedMap = {}; // Maps recording id -> locked boolean

    overlapGroups.forEach(({ group, locked }) => {
        const children = Object.values(getProcessedElements(group));
        children.forEach((el) => {
            allChildElements.push(el);
            // Persist the locked state from the original overlap group.
            lockedMap[el.recording.id] = locked || false;
        });
    });

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
        if (lockedMap[repA] !== lockedMap[repB]) return;
        if (repA !== repB) {
            parent[repB] = repA;
        }
    };

    // 3. For every pair, compare only if they share the same instrumentName.
    for (let i = 0; i < allChildElements.length; i += 1) {
        for (let j = i + 1; j < allChildElements.length; j += 1) {
            if (allChildElements[i].recording.instrumentName !== allChildElements[j].recording.instrumentName) {
                // eslint-disable-next-line no-continue
                continue;
            }
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

    // 5. For each group: if more than one element, merge them and preserve a representative node.
    Object.values(groupsByRoot).forEach((groupArray) => {
        if (groupArray.length > 1) {
            const startTime = Math.min(...groupArray.map((el) => el.recording.startTime));
            const endTime = Math.max(...groupArray.map((el) => el.recording.endTime));
            const newId = groupArray[0].recording.id;
            const { instrumentName, rect } = groupArray[0].recording;

            // Get the locked state from the union-find representative.
            const groupLocked = lockedMap[find(newId)];

            mergedOverlapGroups.push({
                elements: groupArray.reduce((acc, el) => {
                    acc[el.recording.id] = {
                        ...el.recording,
                        node: el.element
                    };
                    return acc;
                }, {}),
                endTime,
                group: null,
                id: newId,
                instrumentName,
                length: endTime - startTime,
                locked: groupLocked,
                // Preserve the node of the first element in the group.
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

/**
 * Custom hook to process beat elements and groups.
 * It calculates overlaps, caches results, and organizes events by instrument (layer).
 */
export const useProcessBeat = ({ getProcessedElements, getProcessedGroups, timelineRefs }) => {
    const prevElementsRef = useRef(null);
    const prevGroupsRef = useRef(null);
    const prevResultRef = useRef(null);

    const processBeat = useCallback(() => {
        const processedElements = getProcessedElements();
        const processedGroups = getProcessedGroups();

        // Compare with previous elements and groups.
        const elementsChanged = !prevElementsRef.current || !isEqual(processedElements, prevElementsRef.current);
        const groupsChanged = !prevGroupsRef.current || !isEqual(processedGroups, prevGroupsRef.current);

        if (!elementsChanged && !groupsChanged) {
            return prevResultRef.current; // Return cached result if no changes.
        }

        // Process overlap groups using the updated union-find helper.
        const { orphanElements, overlapGroups } = verifyAndSortOverlapGroup(processedGroups, getProcessedElements);

        prevElementsRef.current = processedElements;
        prevGroupsRef.current = overlapGroups;

        // Create a set of element IDs that are part of an overlap group.
        const groupElementIds = new Set();
        overlapGroups.forEach((overlapGroup) => {
            const groupElements = Object.values(overlapGroup.elements);
            groupElements.forEach((el) => groupElementIds.add(el.id));
        });

        // Remove elements already in an overlap group.
        const uniqueProcessedElements = processedElements.filter((el) => !groupElementIds.has(el.recording.id));

        // Merge unique elements with orphan elements.
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
                node: element, // Persist the node for single elements.
                rect: element.getClientRect() // Capture the element’s rectangle.
            };

            return acc;
        }, {});

        // Process each overlap group, preserving the representative node.
        overlapGroups.forEach(
            ({
                elements = {},
                endTime,
                id,
                instrumentName = 'FALL BACK TIMELINE VALUE',
                length,
                locked,
                node, // Representative node from the union-find grouping.
                rect,
                startTime
            }) => {
                const hasElements = Object.keys(elements).length > 0;
                if (!id || !hasElements) return;

                objToSave[instrumentName] = objToSave[instrumentName] || {};

                const recreatedElements = Object.fromEntries(
                    Object.values(elements).map((element) => {
                        const newElement = createEvent({
                            instrumentName: element.instrumentName,
                            recording: element
                        });
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
                    node, // Preserve the group’s representative node.
                    rect,
                    startTime
                };
            }
        );

        // Final patch: ensure all timelines exist
        Object.keys(timelineRefs.current).forEach((instrumentName) => {
            if (!objToSave[instrumentName]) {
                objToSave[instrumentName] = {};
            }
        });

        prevResultRef.current = objToSave;

        return objToSave;
    }, [getProcessedElements, getProcessedGroups, timelineRefs]);

    return { processBeat };
};

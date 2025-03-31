import _, { isEqual } from 'lodash';
import { useCallback, useRef } from 'react';
import { createEvent } from '../../../globalHelpers/createSound';
import { isOverlapping } from '../overlapHelpers';

const verifyAndSortOverlapGroup = (overlapGroups, getProcessedElements) => {
    const orphanElements = [];
    const newOverlapGroups = [];

    // Combine child elements from all overlap groups
    let allChildElements = [];
    overlapGroups.forEach((overlapGroup) => {
        const groupElement = overlapGroup.group;
        const childElements = Object.values(getProcessedElements(groupElement));
        if (childElements.length) {
            allChildElements = allChildElements.concat(childElements);
        }
    });

    if (!allChildElements.length) {
        return { orphanElements, overlapGroups: [] };
    }

    // Initialize union-find: each element’s id points to itself.
    const parent = {};
    allChildElements.forEach((el) => {
        parent[el.recording.id] = el.recording.id;
    });

    const find = (id) => {
        if (parent[id] !== id) {
            parent[id] = find(parent[id]);
        }
        return parent[id];
    };

    const union = (idA, idB) => {
        const rootA = find(idA);
        const rootB = find(idB);
        if (rootA !== rootB) {
            parent[rootB] = rootA;
        }
    };

    // Check every pair of elements – they will merge if overlapping.
    for (let i = 0; i < allChildElements.length; i += 1) {
        for (let j = i + 1; j < allChildElements.length; j += 1) {
            if (isOverlapping(allChildElements[i], allChildElements[j])) {
                union(allChildElements[i].recording.id, allChildElements[j].recording.id);
            }
        }
    }

    // Group elements by their union-find root.
    const groupsMap = {};
    allChildElements.forEach((el) => {
        const root = find(el.recording.id);
        if (!groupsMap[root]) {
            groupsMap[root] = [];
        }
        groupsMap[root].push(el);
    });

    // For each union-find group:
    // - If more than one element exists, create a merged overlap group.
    // - Otherwise, treat the single element as an orphan.
    Object.values(groupsMap).forEach((groupArray) => {
        if (groupArray.length > 1) {
            // Compute merged group properties.
            const startTime = Math.min(...groupArray.map((el) => el.recording.startTime));
            const endTime = Math.max(...groupArray.map((el) => el.recording.endTime));
            const length = endTime - startTime;
            // Use the first element’s id as a fallback new id.
            const newId = groupArray[0].recording.id;
            const { instrumentName } = groupArray[0].recording;
            const { rect } = groupArray[0].recording;

            newOverlapGroups.push({
                elements: groupArray.reduce((acc, el) => {
                    acc[el.recording.id] = el.recording;
                    return acc;
                }, {}),
                endTime,
                group: null, // original group is no longer used
                id: newId,
                instrumentName,
                length,
                node: groupArray[0].element,
                rect,
                startTime // retain representative node from the first element
            });
        } else {
            orphanElements.push(groupArray[0]);
        }
    });

    return { orphanElements, overlapGroups: newOverlapGroups };
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

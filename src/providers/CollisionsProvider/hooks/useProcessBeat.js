import _, { isEqual } from 'lodash';
import { useCallback, useRef } from 'react';
import { createEvent } from '../../../globalHelpers/createSound';
import { isOverlapping } from '../overlapHelpers';

/**
 * Groups overlapping elements and ensures each merged group retains its representative DOM node
 * and up-to-date bounding rectangle. Prevents merging between different locked groups.
 */

export const verifyAndSortOverlapGroup = (overlapGroups, getProcessedElements) => {
    const orphanElements = [];
    const mergedOverlapGroups = [];

    // 1. Gather all child elements and record each element's locked state and original group index.
    const allChildElements = [];
    const lockedMap = {}; // Maps recording id -> locked boolean
    const originalGroupMap = {}; // Maps recording id -> original overlapGroups index

    overlapGroups.forEach(({ group, locked }, idx) => {
        const grpId = idx;
        const children = Object.values(getProcessedElements(group));
        children.forEach((el) => {
            allChildElements.push(el);
            lockedMap[el.recording.id] = Boolean(locked);
            originalGroupMap[el.recording.id] = grpId;
        });
    });

    if (!allChildElements.length) {
        return { orphanElements, overlapGroups: [] };
    }

    // 2. Union-find setup
    const parent = {};
    allChildElements.forEach((el) => {
        parent[el.recording.id] = el.recording.id;
    });

    const find = (id) => {
        if (parent[id] !== id) parent[id] = find(parent[id]);
        return parent[id];
    };

    const union = (idA, idB) => {
        const repA = find(idA);
        const repB = find(idB);

        // never mix locked with unlocked
        if (lockedMap[repA] !== lockedMap[repB]) return;

        // if both are locked but from different original groups, don't merge
        if (lockedMap[repA] && lockedMap[repB] && originalGroupMap[idA] !== originalGroupMap[idB]) return;

        if (repA !== repB) parent[repB] = repA;
    };

    // 3. Union by horizontal overlap and same instrument
    for (let i = 0; i < allChildElements.length; i += 1) {
        for (let j = i + 1; j < allChildElements.length; j += 1) {
            const a = allChildElements[i];
            const b = allChildElements[j];
            // Only consider same instrument
            if (a.recording.instrumentName !== b.recording.instrumentName) {
                break;
            }
            if (isOverlapping(a, b)) union(a.recording.id, b.recording.id);
        }
    }

    // 4. Group by root
    const groupsByRoot = {};
    allChildElements.forEach((el) => {
        const rep = find(el.recording.id);
        groupsByRoot[rep] = groupsByRoot[rep] || [];
        groupsByRoot[rep].push(el);
    });

    // 5. Build merged groups with nodes, rects, and reset selection state
    Object.values(groupsByRoot).forEach((groupArray) => {
        if (groupArray.length > 1) {
            const startTime = Math.min(...groupArray.map((el) => el.recording.startTime));
            const endTime = Math.max(...groupArray.map((el) => el.recording.endTime));
            const newId = groupArray[0].recording.id;
            const { instrumentName } = groupArray[0].recording;
            const groupLocked = lockedMap[find(newId)];
            const rep = groupArray[0];

            // Reset selection state for new groups - don't auto-select
            // Groups should only be selected when explicitly chosen by the user
            const groupIsSelected = false;

            // Build group elements with up-to-date rects
            const elements = groupArray.reduce((acc, el) => {
                acc[el.recording.id] = {
                    ...el.recording,
                    element: el.element,
                    rect: el.element.getClientRect()
                };
                return acc;
            }, {});

            mergedOverlapGroups.push({
                element: rep.element,
                elements,
                endTime,
                eventLength: endTime - startTime,
                id: newId,
                instrumentName,
                isSelected: groupIsSelected,
                locked: groupLocked,
                rect: rep.element.getClientRect(),
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

        const elementsChanged = !prevElementsRef.current || !isEqual(processedElements, prevElementsRef.current);
        const groupsChanged = !prevGroupsRef.current || !isEqual(processedGroups, prevGroupsRef.current);
        if (!elementsChanged && !groupsChanged) return prevResultRef.current;

        const { orphanElements, overlapGroups } = verifyAndSortOverlapGroup(processedGroups, getProcessedElements);

        prevElementsRef.current = processedElements;
        prevGroupsRef.current = overlapGroups;

        const groupElementIds = new Set();
        overlapGroups.forEach((g) => Object.values(g.elements).forEach((el) => groupElementIds.add(el.id)));

        const uniqueProcessedElements = processedElements.filter((el) => !groupElementIds.has(el.recording.id));
        const allElements = [...uniqueProcessedElements, ...orphanElements];

        const sortedElements = allElements.sort((a, b) => {
            if (a.recording.instrumentName < b.recording.instrumentName) return -1;
            if (a.recording.instrumentName > b.recording.instrumentName) return 1;
            return a.recording.id - b.recording.id;
        });

        // Single elements
        const objToSave = sortedElements.reduce((acc, { element, recording }) => {
            const newRec = createEvent({ instrumentName: recording.instrumentName, recording });
            acc[recording.instrumentName] = acc[recording.instrumentName] || {};
            acc[recording.instrumentName][recording.id] = {
                ...newRec,
                element,
                rect: element.getClientRect()
            };
            return acc;
        }, {});

        // Overlap groups
        overlapGroups.forEach((group) => {
            const { element, elements, endTime, eventLength, id, instrumentName, isSelected, locked, startTime } =
                group;
            objToSave[instrumentName] = objToSave[instrumentName] || {};

            // Recreate child events with fresh rects
            const recreatedElements = Object.values(elements).reduce((map, child) => {
                const newChild = createEvent({ instrumentName: child.instrumentName, recording: child });
                // eslint-disable-next-line no-param-reassign
                map[newChild.id] = {
                    ...newChild,
                    element: child.element,
                    rect: child.element.getClientRect()
                };
                return map;
            }, {});

            objToSave[instrumentName][id] = {
                element,
                elements: recreatedElements,
                endTime,
                eventLength,
                id,
                ids: Object.keys(recreatedElements),
                instrumentName,
                isSelected,
                locked,
                node: element,
                rect: element.getClientRect(),
                startTime
            };
        });

        // Ensure all timelines exist
        Object.keys(timelineRefs.current).forEach((inst) => {
            if (!objToSave[inst]) objToSave[inst] = {};
        });

        prevResultRef.current = objToSave;
        return objToSave;
    }, [getProcessedElements, getProcessedGroups, timelineRefs]);

    return { processBeat };
};

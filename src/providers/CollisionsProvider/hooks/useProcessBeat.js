import _, { isEqual } from 'lodash';
import { useCallback, useRef } from 'react';
import { createEvent } from '../../../globalHelpers/createSound';
import { isOverlapping } from '../overlapHelpers';

const verifyAndSortOverlapGroup = (overlapGroups, getProcessedElements) => {
    const orphanElements = [];

    const updatedOverlapGroups = overlapGroups.map((overlapGroup) => {
        const groupElement = overlapGroup.group;
        // Get the child elements and sort them (adjust the sort field as needed).
        const childElements = Object.values(getProcessedElements(groupElement));
        childElements.sort((a, b) => a.recording.startTime - b.recording.startTime);

        const validGroup = [];
        for (let i = 0; i < childElements.length; i += 1) {
            if (i === 0) {
                // Always include the first element.
                validGroup.push(childElements[i]);
            } else {
                // Check if the current element overlaps with the last valid element.
                // eslint-disable-next-line no-lonely-if
                if (isOverlapping(childElements[i], validGroup[validGroup.length - 1])) {
                    validGroup.push(childElements[i]);
                } else {
                    // If the chain is broken, add the current element and every subsequent element as orphans.
                    for (let j = i; j < childElements.length; j += 1) {
                        orphanElements.push(childElements[j]);
                    }
                    break; // Exit the loop for this group.
                }
            }
        }

        // Build a new object mapping of valid elements.
        const newElements = validGroup.reduce((acc, element) => {
            acc[element.recording.id] = element.recording;
            return acc;
        }, {});

        return {
            ...overlapGroup,
            elements: newElements
        };
    });

    return { orphanElements, overlapGroups: updatedOverlapGroups };
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

        // Process overlap groups with the refactored helper.
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

        const objToSave = sortedElements.reduce((acc, { element, recording }) => {
            const newRec = createEvent({ instrumentName: recording.instrumentName, recording });

            if (!acc[recording.instrumentName]) acc[recording.instrumentName] = {};

            acc[recording.instrumentName][recording.id] = {
                ...newRec,
                rect: element.getClientRect()
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
                startTime
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
                    startTime
                };
            }
        );

        prevResultRef.current = objToSave; // Cache the result.
        return objToSave;
    }, [getProcessedElements, getProcessedGroups, timelineRefs]);

    return { processBeat };
};

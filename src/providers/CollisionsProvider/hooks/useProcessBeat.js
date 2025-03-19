import _, { isEqual } from 'lodash';
import { useCallback, useRef } from 'react';
import { createEvent } from '../../../globalHelpers/createSound';
import { isOverlapping } from '../overlapHelpers';

const verifyAndSortOverlapGroup = (overlapGroups, getProcessedElements) => {
    const orphanElements = [];

    const updatedOverlapGroups = overlapGroups.map((overlapGroup) => {
        const groupElement = overlapGroup.group;

        const childElements = Object.values(getProcessedElements(groupElement)); // Ensure it's an array

        const newOverlappingElements = new Map(); // Avoid duplicates
        const newChildElements = [];
        const processedOrphans = new Set(); // Track elements added to orphanElements

        // Check overlaps for all elements
        childElements.forEach((currentElementA) => {
            let hasOverlap = false;

            childElements.forEach((currentElementB) => {
                if (currentElementA !== currentElementB && isOverlapping(currentElementA, currentElementB)) {
                    hasOverlap = true;

                    // Add both elements to overlapping elements
                    newOverlappingElements.set(currentElementA.recording.id, currentElementA.recording);
                    newOverlappingElements.set(currentElementB.recording.id, currentElementB.recording);
                }
            });

            // If no overlap is found, push the element to orphans (if not already added)
            if (!hasOverlap && !processedOrphans.has(currentElementA.recording.id)) {
                orphanElements.push(currentElementA);
                processedOrphans.add(currentElementA.recording.id); // Avoid duplicates in orphans
            } else if (hasOverlap) {
                // If overlapping, add to newChildElements
                newChildElements.push(currentElementA);
            }
        });

        // Create a new elements object from overlapping elements
        const newElements = Array.from(newOverlappingElements.values()).reduce((acc, element) => {
            acc[element.id] = element;
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
            return prevResultRef.current; // Return the cached result if no changes
        }

        const { orphanElements, overlapGroups } = verifyAndSortOverlapGroup(processedGroups, getProcessedElements);

        prevElementsRef.current = processedElements;
        prevGroupsRef.current = overlapGroups;

        const allElements = [...processedElements, ...Object.values(orphanElements)];

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

        Object.keys(timelineRefs).forEach((timelineName) => {
            if (!objToSave[timelineName]) {
                objToSave[timelineName] = {};
            }
        });

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
                const hasElements = Object.keys(elements || {}).length > 0;

                if (!id || !hasElements) return;

                objToSave[instrumentName] ??= {};

                // Process elements with createEvent and map to new IDs
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
                    ids: Object.keys(recreatedElements), // Set the new element IDs
                    instrumentName,
                    length,
                    locked,
                    startTime
                };
            }
        );

        prevResultRef.current = objToSave; // Cache the result

        return objToSave;
    }, [getProcessedElements, getProcessedGroups, timelineRefs]);

    return { processBeat };
};

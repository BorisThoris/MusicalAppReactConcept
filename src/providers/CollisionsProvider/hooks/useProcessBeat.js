import _, { isEqual } from 'lodash';
import { useCallback, useRef } from 'react';
import { createEvent } from '../../../globalHelpers/createSound';
import { isOverlapping } from '../overlapHelpers';

const verifyAndSortOverlapGroup = (overlapGroups, getProcessedElements) => {
    const orphanElements = [];

    const updatedOverlapGroups = overlapGroups.map((overlapGroup) => {
        const groupElement = overlapGroup.group;
        const childElements = Object.values(getProcessedElements(groupElement));
        const newOverlappingElements = new Map();

        // Array to track which child element overlaps with any other
        const hasOverlap = new Array(childElements.length).fill(false);

        // Compare each pair only once
        for (let i = 0; i < childElements.length; i += 1) {
            for (let j = i + 1; j < childElements.length; j += 1) {
                if (isOverlapping(childElements[i], childElements[j])) {
                    hasOverlap[i] = true;
                    hasOverlap[j] = true;
                    newOverlappingElements.set(childElements[i].recording.id, childElements[i].recording);
                    newOverlappingElements.set(childElements[j].recording.id, childElements[j].recording);
                }
            }
        }

        // Add elements without any overlap to orphanElements
        for (let i = 0; i < childElements.length; i += 1) {
            if (!hasOverlap[i]) {
                orphanElements.push(childElements[i]);
            }
        }

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
            return prevResultRef.current; // Return cached result if no changes
        }

        // Process overlap groups
        const { orphanElements, overlapGroups } = verifyAndSortOverlapGroup(processedGroups, getProcessedElements);

        prevElementsRef.current = processedElements;
        prevGroupsRef.current = overlapGroups;

        // Create a set of element IDs found in any overlap group
        const groupElementIds = new Set();
        overlapGroups.forEach((overlapGroup) => {
            const groupElements = Object.values(overlapGroup.elements);
            groupElements.forEach((el) => groupElementIds.add(el.id));
        });

        // Remove elements that are already in an overlap group
        const uniqueProcessedElements = processedElements.filter((el) => !groupElementIds.has(el.recording.id));

        // Now merge uniqueProcessedElements with orphanElements (which are group children with no overlap)
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

        // Ensure timeline keys exist in the result
        Object.keys(timelineRefs).forEach((timelineName) => {
            if (!objToSave[timelineName]) {
                objToSave[timelineName] = {};
            }
        });

        // Process each overlap group and map to new IDs
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

        prevResultRef.current = objToSave; // Cache the result
        return objToSave;
    }, [getProcessedElements, getProcessedGroups, timelineRefs]);

    return { processBeat };
};

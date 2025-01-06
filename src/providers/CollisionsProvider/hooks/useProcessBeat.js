import { isEqual } from 'lodash';
import { useCallback, useRef } from 'react';
import { createEvent } from '../../../globalHelpers/createSound';
import { isOverlapping } from '../overlapHelpers';

const verifyAndSortOverlapGroup = (overlapGroups, getProcessedElements) => {
    const orphanElements = [];
    const updatedOverlapGroups = overlapGroups.map((overlapGroup) => {
        const groupElement = overlapGroup.group;
        const childElements = getProcessedElements(groupElement);

        const newOverlappingElements = {};
        const newChildElements = [];

        // Check for overlaps and build the newOverlappingElements object
        Object.values(childElements).forEach((currentElementA) => {
            let hasOverlap = false;

            Object.values(childElements).forEach((currentElementB) => {
                if (currentElementA !== currentElementB && isOverlapping(currentElementA, currentElementB)) {
                    hasOverlap = true;
                    newOverlappingElements[currentElementA.recording.id] = currentElementA.recording;
                    newOverlappingElements[currentElementB.recording.id] = currentElementB.recording;
                }
            });

            if (!hasOverlap) {
                // If there's no overlap, consider it an orphan element
                orphanElements.push(currentElementA);
            } else {
                // Retain the element in the group if it overlaps
                newChildElements.push(currentElementA);
            }
        });

        // Return a new overlap group with updated attributes and child elements
        return {
            ...overlapGroup,
            group: {
                ...groupElement,
                attrs: {
                    ...groupElement.attrs,
                    'data-overlap-group': {
                        ...groupElement.attrs['data-overlap-group'],
                        elements: newChildElements.reduce((acc, element) => {
                            acc[element.recording.id] = element.recording;
                            return acc;
                        }, {})
                    }
                }
            }
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
            // console.log('No Diff');

            return prevResultRef.current; // Return the cached result if no changes
        }

        const { orphanElements, overlapGroups } = verifyAndSortOverlapGroup(processedGroups, getProcessedElements);

        // console.log('Processed Elements', processedElements);
        // console.log('ORPHANS', orphanElements);

        prevElementsRef.current = processedElements;
        prevGroupsRef.current = overlapGroups;

        const allElements = [...processedElements, ...orphanElements];

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

        overlapGroups.forEach((ovrlpGrp) => {
            const instrumentName = ovrlpGrp?.instrumentName || 'FALL BACK TIMELINE VALUE';
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

        prevResultRef.current = objToSave; // Cache the result
        return objToSave;
    }, [getProcessedElements, getProcessedGroups, timelineRefs]);

    return { processBeat };
};

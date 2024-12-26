import { useCallback } from 'react';
import { createEvent } from '../../../globalHelpers/createSound';
import { isOverlapping } from './useFindOverlaps';

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

export const useProcessBeat = ({ getProcessedElements, getProcessedGroups, timelineRefs }) => {
    const processBeat = useCallback(() => {
        const processedElements = getProcessedElements();
        const processedGroups = getProcessedGroups();

        const { orphanElements } = verifyAndSortOverlapGroup(processedGroups, getProcessedElements);

        // Sort processed

        const allElements = [...processedElements, ...orphanElements];

        const sortedElements = allElements.sort((a, b) => {
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

        console.log('processedGroups', processedGroups);

        // Persist processed groups
        processedGroups.forEach((ovrlpGrp) => {
            const instrumentName = ovrlpGrp?.instrumentName || 'sadec batec';
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

    return { processBeat };
};

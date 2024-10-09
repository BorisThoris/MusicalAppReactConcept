import cloneDeep from 'lodash/cloneDeep';
import forEach from 'lodash/forEach';
import isEmpty from 'lodash/isEmpty';
import { useCallback, useState } from 'react';

export const useOverlapGroups = ({ getProcessedElements, setHasChanged, timelineRefs }) => {
    const [overlapGroups, setOverlapGroups] = useState({});

    // Refactored calculateCollisions to check overlaps based on bounding boxes
    const calculateCollisions = useCallback(() => {
        if (isEmpty(timelineRefs)) {
            console.log('No timelineRefs provided, skipping collision calculation.');
            return;
        }

        // Retrieve all elements from the stage that represent sound events
        const allElements = getProcessedElements();

        const overlappingElements = new Set();

        // Helper function to check if two bounding boxes overlap
        const checkBoundingBoxOverlap = (box1, box2) => {
            return !(
                box1.x > box2.x + box2.width ||
                box1.x + box1.width < box2.x ||
                box1.y > box2.y + box2.height ||
                box1.y + box1.height < box2.y
            );
        };

        console.log('ALL ELEMENTS');
        console.log(allElements);

        // Iterate over all elements and check for overlaps
        forEach(allElements, (element, i) => {
            const elementBox = element.element.getClientRect(); // Get the bounding box of the element

            // Compare each element's bounding box with every other element's bounding box
            forEach(allElements, (otherElement, j) => {
                if (i !== j) {
                    const otherBox = otherElement.element.getClientRect(); // Get the bounding box of the other element

                    // Check if the two bounding boxes overlap
                    if (checkBoundingBoxOverlap(elementBox, otherBox)) {
                        console.log('true');
                        overlappingElements.add(element.element);
                        overlappingElements.add(otherElement.element);
                    }
                }
            });
        });

        // Apply styles to overlapping elements
        const styleOverlappingElements = (overlappingShapes) => {
            forEach(overlappingShapes, (shape) => {
                shape.to({
                    duration: 0.2,
                    fill: 'yellow', // Example fill for visual debugging
                    opacity: 1,
                    scaleX: 1.2,
                    scaleY: 1.2,
                    shadowBlur: 30,
                    shadowColor: 'blue',
                    stroke: 'limegreen',
                    strokeWidth: 6
                });
            });
        };

        const resetElementStyle = (shape) => {
            shape.to({
                duration: 0.2,
                shadowColor: 'black',
                stroke: 'black'
            });
        };

        // Apply styles to all overlapping elements or reset if no overlap
        if (overlappingElements.size > 0) {
            styleOverlappingElements([...overlappingElements]);
        } else {
            // If no overlaps are found, reset styles for all elements
            forEach(allElements, (element) => {
                resetElementStyle(element.element);
            });
        }

        setHasChanged(true);
    }, [timelineRefs, getProcessedElements, setHasChanged]);

    const calculateOverlapsForAllInstruments = useCallback((newOverlapGroups) => {
        const recalculatedGroups = cloneDeep(newOverlapGroups);
        return recalculatedGroups;
    }, []);

    return {
        calculateCollisions,
        calculateOverlapsForAllInstruments,
        overlapGroups,
        setOverlapGroups
    };
};

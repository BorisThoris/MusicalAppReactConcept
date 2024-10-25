import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { CollisionsContext } from '../../../../providers/CollisionsProvider/CollisionsProvider';

// Utility function for detecting overlaps
const isOverlapping = (rectA, rectB) =>
    !(
        rectA.x > rectB.x + rectB.width ||
        rectA.x + rectA.width < rectB.x ||
        rectA.y > rectB.y + rectB.height ||
        rectA.y + rectA.height < rectB.y
    );

// Custom hook to manage overlap detection
export const useOverlaps = ({ eventGroups }) => {
    const { getProcessedElements } = useContext(CollisionsContext);

    const elements = getProcessedElements();

    const [overlappingIds, setOverlappingIds] = useState(new Set());
    const [overlapsCalculated, setOverlapsCalculated] = useState(false);

    // Memoize element rects to avoid recalculating on each render
    const elementRects = useMemo(() => {
        return elements.map((el) => ({
            id: el.element.attrs['data-recording'].id,
            rect: el.element.getClientRect()
        }));
    }, [elements]);

    // Function to calculate overlaps
    const findOverlaps = useCallback(() => {
        const overlaps = new Set();

        elementRects.forEach((elementA, idxA) => {
            const rectA = elementA.rect;

            for (let idxB = 0; idxB < idxA; idxB += 1) {
                const rectB = elementRects[idxB].rect;

                if (isOverlapping(rectA, rectB)) {
                    overlaps.add(elementA.id);
                    overlaps.add(elementRects[idxB].id);
                }
            }
        });

        // Update state only if overlaps have changed
        setOverlappingIds((prev) => {
            const prevArr = Array.from(prev);
            const overlapsArr = Array.from(overlaps);
            if (prevArr.length !== overlapsArr.length || !prevArr.every((val, idx) => val === overlapsArr[idx])) {
                return overlaps;
            }
            return prev;
        });

        setOverlapsCalculated(true); // Mark overlaps as calculated
    }, [elementRects]);

    // Effect to trigger recalculation of overlaps when necessary
    useEffect(() => {
        if (elements.length > 0 && !overlapsCalculated) {
            findOverlaps();
        }
    }, [elements.length, overlapsCalculated, findOverlaps]);

    // Effect to reset the overlap calculations when eventGroups change
    useEffect(() => {
        findOverlaps();
    }, [eventGroups, findOverlaps]);

    // Function to reset overlaps manually, if needed (e.g., after a drag ends)
    const resetOverlaps = useCallback(() => {
        setOverlapsCalculated(false);
    }, []);

    return { findOverlaps, overlappingIds, resetOverlaps };
};

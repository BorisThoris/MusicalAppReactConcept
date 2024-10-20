import { get } from 'lodash';
import { useEffect, useState } from 'react';

const isOverlapping = (rectA, rectB) => {
    return !(
        rectA.x > rectB.x + rectB.width ||
        rectA.x + rectA.width < rectB.x ||
        rectA.y > rectB.y + rectB.height ||
        rectA.y + rectA.height < rectB.y
    );
};

export const useOverlapDetection = (groupRef, allElements, elementId) => {
    const [isOverlappingState, setIsOverlappingState] = useState(false);

    useEffect(() => {
        const checkOverlap = () => {
            let overlapping = false;

            if (groupRef.current) {
                const currentElementRect = groupRef.current.getClientRect();

                allElements?.forEach((otherElement) => {
                    const otherElementId = get(otherElement, "element.attrs['data-recording'].id");

                    if (otherElementId !== elementId && otherElement.element) {
                        const otherElementRect = otherElement.element.getClientRect();

                        if (isOverlapping(currentElementRect, otherElementRect)) {
                            overlapping = true;
                        }
                    }
                });

                setIsOverlappingState(overlapping);
            }
        };

        checkOverlap();
    }, [groupRef, allElements, elementId]);

    return isOverlappingState;
};

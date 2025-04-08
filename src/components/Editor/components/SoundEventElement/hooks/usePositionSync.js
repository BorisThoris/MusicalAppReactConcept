import { useEffect, useRef } from 'react';
import pixelToSecondRatio from '../../../../../globalConstants/pixelToSeconds';

const usePositionSync = ({ elementContainerRef, isDragging, startTime, timelineY }) => {
    const elementXRef = useRef(startTime * pixelToSecondRatio);
    const elementYRef = useRef(timelineY);

    useEffect(() => {
        const newX = startTime * pixelToSecondRatio;
        if (elementContainerRef.current && elementXRef.current !== newX) {
            elementContainerRef.current.x(newX);
            elementXRef.current = newX;
        }
    }, [elementContainerRef, startTime]);

    // Update the local Y ref when timelineY changes.
    useEffect(() => {
        if (elementContainerRef.current) {
            elementYRef.current = timelineY;
            // Only update the Konva node's Y if dragging.
            if (isDragging) {
                elementContainerRef.current.y(timelineY);
            }
        }
    }, [timelineY, isDragging, elementContainerRef]);

    return { elementXRef, elementYRef };
};

export default usePositionSync;

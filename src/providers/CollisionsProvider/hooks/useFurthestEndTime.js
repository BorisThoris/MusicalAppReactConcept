import { useCallback, useMemo } from 'react';
import pixelToSecondRatio from '../../../globalConstants/pixelToSeconds';

export const useFurthestEndTime = (findAllSoundEventElements) => {
    const calculateFurthestEndTime = useCallback(() => {
        const soundEventElements = findAllSoundEventElements();
        let maxEndX = 0;
        soundEventElements.forEach((element) => {
            const elementRect = element.getClientRect();
            const elementEndX = elementRect.x + elementRect.width;
            if (elementEndX > maxEndX) {
                maxEndX = elementEndX;
            }
        });
        return maxEndX / pixelToSecondRatio;
    }, [findAllSoundEventElements]);

    const furthestEndTime = calculateFurthestEndTime();
    const totalDurationInPixels = useMemo(() => furthestEndTime * pixelToSecondRatio, [furthestEndTime]);

    return { furthestEndTime, totalDurationInPixels };
};

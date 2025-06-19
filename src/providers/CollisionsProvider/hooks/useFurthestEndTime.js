import { useCallback, useMemo } from 'react';
import { usePixelRatio } from '../../PixelRatioProvider/PixelRatioProvider';

export const useFurthestEndTime = (findAllSoundEventElements) => {
    const pixelToSecondRatio = usePixelRatio();

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
    }, [findAllSoundEventElements, pixelToSecondRatio]);

    const furthestEndTime = calculateFurthestEndTime();
    const totalDurationInPixels = useMemo(
        () => furthestEndTime * pixelToSecondRatio,
        [furthestEndTime, pixelToSecondRatio]
    );

    return { furthestEndTime, totalDurationInPixels };
};

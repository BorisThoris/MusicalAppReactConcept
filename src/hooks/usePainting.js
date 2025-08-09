import { useCallback, useState } from 'react';
import { createAndPlayEventIntance, getEventPath } from '../fmodLogic/eventInstanceHelpers';
import { createSound } from '../globalHelpers/createSound';
import getElapsedTime from '../globalHelpers/getElapsedTime';
import { usePixelRatio } from '../providers/PixelRatioProvider/PixelRatioProvider';

/**
 * Hook for painting functionality
 * Replaces PaintingProvider to simplify the context structure
 */
export const usePainting = () => {
    const pixelToSecondRatio = usePixelRatio();
    const [paintingTarget, setPaintingTarget] = useState(null);

    const paintEvent = useCallback(
        ({ renderEvent, target, x }) => {
            if (!paintingTarget?.instrument || !paintingTarget?.event) {
                return;
            }

            const eventInstance = createAndPlayEventIntance(`${paintingTarget.instrument}/${paintingTarget.event}`);

            const startTime = x / pixelToSecondRatio;
            const startOffset = null;

            const elapsedTime = getElapsedTime(startTime, null);
            const eventPath = getEventPath(eventInstance);

            const event = createSound({
                eventInstance,
                eventPath,
                instrumentName: target,
                startTime: startOffset || startOffset === 0 ? elapsedTime : startTime
            });

            renderEvent(event);
        },
        [paintingTarget?.event, paintingTarget?.instrument, pixelToSecondRatio]
    );

    return {
        paintEvent,
        paintingTarget,
        setPaintingTarget
    };
};

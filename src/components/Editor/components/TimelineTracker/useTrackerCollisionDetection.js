import Konva from 'konva';
import { useCallback, useMemo, useRef } from 'react';
import { playEventInstance } from '../../../../fmodLogic/eventInstanceHelpers';

export const useCollisionDetection = (trackerRef, processedItems, mutedInstruments, playbackStatus) => {
    const playedInstances = useRef(new Set());
    const mutedSet = useMemo(() => new Set(mutedInstruments), [mutedInstruments]);

    const playCollidedElements = useCallback(() => {
        if (!playbackStatus.isPlaying) return;
        const tracker = trackerRef.current;
        if (!tracker) return;
        const trackerRect = tracker.getClientRect();

        // eslint-disable-next-line no-restricted-syntax
        for (const item of processedItems) {
            const { clientRect, group, recording } = item;
            const tracks = group ? Object.values(group.elements) : [{ ...recording, rect: clientRect }];

            // eslint-disable-next-line no-restricted-syntax
            for (const { element, eventInstance, instrumentName, rect } of tracks) {
                // eslint-disable-next-line no-continue
                if (!rect || !eventInstance || mutedSet.has(instrumentName)) continue;

                // use Konva.Util.haveIntersection instead of your own
                const isIntersecting = Konva.Util.haveIntersection(trackerRect, element.getClientRect());
                const hasPlayed = playedInstances.current.has(eventInstance);

                if (isIntersecting && !hasPlayed) {
                    playEventInstance(eventInstance);
                    playedInstances.current.add(eventInstance);
                } else if (!isIntersecting && hasPlayed) {
                    playedInstances.current.delete(eventInstance);
                }
            }
        }
    }, [processedItems, playbackStatus.isPlaying, trackerRef, mutedSet]);

    return { playCollidedElements };
};

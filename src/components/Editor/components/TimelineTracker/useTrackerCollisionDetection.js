import { useCallback, useRef } from 'react';
import { playEventInstance } from '../../../../fmodLogic/eventInstanceHelpers';

export const useCollisionDetection = (trackerRef, processedItems, mutedInstruments, playbackStatus) => {
    // keep track of which eventInstances have already been triggered
    const playedInstancesRef = useRef(new Set());

    // simple AABB intersection test
    const haveIntersection = useCallback((r1, r2) => {
        return !(
            r2.x > r1.x + r1.width ||
            r2.x + r2.width < r1.x ||
            r2.y > r1.y + r1.height ||
            r2.y + r2.height < r1.y
        );
    }, []);

    // handle one "item" — either a lone recording or a group of recordings
    const processItemCollision = useCallback(
        (item) => {
            const { clientRect, group, recording } = item;
            if (!clientRect && !group && !recording) return false;

            const trackerRect = trackerRef.current.getClientRect();

            // if it's a group, flatten it into an array of "tracks";
            // otherwise build a single‐track array from the lone recording
            const tracks = group ? Object.values(group.elements) : [{ ...recording, rect: clientRect }];

            let anyPlayed = false;

            // eslint-disable-next-line no-restricted-syntax
            for (const track of tracks) {
                const { eventInstance, instrumentName, rect } = track;
                if (!rect || !eventInstance) break;

                const isIntersecting = haveIntersection(trackerRect, rect);
                const hasPlayed = playedInstancesRef.current.has(eventInstance);

                // start playing if we just entered and it's not muted or already played
                if (isIntersecting && !mutedInstruments.includes(instrumentName) && !hasPlayed) {
                    playEventInstance(eventInstance);
                    playedInstancesRef.current.add(eventInstance);
                    anyPlayed = true;
                }

                // stop tracking if we've left
                if (!isIntersecting && hasPlayed) {
                    playedInstancesRef.current.delete(eventInstance);
                }
            }

            return anyPlayed;
        },
        [trackerRef, haveIntersection, mutedInstruments]
    );

    // loop over every processed item each frame (or tick)
    const playCollidedElements = useCallback(() => {
        if (!playbackStatus.isPlaying || !trackerRef.current) return;
        processedItems.forEach((item) => {
            processItemCollision(item);
        });
    }, [playbackStatus.isPlaying, trackerRef, processedItems, processItemCollision]);

    return { haveIntersection, playCollidedElements };
};

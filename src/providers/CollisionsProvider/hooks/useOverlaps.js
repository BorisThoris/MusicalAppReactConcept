/* eslint-disable no-restricted-syntax */
/* eslint-disable no-param-reassign */
import { useCallback } from 'react';
import { useFindOverlaps } from './useFindOverlaps';

export const useOverlaps = ({ currentBeat, overlapGroups, previousBeat, setOverlapGroups }) => {
    const { findOverlaps } = useFindOverlaps({ previousBeat, processedData: currentBeat, setOverlapGroups });

    const findGroupForEvent = useCallback(
        (id) => {
            for (const [timeline, groups] of Object.entries(overlapGroups)) {
                for (const [groupId, group] of Object.entries(groups)) {
                    if (group.overlapGroup && group.overlapGroup[id]) {
                        return { groupId, timeline };
                    }
                    if (!group.overlapGroup && group.id === id) {
                        return { groupId: id, timeline };
                    }
                }
            }
            return null;
        },
        [overlapGroups]
    );

    return { findGroupForEvent, findOverlaps };
};

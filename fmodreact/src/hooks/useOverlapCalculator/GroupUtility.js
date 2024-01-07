/* eslint-disable no-param-reassign */
import _ from 'lodash';
import differenceWith from 'lodash/differenceWith';
import isEqual from 'lodash/isEqual';
import pullAt from 'lodash/pullAt';
import some from 'lodash/some';
import unionWith from 'lodash/unionWith';
import uniqBy from 'lodash/uniqBy';
import { createGroupFromEvent } from './EventUtility';

export const filterOutOverlappedGroups = (groups, overlapped) =>
    differenceWith(groups, overlapped, isEqual);

export const mergeGroupWithOverlaps = ({ group, overlapGroup }) => {
    group.startTime = Math.min(group.startTime, overlapGroup.startTime);
    group.endTime = Math.max(group.endTime, overlapGroup.endTime);
    group.events = unionWith(
        group.events,
        overlapGroup.events,
        (a, b) => a.id === b.id
    );
    group.locked = group.locked || overlapGroup.locked;
};

export const handleNonOverlappingEvent = (event, interval, groups, tree) => {
    const newGroup = createGroupFromEvent(event);
    tree.insert(interval, newGroup);
    tree.remove([event.startTime, event.endTime], event);
    if (!some(groups, { id: event.id })) {
        groups.push(newGroup);
    }
};

export const combineOverlappingGroups = (groups, tree) => {
    let changed = true;

    const doGroupsOverlap = (group1, group2) =>
        group1.endTime >= group2.startTime &&
        group2.endTime >= group1.startTime;

    while (changed) {
        changed = false;
        for (let i = 0; i < groups.length; i += 1) {
            for (let j = i + 1; j < groups.length; j += 1) {
                if (doGroupsOverlap(groups[i], groups[j])) {
                    mergeGroupWithOverlaps({
                        group: groups[i],
                        overlapGroup: groups[j],
                    });

                    tree.remove(
                        [groups[j].startTime, groups[j].endTime],
                        groups[j]
                    );
                    pullAt(groups, j);

                    tree.remove(
                        [groups[i].startTime, groups[i].endTime],
                        groups[i]
                    );
                    tree.insert(
                        [groups[i].startTime, groups[i].endTime],
                        groups[i]
                    );

                    changed = true;
                    break;
                }
            }
            if (changed) break;
        }
    }

    return groups;
};

export const mergeOverlappingEvents = (event, overlaps, groups, tree) => {
    const mergedGroup = createGroupFromEvent(event);
    overlaps.forEach((overlapGroup) =>
        mergeGroupWithOverlaps({ group: mergedGroup, overlapGroup })
    );
    mergedGroup.events = uniqBy(mergedGroup.events, 'id');

    if (!mergedGroup.endTime && !mergedGroup.startTime) {
        mergedGroup.startTime = event.startTime;
        mergedGroup.endTime = event.endTime;
    }

    tree.insert([mergedGroup.startTime, mergedGroup.endTime], mergedGroup);

    if (!some(groups, { id: mergedGroup.id })) {
        groups.push(mergedGroup);
    }

    groups = combineOverlappingGroups(groups, tree);
};

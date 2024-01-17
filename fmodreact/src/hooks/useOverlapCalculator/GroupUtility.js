/* eslint-disable no-param-reassign */

import { find } from 'lodash';
import differenceWith from 'lodash/differenceWith';
import isEqual from 'lodash/isEqual';
import pullAt from 'lodash/pullAt';
import unionWith from 'lodash/unionWith';
import uniqBy from 'lodash/uniqBy';
import { createGroupFromEvent } from './EventUtility';
import { notInTree } from './IntervalTreeUtility';

export const filterOutOverlappedGroups = (groups, overlapped) =>
    differenceWith(groups, overlapped, isEqual);

export const mergeGroupWithOverlaps = ({ group, overlapGroup }) => {
    if (!group.locked && !overlapGroup.locked) {
        group.startTime = Math.min(group.startTime, overlapGroup.startTime);
        group.endTime = Math.max(group.endTime, overlapGroup.endTime);

        const mergedEvents = unionWith(
            group.events,
            overlapGroup.events,
            (a, b) => a.id === b.id
        );

        group.events = mergedEvents;
    }
};

export const handleNonOverlappingEvent = ({
    interval,
    overlapTree,
    recording,
}) => {
    const newGroup = createGroupFromEvent(recording);

    if (notInTree({ interval, item: newGroup, overlapTree })) {
        overlapTree.insert(interval, newGroup);
    }

    return newGroup;
};

export const combineOverlappingGroups = (groups, tree) => {
    let changed = true;

    const doGroupsOverlap = (group1, group2) =>
        group1.endTime >= group2.startTime &&
        group2.endTime >= group1.startTime;

    const processedGroups = new Set();

    while (changed) {
        changed = false;
        for (let i = 0; i < groups.length; i += 1) {
            if (processedGroups.has(i)) break;

            for (let j = i + 1; j < groups.length; j += 1) {
                if (processedGroups.has(j)) break;

                if (doGroupsOverlap(groups[i], groups[j])) {
                    const newGroupConstraints = [
                        groups[i].startTime,
                        groups[i].endTime,
                    ];

                    if (!groups[i].locked && !groups[j].locked) {
                        mergeGroupWithOverlaps({
                            group: groups[i],
                            overlapGroup: groups[j],
                        });

                        const test = tree.remove(
                            [groups[j].startTime, groups[j].endTime],
                            groups[j]
                        );

                        pullAt(groups, j);

                        const test2 = tree.remove(
                            newGroupConstraints,
                            groups[i]
                        );

                        tree.insert(newGroupConstraints, groups[i]);

                        changed = true;
                    }
                }

                if (changed) break;
            }
            if (changed) break;
        }
    }

    return groups;
};

const findEventGroup = (tree, eventId) => {
    return find(tree.items, (item) => {
        const isParent = item.value.events.some((e) => e.id === eventId);
        return isParent && item.value.events.length > 1 ? item : false;
    });
};

const updatedGroup = (event, existingGroup, recordings) => {
    const group = { ...existingGroup } || {
        endTime: event.endTime,
        events: [event],
        startTime: event.startTime,
    };

    if (group && group.events.length > 1 && !group.locked) {
        let len = group.length;
        const checkedGroups = [event];

        if (group.events.length > 1) {
            group.events.forEach((e, index) => {
                const actualEvent = recordings.find((rec) => rec.id === e.id);

                const previousEvent = group.events[index - 1];

                const insideGroupBounds =
                    actualEvent.startTime >= previousEvent?.startTime &&
                    actualEvent.endTime <= previousEvent?.endTime;

                if (insideGroupBounds) {
                    len += actualEvent.eventLength;
                    checkedGroups.push(actualEvent);
                }
            });
        }

        group.events = uniqBy(checkedGroups, 'id').sort(
            (group1, group2) => group1.startTime - group2.startTime
        );

        group.length = len;
        group.endTime =
            checkedGroups.length > 1
                ? group.events[group.events.length - 1].endTime
                : event.endTime;
        group.startTime =
            checkedGroups.length > 1
                ? group.events[0].startTime
                : event.startTime;
    }

    return group;
};

export const mergeOverlappingEvents = ({ event, groups, recordings, tree }) => {
    const foundEvent = findEventGroup(tree, event.id);
    const eventGroup = createGroupFromEvent(event, foundEvent);
    const mergedGroup = updatedGroup(event, eventGroup, recordings);

    tree.insert([mergedGroup.startTime, mergedGroup.endTime], mergedGroup);

    return [...groups, mergedGroup];
};

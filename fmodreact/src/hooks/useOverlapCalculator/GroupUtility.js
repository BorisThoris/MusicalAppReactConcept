/* eslint-disable no-param-reassign */

import differenceWith from 'lodash/differenceWith';
import find from 'lodash/find';
import first from 'lodash/first';
import forEach from 'lodash/forEach';
import isEqual from 'lodash/isEqual';
import last from 'lodash/last';
import unionWith from 'lodash/unionWith';
import uniqWith from 'lodash/uniqWith';
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
        !(
            group1.endTime < group2.startTime ||
            group2.endTime < group1.startTime
        );

    while (changed) {
        changed = false;

        for (let i = 0; i < groups.length; i += 1) {
            if (groups[i].processed) break;

            for (let j = i + 1; j < groups.length; j += 1) {
                if (groups[j].processed) break;

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

                        tree.remove(
                            [groups[j].startTime, groups[j].endTime],
                            groups[j]
                        );
                        groups.splice(j, 1);

                        tree.remove(newGroupConstraints, groups[i]);
                        tree.insert(newGroupConstraints, groups[i]);

                        changed = true;
                        groups[i].processed = true;
                        break;
                    }
                }
            }
        }

        // Reset processed status for next iteration
        groups.forEach((group) => {
            group.processed = false;
        });
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
    const group = existingGroup || {
        endTime: event.endTime,
        events: [event],
        startTime: event.startTime,
    };

    if (group.events.length > 1 && !group.locked) {
        const checkedEvents = [event];

        forEach(group.events, (e, index) => {
            const currentEvent = find(recordings, { id: e.id });

            if (index > 0) {
                const previousEvent = group.events[index - 1];
                if (
                    currentEvent.startTime >= previousEvent.startTime &&
                    currentEvent.endTime <= previousEvent.endTime
                ) {
                    checkedEvents.push(currentEvent);
                }
            }
        });

        group.events = uniqWith(checkedEvents, isEqual).sort(
            (a, b) => a.startTime - b.startTime
        );

        group.endTime = last(group.events).endTime;
        group.startTime = first(group.events).startTime;
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

/* eslint-disable no-param-reassign */

import differenceWith from 'lodash/differenceWith';
import find from 'lodash/find';
import first from 'lodash/first';
import forEach from 'lodash/forEach';
import isEqual from 'lodash/isEqual';
import last from 'lodash/last';
import unionWith from 'lodash/unionWith';
import { createEventInstance } from '../../fmodLogic/eventInstanceHelpers';
import createSound from '../../globalHelpers/createSound';
import { createGroupFromEvent } from './EventUtility';
import { notInTree } from './IntervalTreeUtility';

export const filterOutOverlappedGroups = (groups, overlapped) => differenceWith(groups, overlapped, isEqual);

export const mergeGroupWithOverlaps = ({ group, overlapGroup }) => {
    if (!group.locked && !overlapGroup.locked) {
        // Update start and end times based on overlaps
        group.startTime = Math.min(group.startTime, overlapGroup.startTime);
        group.endTime = Math.max(group.endTime, overlapGroup.endTime);

        // Assume overlapGroup.events is an object where keys are event IDs
        Object.values(overlapGroup.events).forEach((event) => {
            if (event.id !== group.id) {
                event.parentId = group.id; // Set the parent ID for non-self events
            }
        });

        // Merge events ensuring no duplicates and keeping structure consistent
        const mergedEvents = unionWith(
            Object.values(group.events),
            Object.values(overlapGroup.events),
            (a, b) => a.id === b.id
        );

        // Convert merged array back to an object indexed by event IDs
        group.events = mergedEvents;
    }
};

export const handleNonOverlappingEvent = ({ interval, overlapTree, recording }) => {
    const newGroup = createGroupFromEvent(recording);

    if (notInTree({ interval, item: newGroup, overlapTree })) {
        overlapTree.insert(interval, newGroup);
    }

    return newGroup;
};

export const combineOverlappingGroups = (groups, tree) => {
    let changed = true;

    const doGroupsOverlap = (group1, group2) =>
        !(group1.endTime < group2.startTime || group2.endTime < group1.startTime);

    while (changed) {
        changed = false;
        const groupKeys = Object.keys(groups); // Get all group IDs as an array

        for (let i = 0; i < groupKeys.length; i += 1) {
            const group1 = groups[groupKeys[i]];
            if (group1?.processed) return; // Skip processed groups

            for (let j = i + 1; j < groupKeys.length; j += 1) {
                const group2 = groups[groupKeys[j]];
                if (group2.processed) return; // Skip processed groups

                if (doGroupsOverlap(group1, group2)) {
                    const newGroupConstraints = [group1.startTime, group1.endTime];

                    if (!group1.locked && !group2.locked) {
                        mergeGroupWithOverlaps({
                            group: group1,
                            overlapGroup: group2
                        });

                        tree.remove([group2.startTime, group2.endTime], group2);
                        delete groups[groupKeys[j]]; // Remove group2 from groups

                        tree.remove(newGroupConstraints, group1);
                        tree.insert(newGroupConstraints, group1);

                        changed = true;
                        group1.processed = true;
                        break;
                    }
                }
            }
        }

        // Reset the processed flag for all groups
        Object.values(groups).forEach((group) => {
            group.processed = false;
        });
    }

    return groups;
};

const findEventGroup = (tree, eventId) => {
    const traverseNodes = (nodes) => {
        // eslint-disable-next-line no-restricted-syntax
        for (const node of nodes) {
            if (node.value.id === eventId) {
                // Direct match at this node level
                return node;
            }

            // Check if node.value.events is an array and contains the eventId
            if (Array.isArray(node.value.events) && node.value.events.some((e) => e.id === eventId)) {
                // If some event in the events array matches the eventId, return this node
                return node;
            }

            // Recursively search in children nodes if they exist
            if (node.children) {
                const found = traverseNodes(node.children);
                if (found) return found;
            }
        }
        return null; // If no node matches, return null
    };

    // Assuming tree has a property 'items' where nodes are stored
    return traverseNodes(tree.items);
};

export const updatedGroup = (event, existingGroup) => {
    const mappedEvents = [];
    if (event.events?.length > 1) {
        event.events.forEach((e) => {
            mappedEvents.push({ ...e, events: undefined });
        });
    } else {
        mappedEvents.push({ ...event, events: undefined });
    }

    const group = { ...existingGroup } || {
        endTime: event.endTime,
        events: mappedEvents,
        startTime: event.startTime
    };

    const orphans = [];

    if (group.events.length > 1) {
        const checkedEvents = [];

        group.events = group.events.sort((a, b) => {
            return a.startTime - b.startTime;
        });

        forEach(group.events, (e, index) => {
            const currentEvent = e;

            let previousEvent;

            if (index > 0) {
                previousEvent = group.events[index - 1];
            } else {
                previousEvent = group;
            }

            if (
                currentEvent.startTime < previousEvent.endTime &&
                currentEvent.endTime > previousEvent.startTime &&
                orphans.length === 0
            ) {
                checkedEvents.push(currentEvent);
            } else {
                currentEvent.parentId = null;
                orphans.push(currentEvent);
            }
        });

        group.events = checkedEvents;

        const { endTime } = group.events.length > 0 ? last(group.events) : group;
        const { startTime } = group.events.length > 0 ? first(group.events) : group;

        const isGroup = group.events?.length > 0;
        group.id = isGroup ? group.events[0].id : group.id;

        if (isGroup) {
            group.events.forEach((ev) => {
                ev.parentId = group.id;
            });
        }

        group.endTime = parseFloat(endTime.toFixed(2));
        group.startTime = parseFloat(startTime.toFixed(2));
    }

    return { mergedGroup: group, orphans };
};

export const mergeOverlappingEvents = ({ event, groups, tree }) => {
    const foundEvent = findEventGroup(tree, event.id);
    const eventGroup = createGroupFromEvent(event, foundEvent);
    const { mergedGroup, orphans } = updatedGroup(event, eventGroup);

    // Remove parent property from orphans
    orphans.forEach((orphan) => {
        delete orphan.parent;
    });

    // Insert merged group into the tree and update groups object
    tree.insert([mergedGroup.startTime, mergedGroup.endTime], mergedGroup);
    groups[mergedGroup.id] = mergedGroup; // Store by id

    // Process each orphan into a new event group and insert it
    orphans.forEach((orphan) => {
        const newEvent = createGroupFromEvent(orphan, false);
        tree.insert([newEvent.startTime, newEvent.endTime], newEvent);
        groups[newEvent.id] = newEvent; // Store by id
    });

    return groups;
};

export const recreateEvents = ({ existingInstrumentName, groupsToRecreate }) =>
    groupsToRecreate.map((existingGroup) => {
        const eventInstance = createEventInstance(existingGroup.eventPath || 'Drum/Snare');
        const mainEvent = createSound({
            eventInstance,
            eventPath: existingGroup.eventPath || 'Drum/Snare',
            instrumentName: existingGroup.instrumentName,
            passedParams: existingGroup.params,
            startTime: existingGroup.startTime
        });

        const recreatedEvents = existingGroup.events
            ? existingGroup.events.map((subEvent) => {
                  const subEventInstance = createEventInstance(subEvent.eventPath || 'Drum/Snare');

                  const recreatedEvent = createSound({
                      eventInstance: subEventInstance,
                      eventPath: subEvent.eventPath || 'Drum/Snare',
                      instrumentName: existingInstrumentName || existingGroup.instrumentName,
                      passedParams: subEvent.params,
                      startTime: subEvent.startTime
                  });

                  return { ...recreatedEvent, parentId: mainEvent.id };
              })
            : [];

        return {
            ...mainEvent,
            endTime: mainEvent.endTime,
            eventLength: mainEvent.eventLength,
            events: recreatedEvents,
            id: mainEvent.id,
            instrumentName: existingInstrumentName || mainEvent.instrumentName,
            length: mainEvent.eventLength,
            locked: existingGroup.locked,
            startTime: mainEvent.startTime
        };
    });

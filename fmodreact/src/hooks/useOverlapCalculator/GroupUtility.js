/* eslint-disable no-param-reassign */

import differenceWith from 'lodash/differenceWith';
import first from 'lodash/first';
import forEach from 'lodash/forEach';
import isEqual from 'lodash/isEqual';
import last from 'lodash/last';
import unionWith from 'lodash/unionWith';
import { createEvent } from '../../globalHelpers/createSound';
import { createGroupFromEvent } from './EventUtility';
import { notInTree } from './IntervalTreeUtility';

export const filterOutOverlappedGroups = (groups, overlapped) => differenceWith(groups, overlapped, isEqual);

export const mergeGroupWithOverlaps = ({ group, overlapGroup }) => {
    if (!group.locked && !overlapGroup.locked) {
        group.startTime = Math.min(group.startTime, overlapGroup.startTime);
        group.endTime = Math.max(group.endTime, overlapGroup.endTime);

        const mergedEvents = unionWith(
            Object.values(group.events),
            Object.values(overlapGroup.events),
            (a, b) => a.id === b.id
        );

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
    const clonedGroups = { ...groups };

    const doGroupsOverlap = (group1, group2) =>
        !(group1.endTime < group2.startTime || group2.endTime < group1.startTime);

    while (changed) {
        changed = false;
        let groupKeys = Object.keys(clonedGroups);

        for (let i = 0; i < groupKeys.length; i += 1) {
            const group1 = clonedGroups[groupKeys[i]];

            if (group1.processed) return;

            for (let j = i + 1; j < groupKeys.length; j += 1) {
                const group2 = clonedGroups[groupKeys[j]];

                if (group2.processed) return;

                if (doGroupsOverlap(group1, group2)) {
                    const newGroupConstraints = [group1.startTime, group1.endTime];

                    if (!group1.locked && !group2.locked) {
                        mergeGroupWithOverlaps({
                            group: group1,
                            overlapGroup: group2
                        });

                        tree.remove([group2.startTime, group2.endTime], group2);
                        delete clonedGroups[groupKeys[j]];
                        groupKeys = Object.keys(clonedGroups);

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
        Object.values(clonedGroups).forEach((group) => {
            group.processed = false;
        });
    }

    return clonedGroups;
};

const findEventGroup = (tree, eventId) => {
    const traverseNodes = (nodes) => {
        // eslint-disable-next-line no-restricted-syntax
        for (const node of nodes) {
            if (node.value.id === eventId) {
                // Direct match at this node level
                return node;
            }

            // Check if node.value.events is an object and contains the eventId
            if (node.value.events && node.value.events[eventId]) {
                // If the events object has a property matching the eventId, return this node
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
    const mappedEvents = {};

    if (event.events && Object.keys(event.events).length > 1) {
        forEach(Object.values(event.events), (e) => {
            mappedEvents[e.id] = { ...e, events: { [e.id]: e } };
        });
    } else {
        mappedEvents[event.id] = { ...event, events: { [event.id]: event } };
    }

    const group = { ...existingGroup } || {
        endTime: event.endTime,
        events: mappedEvents,
        startTime: event.startTime
    };

    const orphans = [];

    let groupEvents = group.events ? Object.values(group.events) : {};

    if (groupEvents.length > 1) {
        const checkedEvents = {};

        groupEvents = groupEvents.sort((a, b) => a.startTime - b.startTime);

        forEach(groupEvents, (e, index) => {
            const currentEvent = e;
            let previousEvent;

            if (index > 0) {
                previousEvent = groupEvents[index - 1];
            } else {
                previousEvent = group;
            }

            if (
                currentEvent.startTime < previousEvent.endTime &&
                currentEvent.endTime > previousEvent.startTime &&
                orphans.length === 0
            ) {
                checkedEvents[currentEvent.id] = currentEvent;
            } else {
                currentEvent.parentId = null;
                orphans.push(currentEvent);
            }
        });

        group.events = checkedEvents;

        const sortedCheckedEvents = Object.values(checkedEvents).sort((a, b) => a.startTime - b.startTime);
        const { endTime } = sortedCheckedEvents.length > 0 ? last(sortedCheckedEvents) : group;
        const { startTime } = sortedCheckedEvents.length > 0 ? first(sortedCheckedEvents) : group;

        const isGroup = sortedCheckedEvents.length > 0;
        group.id = isGroup ? sortedCheckedEvents[0].id : group.id;

        if (isGroup) {
            forEach(sortedCheckedEvents, (ev) => {
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

    // Insert merged group into the tree and update groups object
    tree.insert([mergedGroup.startTime, mergedGroup.endTime], mergedGroup);
    groups[mergedGroup.id] = mergedGroup; // Store by id

    // Process each orphan into a new event group and insert it
    Object.values(orphans).forEach((orphan) => {
        const newEvent = createGroupFromEvent(orphan, false);
        tree.insert([newEvent.startTime, newEvent.endTime], newEvent);
        groups[newEvent.id] = newEvent; // Store by id
    });

    return groups;
};

export const recreateEvents = ({ existingInstrumentName = false, groupsToRecreate, timeOffset = 0 }) =>
    groupsToRecreate.map((existingGroup) => {
        const mainEvent = createEvent(
            {
                eventPath: existingGroup.eventPath,
                locked: existingGroup.locked,
                params: existingGroup.params,
                startTime: existingGroup.startTime + timeOffset
            },
            existingInstrumentName || existingGroup.instrumentName
        );

        const eventsArray = Object.values(existingGroup.events || {});

        if (eventsArray.length > 1) {
            let earliestStartTime = null;
            let latestEndTime = null;

            const recreatedEvents = eventsArray.reduce((acc, subEvent) => {
                if (subEvent.startTime + timeOffset < earliestStartTime || !earliestStartTime) {
                    earliestStartTime = subEvent.startTime + timeOffset;
                }
                if (subEvent.endTime + timeOffset > latestEndTime || !latestEndTime) {
                    latestEndTime = subEvent.endTime + timeOffset;
                }

                const recreatedEvent = createEvent(
                    {
                        eventPath: subEvent.eventPath,
                        locked: false,
                        params: subEvent.params,
                        startTime: subEvent.startTime + timeOffset
                    },
                    existingInstrumentName || existingGroup.instrumentName,
                    mainEvent.id
                );

                acc[recreatedEvent.id] = recreatedEvent;
                return acc;
            }, {});

            mainEvent.startTime = earliestStartTime;
            mainEvent.endTime = latestEndTime;

            return {
                ...mainEvent,
                events: recreatedEvents
            };
        }

        return {
            ...mainEvent,
            events: {
                [mainEvent.id]: {
                    ...mainEvent,
                    endTime: existingGroup.endTime + timeOffset,
                    id: mainEvent.id,
                    locked: false,
                    parentId: mainEvent.id,
                    startTime: existingGroup.startTime + timeOffset
                }
            }
        };
    });

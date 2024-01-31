/* eslint-disable no-param-reassign */

import differenceWith from 'lodash/differenceWith';
import find from 'lodash/find';
import first from 'lodash/first';
import forEach from 'lodash/forEach';
import isEqual from 'lodash/isEqual';
import last from 'lodash/last';
import unionWith from 'lodash/unionWith';
import uniqWith from 'lodash/uniqWith';
import { createEventInstance } from '../../fmodLogic/eventInstanceHelpers';
import createSound from '../../globalHelpers/createSound';
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
    // DIRTY GROUP FIX

    const mappedEvents = [];
    if (event.events?.length > 1) {
        event.events.forEach((e) => {
            mappedEvents.push({ ...e, events: undefined });
        });
    } else {
        mappedEvents.push({ ...event, events: undefined });
    }

    const group = existingGroup || {
        endTime: event.endTime,
        events: mappedEvents,
        startTime: event.startTime,
    };

    const orhpans = [];

    if (group.events.length > 1 && !group.locked) {
        const checkedEvents = [];

        group.events = group.events.sort((a, b) => {
            return a.startTime - b.startTime;
        });

        forEach(group.events, (e, index) => {
            const currentEvent = e;

            if (index > 0) {
                const previousEvent = group.events[index - 1];

                console.log(previousEvent.endTime);
                console.log(currentEvent.endTime);

                console.log(previousEvent.startTime);
                console.log(currentEvent.startTime);

                if (
                    currentEvent.startTime < previousEvent.endTime &&
                    currentEvent.endTime > previousEvent.startTime &&
                    orhpans.length === 0
                ) {
                    console.log('yep');

                    checkedEvents.push(currentEvent);
                } else {
                    orhpans.push(currentEvent);
                }
            } else {
                console.log('PUSHING');
                checkedEvents.push(currentEvent);
            }
        });

        group.events = uniqWith(checkedEvents, isEqual).sort(
            (a, b) => a.startTime - b.startTime
        );

        group.endTime = last(group.events).endTime;
        group.startTime = first(group.events).startTime;
    }

    return { mergedGroup: group, orhpans };
};

export const mergeOverlappingEvents = ({ event, groups, recordings, tree }) => {
    const foundEvent = findEventGroup(tree, event.id);
    const eventGroup = createGroupFromEvent(event, foundEvent);
    const { mergedGroup, orhpans } = updatedGroup(
        event,
        eventGroup,
        recordings
    );

    tree.insert([mergedGroup.startTime, mergedGroup.endTime], mergedGroup);

    const events = orhpans.map((orphan) => {
        const newEvent = createGroupFromEvent(orphan, false);

        tree.insert([newEvent.startTime, newEvent.endTime], newEvent);

        return newEvent;
    });

    return [...groups, mergedGroup, ...events];
};

export const recreateEvents = ({ groupsToRecreate }) =>
    groupsToRecreate.map((group) => {
        // Recreate each event in the events property
        const recreatedEvents = group.events
            ? group.events.map((subEvent) => {
                  // Create an event instance for each subEvent
                  const subEventInstance = createEventInstance(
                      subEvent.eventPath || 'Drum/Snare'
                  );

                  // Recreate the event
                  return createSound({
                      eventInstance: subEventInstance,
                      eventPath: subEvent.eventPath || 'Drum/Snare',
                      instrumentName: group.instrumentName,
                      passedParams: subEvent.params,
                      startTime: subEvent.startTime,
                  });
              })
            : [];

        // Create main event
        const eventInstance = createEventInstance(
            group.eventPath || 'Drum/Snare'
        );
        const mainEvent = createSound({
            eventInstance,
            eventPath: group.eventPath || 'Drum/Snare',
            instrumentName: group.instrumentName,
            passedParams: group.params,
            startTime: group.startTime,
        });

        return {
            ...mainEvent,
            endTime: mainEvent.endTime,
            eventLength: mainEvent.eventLength,
            events: recreatedEvents,
            id: `${mainEvent.id}`,
            instrumentName: mainEvent.instrumentName,
            length: mainEvent.eventLength,
            locked: mainEvent.locked,
            startTime: mainEvent.startTime,
        };
    });

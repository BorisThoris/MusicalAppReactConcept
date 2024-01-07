/* eslint-disable no-param-reassign */
import { createGroupFromEvent } from './EventUtility';

export const filterOutOverlappedGroups = (groups, overlapped) =>
    groups.filter((group) => !overlapped.includes(group));

export const mergeGroupWithOverlaps = ({ group, overlapGroup }) => {
    group.startTime = Math.min(group.startTime, overlapGroup.startTime);
    group.endTime = Math.max(group.endTime, overlapGroup.endTime);
    overlapGroup.events?.forEach((event) => {
        const containEvent = group.events.some((e) => e.id === event.id);
        if (!containEvent) group.events.push(event);
    });

    group.locked = group.locked || overlapGroup.locked || false;
};

export const handleNonOverlappingEvent = (event, interval, groups, tree) => {
    const newGroup = createGroupFromEvent(event);
    tree.insert(interval, newGroup);
    tree.remove([event.startTime, event.endTime], event);
    if (!groups.some((group) => group.id === event.id)) {
        groups.push(newGroup);
    }
};

export const combineOverlappingGroups = (groups, tree) => {
    console.log('');
    console.log('START');
    console.log(groups);

    const doGroupsOverlap = (group1, group2) =>
        group1.endTime >= group2.startTime &&
        group2.endTime >= group1.startTime;

    let changed = true;

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

                    groups.splice(j, 1);

                    tree.remove(
                        [groups[i].startTime, groups[i].endTime],
                        groups[i]
                    );

                    tree.insert(
                        [groups[i].startTime, groups[i].endTime],
                        groups[i]
                    );

                    changed = true;

                    // Break inner loop to restart since groups have changed
                    break;
                }
            }

            if (changed) {
                break; // Break outer loop to restart since groups have changed
            }
        }
    }

    console.log(groups);
    console.log('End');
    console.log('');

    return groups;
};

export const mergeOverlappingEvents = (event, overlaps, groups, tree) => {
    const mergedGroup = createGroupFromEvent(event);

    overlaps.forEach((overlapGroup) => {
        mergeGroupWithOverlaps({
            group: mergedGroup,
            overlapGroup,
        });
    });

    mergedGroup.events = Array.from(new Set(mergedGroup.events));

    if (!mergedGroup.endTime && !mergedGroup.startTime) {
        mergedGroup.startTime = event.startTime;
        mergedGroup.endTime = event.endTime;
    }

    tree.insert([mergedGroup.startTime, mergedGroup.endTime], mergedGroup);

    // const newGroups = combineOverlappingGroups(tree.values, tree);

    // groups = filterOutOverlappedGroups(groups, tree.values);
    if (!groups.some((group) => group.id === mergedGroup.id)) {
        groups.push(mergedGroup);
    }

    groups = combineOverlappingGroups(groups, tree);

    console.log(groups);
};

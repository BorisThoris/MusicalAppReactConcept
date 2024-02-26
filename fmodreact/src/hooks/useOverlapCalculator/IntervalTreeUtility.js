import IntervalTree from '@flatten-js/interval-tree';
import { find } from 'lodash';

export const notInTree = ({ interval, item, overlapTree }) => {
    const { items } = overlapTree;
    return !find(items, { key: interval, value: item });
};

export const insertGroupsIntoTree = ({ initialOverlapGroups }) => {
    const tree = new IntervalTree();

    initialOverlapGroups.forEach((group) => {
        const currentGroupConstaints = [group.startTime, group.endTime];
        tree.insert(currentGroupConstaints, group);
    });

    return { tree };
};

export const findOverlappingGroups = (recording, overlapTree) => {
    const doGroupsOverlap = (group1, group2) =>
        group1.endTime >= group2.startTime && group2.endTime >= group1.startTime;

    const overlaps = [];

    overlapTree.forEach((key, overlapGroup) => {
        const groupConstraints = { endTime: key.high, startTime: key.low };
        const groupsOverlap = doGroupsOverlap(groupConstraints, recording);

        if (groupsOverlap && overlapGroup.id !== recording.id) {
            overlaps.push(key);
        }
    });

    return overlaps;
};

/* eslint-disable no-param-reassign */
// useOverlapCalculator.js
import IntervalTree from '@flatten-js/interval-tree';
import {
    handleNonOverlappingEvent,
    mergeOverlappingEvents,
} from './GroupUtility';
import {
    findOverlappingGroups,
    insertGroupsIntoTree,
} from './IntervalTreeUtility';

const useOverlapCalculator = (recordings, prevOverlapGroups) => {
    const initializeOverlapGroups = (prevGroups) =>
        prevGroups ? [...prevGroups] : [];

    const processEvents = (events, tree) => {
        const groups = [];
        events.forEach((event) => {
            const interval = [event.startTime, event.endTime];
            const overlaps = findOverlappingGroups(event, tree);

            if (overlaps.length === 0) {
                handleNonOverlappingEvent(event, interval, groups, tree);
            }

            mergeOverlappingEvents(event, overlaps, groups, tree);
        });
        return groups;
    };

    const processOverlapCalculations = (recordingData, prevGroups) => {
        const groups = new Set(initializeOverlapGroups(prevGroups));
        const tree = new IntervalTree();
        const eventSet = new Set();

        insertGroupsIntoTree(groups, tree, eventSet);
        const newGroups = processEvents(recordingData, tree);

        newGroups.forEach((group) => groups.add(group));
        return Array.from(groups).sort((a, b) => a.startTime - b.startTime);
    };

    const calculateOverlaps = () => {
        return processOverlapCalculations(recordings, prevOverlapGroups);
    };

    const calculateOverlapsForAllInstruments = () => {
        const allGroups = {};
        Object.keys(recordings).forEach((instrument) => {
            allGroups[instrument] = processOverlapCalculations(
                recordings[instrument],
                prevOverlapGroups ? prevOverlapGroups[instrument] : []
            );
        });

        return allGroups;
    };

    return { calculateOverlaps, calculateOverlapsForAllInstruments };
};

export default useOverlapCalculator;

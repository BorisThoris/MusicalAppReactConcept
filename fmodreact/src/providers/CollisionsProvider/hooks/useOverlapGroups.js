/* eslint-disable no-param-reassign */
import Konva from 'konva';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

export const useOverlapGroups = ({ getProcessedElements, setHasChanged, timelineRefs }) => {
    const [overlapGroups, setOverlapGroups] = useState({});

    const doEventsCollide = useCallback((eventA, eventB) => {
        const rectA = eventA.element.getClientRect();
        const rectB = eventB.element.getClientRect();
        return Konva.Util.haveIntersection(rectA, rectB);
    }, []);

    const generateGroupId = (group) => {
        const ids = group
            .map((event) => event.recording.id)
            .sort()
            .join('-');
        return `${ids}`;
    };

    const mergeGroups = (groupA, groupB) => {
        return Array.from(new Set([...groupA, ...groupB]));
    };

    const calculateCollisions = useCallback(() => {
        console.log(timelineRefs);

        if (!timelineRefs || Object.keys(timelineRefs).length === 0) {
            console.log('No timelineRefs provided, skipping collision calculation.');
            return;
        }

        const groupedEvents = Object.values(timelineRefs).reduce((acc, timelineRef) => {
            acc[timelineRef.instrumentName] = [];
            return acc;
        }, {});

        const processedElements = getProcessedElements(timelineRefs);

        const updatedGroupedEvents = processedElements.reduce((acc, elementData) => {
            const { element, height, instrumentName, recording, width, x, y } = elementData;

            return {
                ...acc,
                [instrumentName]: [...(acc[instrumentName] || []), { element, height, recording, width, x, y }]
            };
        }, groupedEvents);

        setOverlapGroups((prevOverlapGroups) => {
            const newOverlapGroups = Object.keys(updatedGroupedEvents).reduce(
                (groupAcc, instrumentName) => {
                    if (updatedGroupedEvents[instrumentName]) {
                        const events = updatedGroupedEvents[instrumentName];
                        let collisionGroups = [];

                        events.forEach((event) => {
                            let addedToGroup = false;

                            collisionGroups = collisionGroups.map((group) => {
                                if (group.some((e) => doEventsCollide(e, event))) {
                                    addedToGroup = true;
                                    return [...group, event];
                                }
                                return group;
                            });

                            if (!addedToGroup) {
                                collisionGroups = [...collisionGroups, [event]];
                            }
                        });

                        const mergeGroupsSafely = (groups) => {
                            let hasMerged = false;
                            let mergedGroups = [];

                            groups.forEach((group, i) => {
                                let merged = false;

                                mergedGroups = mergedGroups.map((mg) => {
                                    if (mg.some((eventA) => group.some((eventB) => doEventsCollide(eventA, eventB)))) {
                                        merged = true;
                                        return mergeGroups(mg, group);
                                    }
                                    return mg;
                                });

                                if (!merged) {
                                    mergedGroups.push(group);
                                }

                                hasMerged = hasMerged || merged;
                            });

                            return { hasMerged, mergedGroups };
                        };

                        let collisionResult = { hasMerged: true, mergedGroups: collisionGroups };

                        while (collisionResult.hasMerged) {
                            collisionResult = mergeGroupsSafely(collisionResult.mergedGroups);
                        }

                        const instrumentGroups = collisionResult.mergedGroups.reduce((groupAcc2, group) => {
                            const startTime = Math.min(...group.map((e) => e.recording.startTime));
                            const endTime = Math.max(...group.map((e) => e.recording.endTime));

                            const groupId = generateGroupId(group);
                            groupAcc2[groupId] = {
                                endTime: parseFloat(endTime?.toFixed(2)),
                                eventInstance: group[0].recording.eventInstance || {},
                                eventLength: parseFloat((endTime - startTime).toFixed(2)),
                                eventPath: group[0].recording.eventPath,
                                events: group.reduce((eventAcc, event) => {
                                    eventAcc[event.recording.id] = {
                                        ...event.recording,
                                        events: null,
                                        length: parseFloat(event.recording.length?.toFixed(2)),
                                        locked: event.recording.locked || false,
                                        parentId: groupId,
                                        startTime: parseFloat(event.recording.startTime?.toFixed(2))
                                    };
                                    return eventAcc;
                                }, {}),
                                id: groupId,
                                instrumentName,
                                length: parseFloat((endTime - startTime).toFixed(2)),
                                locked: false,
                                name: group[0].recording.name,
                                params: group[0].recording.params,
                                parentId: null,
                                processed: false,
                                startTime: parseFloat(startTime.toFixed(2))
                            };

                            return groupAcc2;
                        }, {});

                        groupAcc[instrumentName] = instrumentGroups;
                    }

                    return groupAcc;
                },
                { ...prevOverlapGroups }
            );

            return newOverlapGroups;
        });

        setHasChanged(true);
    }, [timelineRefs, getProcessedElements, setHasChanged, doEventsCollide]);

    const calculateOverlapsForAllInstruments = useCallback((newOverlapGroups) => {
        const recalculatedGroups = { ...newOverlapGroups };
        return recalculatedGroups;
    }, []);

    const flatOverlapGroups = useMemo(() => {
        const flattenEvents = (group) => {
            const flatEvents = {};

            Object.values(group).forEach((value) => {
                flatEvents[value.id] = value;

                const events = Object.values(value.events || {});
                events.forEach((nestedEvent) => {
                    if (nestedEvent.id && nestedEvent.id !== value.id) {
                        flatEvents[nestedEvent.id] = nestedEvent;
                    }
                });
            });

            return flatEvents;
        };

        const allFlatEvents = {};

        Object.values(overlapGroups).forEach((group) => {
            Object.assign(allFlatEvents, flattenEvents(group));
        });

        return allFlatEvents;
    }, [overlapGroups]);

    return {
        calculateCollisions,
        calculateOverlapsForAllInstruments,
        flatOverlapGroups,
        overlapGroups,
        setOverlapGroups
    };
};

export default useOverlapGroups;

/* eslint-disable no-param-reassign */
import Konva from 'konva';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const usePrevious = (value) => {
    const ref = useRef();
    useEffect(() => {
        ref.current = value;
    }, [value]);
    return ref.current;
};

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
        if (!timelineRefs || Object.keys(timelineRefs).length === 0) {
            console.log('No timelineRefs provided, skipping collision calculation.');
            return;
        }

        const groupedEvents = {};

        const processedElements = getProcessedElements(timelineRefs);
        processedElements.forEach((elementData) => {
            const { element, height, instrumentName, recording, width, x, y } = elementData;

            if (!groupedEvents[instrumentName]) {
                groupedEvents[instrumentName] = [];
            }

            groupedEvents[instrumentName].push({
                element,
                height,
                recording,
                width,
                x,
                y
            });
        });

        setOverlapGroups((prevOverlapGroups) => {
            const newOverlapGroups = { ...prevOverlapGroups };

            Object.keys(groupedEvents).forEach((instrumentName) => {
                if (groupedEvents[instrumentName] && groupedEvents[instrumentName].length > 0) {
                    const events = groupedEvents[instrumentName];
                    const collisionGroups = [];

                    events.forEach((event) => {
                        let addedToGroup = false;

                        // Try to add the event to an existing group
                        for (let i = 0; i < collisionGroups.length; i += 1) {
                            if (collisionGroups[i].some((e) => doEventsCollide(e, event))) {
                                collisionGroups[i].push(event);
                                addedToGroup = true;
                                break;
                            }
                        }

                        // If the event doesn't belong to any group, create a new one
                        if (!addedToGroup) {
                            collisionGroups.push([event]);
                        }
                    });

                    let merged = true;
                    while (merged) {
                        merged = false;
                        for (let i = 0; i < collisionGroups.length; i += 1) {
                            for (let j = i + 1; j < collisionGroups.length; j += 1) {
                                if (
                                    collisionGroups[i].some((eventA) =>
                                        collisionGroups[j].some((eventB) => doEventsCollide(eventA, eventB))
                                    )
                                ) {
                                    collisionGroups[i] = mergeGroups(collisionGroups[i], collisionGroups[j]);
                                    collisionGroups.splice(j, 1);
                                    merged = true;
                                    break;
                                }
                            }
                            if (merged) break;
                        }
                    }

                    // Only update newOverlapGroups for this instrument if we have valid events
                    newOverlapGroups[instrumentName] = {};

                    collisionGroups.forEach((group) => {
                        const startTime = Math.min(...group.map((e) => e.recording.startTime));
                        const endTime = Math.max(...group.map((e) => e.recording.endTime));

                        const groupId = generateGroupId(group);
                        newOverlapGroups[instrumentName][groupId] = {
                            endTime: parseFloat(endTime?.toFixed(2)),
                            eventInstance: group[0].recording.eventInstance || {},
                            eventLength: parseFloat((endTime - startTime).toFixed(2)),
                            eventPath: group[0].recording.eventPath,
                            events: group.reduce((acc, event) => {
                                acc[event.recording.id] = {
                                    ...event.recording,
                                    events: null,
                                    length: parseFloat(event.recording.length?.toFixed(2)),
                                    locked: event.recording.locked || false,
                                    parentId: groupId,
                                    startTime: parseFloat(event.recording.startTime?.toFixed(2))
                                };
                                return acc;
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
                    });
                }
            });

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

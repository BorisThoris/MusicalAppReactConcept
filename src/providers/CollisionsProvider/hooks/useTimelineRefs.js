/* eslint-disable no-debugger */
import { get } from 'lodash';
import find from 'lodash/find';
import omit from 'lodash/omit';
import reduce from 'lodash/reduce';
import set from 'lodash/set';
import { useCallback, useRef } from 'react';
import { ELEMENT_ID_PREFIX } from '../../../globalConstants/elementIds';

export const useTimelineRefs = ({ setHasChanged }) => {
    const timelineRefs = useRef({});

    const addTimelineRef = useCallback((instrumentName, ref) => {
        timelineRefs.current = set({ ...timelineRefs.current }, instrumentName, ref);
    }, []);

    const removeTimelineRef = useCallback((instrumentName) => {
        timelineRefs.current = omit(timelineRefs.current, instrumentName);
    }, []);

    const stageRefRef = useRef(null);

    const addStageRef = useCallback(
        (ref) => {
            stageRefRef.current = ref;
        },
        [stageRefRef]
    );

    const removeStageRef = useCallback(() => {
        stageRefRef.current = null;
    }, []);

    const stageRef = stageRefRef.current;

    const findAllSoundEventElements = useCallback(
        (parentGroup) => {
            if (parentGroup) {
                // Find elements within the given parent group
                return parentGroup.find((node) => node.id().startsWith(ELEMENT_ID_PREFIX));
            }

            if (!stageRef?.current) {
                // Return empty array if stage reference is not available
                return [];
            }

            // Find all matching elements within the entire stage
            const stageElements = stageRef.current?.find((node) => node.id().startsWith(ELEMENT_ID_PREFIX));

            return stageElements;
        },
        [stageRef]
    );

    // New method to get all groups
    const getAllGroups = useCallback(() => {
        if (!stageRef?.current) return [];

        return stageRef.current.find((node) => node.id().startsWith('overlap-group-'));
    }, [stageRef]);

    const getSoundEventById = useCallback(
        (id) => {
            if (stageRef?.current) {
                const elements = stageRef.current?.find((node) => node.id().startsWith(`${ELEMENT_ID_PREFIX}${id}`));
                const element = elements ? find(elements, (node) => node.id() === `${ELEMENT_ID_PREFIX}${id}`) : null;

                if (element) {
                    const clientRect = element.getClientRect ? element.getClientRect() : {};
                    const { height, width, x, y } = clientRect;

                    const recordingData = element.attrs ? element.attrs['data-recording'] : {};
                    const instrumentName = recordingData ? recordingData.instrumentName : null;

                    const parentAttrs = element.parent ? element.parent.attrs : {};
                    const timelineY = parentAttrs ? parentAttrs.timelineY : null;

                    return {
                        element,
                        height,
                        instrumentName,
                        recording: recordingData,
                        timelineY,
                        width,
                        x,
                        y
                    };
                }
            }
            return null;
        },
        [stageRef]
    );

    const getProcessedElements = useCallback(
        (parentGroup) => {
            const elements = findAllSoundEventElements(parentGroup);
            const idCount = {};

            // Count occurrences of each id
            elements.forEach((element) => {
                const id = element.id();
                idCount[id] = (idCount[id] || 0) + 1;
            });

            const seenElementIds = new Set();

            return reduce(
                elements,
                (acc, element) => {
                    const id = element.id();
                    if (idCount[id] > 1 && !seenElementIds.has(id)) {
                        // Log the element if it has duplicates
                        alert('Duplicate element:', element.attrs['data-recording'].instrumentName);
                    }

                    if (!seenElementIds.has(id)) {
                        const { height, width, x, y } = element.getClientRect();
                        const instrumentName = get(element, "attrs['data-recording'].instrumentName", null);
                        const recording = get(element, "attrs['data-recording']", {});
                        const grouped = get(element, "attrs['data-group-child']", false);

                        const timelineY = get(element, 'parent.attrs.timelineY', 0);

                        if (grouped && !parentGroup) return acc;

                        acc.push({
                            element,
                            height,
                            instrumentName,
                            recording,
                            rect: { height, width, x, y },
                            timelineY,
                            width,
                            x,
                            y
                        });

                        seenElementIds.add(id);
                    }
                    return acc;
                },
                []
            );
        },
        [findAllSoundEventElements]
    );

    // New method to process groups
    const getProcessedGroups = useCallback(() => {
        if (!stageRef?.current) return [];

        const groups = getAllGroups();
        const seenGroupIds = new Set();

        const processedGroups = groups.reduce((acc, group) => {
            if (!seenGroupIds.has(group.id())) {
                if (!group.getClientRect) return acc;

                const clientRect = group.getClientRect();
                const { height, width, x, y } = clientRect;

                // Extract group attributes safely
                const groupData = { ...group.attrs['data-overlap-group'] }; // Clone to avoid mutation

                // Push a new object into the accumulator
                return [
                    ...acc,
                    {
                        group,
                        ...groupData,
                        rect: { height, width, x, y }
                    }
                ];
            }

            // Add group ID to the seen set (mutating Set is acceptable here)
            seenGroupIds.add(group.id());

            return acc;
        }, []);

        return processedGroups;
    }, [getAllGroups, stageRef]);

    const getProcessedItems = useCallback(() => {
        if (!stageRef?.current) return [];

        const elements = findAllSoundEventElements();
        const groups = getAllGroups();

        const seenIds = new Set();

        // Process elements
        const processedElements = reduce(
            elements,
            (acc, element) => {
                if (!seenIds.has(element.id())) {
                    const { height, width, x, y } = element.getClientRect();
                    const instrumentName = get(element, "attrs['data-recording'].instrumentName", null);
                    const recording = get(element, "attrs['data-recording']", {});
                    const timelineY = get(element, 'parent.attrs.timelineY', 0);

                    const child = element.attrs['data-group-child'] || false;

                    if (child) {
                        return acc;
                    }

                    acc.push({
                        clientRect: element.getClientRect(),
                        height,
                        // Identifier for elements
                        id: element.id(),
                        instrumentName,
                        rawItem: element,
                        recording,
                        timelineY,
                        type: 'element',
                        width,
                        x,
                        y // Reference to the original element
                    });

                    seenIds.add(element.id());
                }
                return acc;
            },
            []
        );

        // Process groups
        const processedGroups = reduce(
            groups,
            (acc, group) => {
                if (!seenIds.has(group.id())) {
                    if (!group.getClientRect) return acc;

                    const { height, width, x, y } = group.getClientRect();
                    const groupData = group.attrs['data-overlap-group'] || {};
                    const timelineY = get(group, 'attrs.timelineY', 0);

                    acc.push({
                        clientRect: group.getClientRect(),
                        groupData,
                        height,
                        // Identifier for groups
                        id: group.id(),
                        rawItem: group,
                        timelineY,
                        type: 'group',
                        width,
                        x,
                        y // Reference to the original group
                    });

                    seenIds.add(group.id());
                }
                return acc;
            },
            []
        );

        // Combine both arrays
        return [...processedElements, ...processedGroups];
    }, [findAllSoundEventElements, getAllGroups, stageRef]);

    const clearElements = useCallback((elements) => {
        elements.forEach((element) => {
            if (element) {
                const stage = element.getStage();
                if (stage) {
                    const parentElement = stage.findOne(`#parent-${element.id().replace(ELEMENT_ID_PREFIX, '')}`);
                    if (parentElement) {
                        parentElement.destroy();
                    }
                }
                element.destroy();
            }
        });
    }, []);

    const deleteAllElements = useCallback(() => {
        if (!stageRef?.current) return;

        const elements = findAllSoundEventElements();
        clearElements(elements);
        timelineRefs.current = {};
        setHasChanged(true);
    }, [stageRef, findAllSoundEventElements, clearElements, setHasChanged]);

    const deleteAllTimelines = useCallback(() => {
        if (!stageRef?.current) {
            console.warn('Stage reference is not set.');
            return;
        }

        clearElements(findAllSoundEventElements());
        timelineRefs.current = {};
        setHasChanged(true);
    }, [stageRef, clearElements, findAllSoundEventElements, setHasChanged]);

    return {
        addStageRef,
        addTimelineRef,
        deleteAllElements,
        deleteAllTimelines,
        findAllSoundEventElements,
        getAllGroups,
        getProcessedElements,
        getProcessedGroups,
        getProcessedItems,
        getSoundEventById,
        removeStageRef,
        removeTimelineRef,
        stageRef,
        timelineRefs
    };
};

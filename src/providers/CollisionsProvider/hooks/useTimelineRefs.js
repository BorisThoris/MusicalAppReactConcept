/* eslint-disable no-debugger */
import { get } from 'lodash';
import find from 'lodash/find';
import omit from 'lodash/omit';
import reduce from 'lodash/reduce';
import set from 'lodash/set';
import { useCallback, useRef } from 'react';
import { ELEMENT_ID_PREFIX, GROUP_ELEMENT_ID_PREFIX } from '../../../globalConstants/elementIds';

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
            const stage = stageRef?.current;
            if (!stage) return [];

            return stage.find((node) => {
                if (!node.id().startsWith(ELEMENT_ID_PREFIX)) return false;

                // If no parentGroup is provided, return all matching elements
                if (!parentGroup) return true;

                return node.attrs['data-parent-group-id'] === parentGroup.attrs.id;
            });
        },
        [stageRef]
    );

    // New method to get all groups
    const getAllGroups = useCallback(() => {
        if (!stageRef?.current) return [];

        const groups = stageRef.current.find((node) => node.attrs?.['data-group-id']);

        return groups; // Return nodes that have `data-group-id`
    }, [stageRef]);

    const getGroupById = useCallback(
        (groupId) => {
            if (!stageRef?.current) return null;

            const group = stageRef.current.findOne((node) => node.id() === groupId) || null;

            return group;
        },
        [stageRef]
    );

    const getSoundEventById = useCallback(
        (id) => {
            if (stageRef?.current) {
                const elements = stageRef.current?.find((node) => node.id().startsWith(`${ELEMENT_ID_PREFIX}${id}`));
                const element = elements ? find(elements, (node) => node.id() === `${ELEMENT_ID_PREFIX}${id}`) : null;

                console.log(`${ELEMENT_ID_PREFIX}${id}`);

                if (element) {
                    const clientRect = element.getClientRect ? element.getClientRect() : {};
                    const { height, width, x, y } = clientRect;

                    const recordingData = element.attrs ? { ...element.attrs['data-recording'] } : {};
                    const instrumentName = recordingData ? recordingData.instrumentName : null;

                    const parentAttrs = element.parent ? element.parent.attrs : {};
                    const timelineY = parentAttrs ? parentAttrs.timelineY : null;

                    console.log('RETURNIG EL', element);

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
                        // alert('Duplicate element:', element.attrs['data-recording'].instrumentName);
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
        const processedItems = [];

        // Helper function to process elements or groups
        const processItem = (item, type, additionalData = {}) => {
            if (seenIds.has(item.id()) || !item.getClientRect) return;

            const { height, width, x, y } = item.getClientRect();
            const timelineY = get(item, 'attrs.timelineY', 0);

            processedItems.push({
                clientRect: { height, width, x, y },
                element: item,
                height,
                id: item.id(),
                timelineY,
                type,
                width,
                x,
                y,
                ...additionalData // Spread any additional extracted data
            });

            seenIds.add(item.id());
        };

        // Process elements
        elements.forEach((element) => {
            const instrumentName = get(element, "attrs['data-recording'].instrumentName", null);
            const recording = get(element, "attrs['data-recording']", {});
            const isChild = element.attrs['data-group-child'] || false;

            // if (!isChild) {
            processItem(element, 'element', { instrumentName, recording });
            // }
        });

        // // Process groups
        // groups.forEach((group) => {
        //     const groupData = group.attrs['data-overlap-group'] || {};
        //     processItem(group, 'group', { groupData });
        // });

        console.log('Proccessed Items Return', processedItems);
        return processedItems;
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
        getGroupById,
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

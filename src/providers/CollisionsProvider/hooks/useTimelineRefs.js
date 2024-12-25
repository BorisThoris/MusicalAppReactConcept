/* eslint-disable no-debugger */
import { get } from 'lodash';
import find from 'lodash/find';
import omit from 'lodash/omit';
import reduce from 'lodash/reduce';
import set from 'lodash/set';
import { useCallback, useState } from 'react';
import { ELEMENT_ID_PREFIX } from '../../../globalConstants/elementIds';

export const useTimelineRefs = ({ setHasChanged }) => {
    const [timelineRefs, setTimelineRefs] = useState({});
    const [stageRef, setStageRef] = useState(null);

    const updateTimelineRefs = useCallback((updateFn) => {
        setTimelineRefs((prevRefs) => updateFn(prevRefs));
    }, []);

    const addStageRef = useCallback(setStageRef, [setStageRef]);

    const addTimelineRef = useCallback(
        (instrumentName, ref) => {
            updateTimelineRefs((prevRefs) => set({ ...prevRefs }, instrumentName, ref));
        },
        [updateTimelineRefs]
    );

    const removeTimelineRef = useCallback(
        (instrumentName) => {
            updateTimelineRefs((prevRefs) => omit(prevRefs, instrumentName));
        },
        [updateTimelineRefs]
    );

    const findAllSoundEventElements = useCallback(
        (parentGroup) => {
            if (parentGroup) {
                return parentGroup.find((node) => node.id().startsWith(ELEMENT_ID_PREFIX));
            }

            if (!stageRef?.current) return [];
            return stageRef.current.find((node) => node.id().startsWith(ELEMENT_ID_PREFIX));
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
            if (!stageRef?.current) return [];

            const elements = findAllSoundEventElements(parentGroup);
            const seenElementIds = new Set();

            return reduce(
                elements,
                (acc, element) => {
                    if (!seenElementIds.has(element.id())) {
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

                        seenElementIds.add(element.id());
                    }
                    return acc;
                },
                []
            );
        },
        [findAllSoundEventElements, stageRef]
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

    // New method to get all elements for a specific timeline (by instrumentName)
    const getElementsForTimeline = useCallback(
        (instrumentName) => {
            return getProcessedElements().filter((el) => el.instrumentName === instrumentName);
        },
        [getProcessedElements]
    );

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
        setTimelineRefs({});
        setHasChanged(true);
    }, [stageRef, findAllSoundEventElements, clearElements, setHasChanged]);

    const deleteAllTimelines = useCallback(() => {
        if (!stageRef?.current) {
            console.warn('Stage reference is not set.');
            return;
        }

        clearElements(findAllSoundEventElements());
        setTimelineRefs({});
        setHasChanged(true);
    }, [stageRef, clearElements, findAllSoundEventElements, setHasChanged]);

    return {
        addStageRef,
        addTimelineRef,
        deleteAllElements,
        deleteAllTimelines,
        findAllSoundEventElements,
        getAllGroups,
        getElementsForTimeline,
        getProcessedElements,
        getProcessedGroups,
        getProcessedItems,
        getSoundEventById,
        removeTimelineRef,
        stageRef,
        timelineRefs
    };
};

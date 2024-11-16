import { get } from 'lodash';
import find from 'lodash/find';
import omit from 'lodash/omit';
import reduce from 'lodash/reduce';
import set from 'lodash/set';
import { useCallback, useState } from 'react';

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

    // Utility function to find all elements with IDs starting with "element-"
    const findAllSoundEventElements = useCallback(() => {
        if (!stageRef?.current) return [];
        return stageRef.current.find((node) => node.id().startsWith('element-'));
    }, [stageRef]);

    const getSoundEventById = useCallback(
        (id) => {
            if (stageRef?.current) {
                const elements = stageRef.current.find((node) => node.id().startsWith(`element-${id}`));
                const element = elements ? find(elements, (node) => node.id() === `element-${id}`) : null;

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

    const getProcessedElements = useCallback(() => {
        if (!stageRef?.current) return [];

        const elements = findAllSoundEventElements();
        const seenElementIds = new Set();

        return reduce(
            elements,
            (acc, element) => {
                if (!seenElementIds.has(element.id())) {
                    const { height, width, x, y } = element.getClientRect();
                    // Using lodash.get to safely access nested properties
                    const instrumentName = get(element, "attrs['data-recording'].instrumentName", null);
                    const recording = get(element, "attrs['data-recording']", {});
                    const timelineY = get(element, 'parent.attrs.timelineY', 0);

                    acc.push({
                        element,
                        height,
                        instrumentName,
                        recording,
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
    }, [findAllSoundEventElements, stageRef]);

    const clearElements = useCallback((elements) => {
        elements.forEach((element) => {
            if (element) {
                const stage = element.getStage();
                if (stage) {
                    const parentElement = stage.findOne(`#parent-${element.id().replace('element-', '')}`);
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
        getProcessedElements,
        getSoundEventById,
        removeTimelineRef,
        stageRef,
        timelineRefs
    };
};

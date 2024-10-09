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

    const getSoundEventById = useCallback(
        (id) => {
            if (stageRef?.current) {
                const elements = stageRef.current.find((node) => node.id().startsWith(`element-${id}`));
                const element = find(elements, (node) => node.id() === `element-${id}`);

                if (element) {
                    const { height, width, x, y } = element.getClientRect();
                    const { instrumentName } = element.attrs['data-recording'];
                    return {
                        element,
                        height,
                        instrumentName,
                        recording: element.attrs['data-recording'],
                        timelineY: element.parent.attrs.timelineY,
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

        const elements = stageRef.current.find((node) => node.id().startsWith('element-'));
        const seenElementIds = new Set();
        return reduce(
            elements,
            (acc, element) => {
                if (!seenElementIds.has(element.id())) {
                    const { height, width, x, y } = element.getClientRect();
                    const { instrumentName } = element.attrs['data-recording'];
                    acc.push({
                        element,
                        height,
                        instrumentName,
                        recording: element.attrs['data-recording'],
                        timelineY: element.parent.attrs.timelineY,
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
    }, [stageRef]);

    const clearElements = useCallback((elements) => {
        elements.forEach((element) => {
            element
                .getStage()
                ?.findOne(`#parent-${element.id().replace('element-', '')}`)
                ?.destroy();
            element.destroy();
        });
    }, []);

    const deleteAllElements = useCallback(() => {
        if (!stageRef?.current) return;

        const elements = stageRef.current.find((node) => node.id().startsWith('element-'));
        clearElements(elements);
        setTimelineRefs({});
        setHasChanged(true);
    }, [stageRef, clearElements, setHasChanged]);

    const deleteAllTimelines = useCallback(() => {
        if (!stageRef?.current) {
            console.warn('Stage reference is not set.');
            return;
        }

        clearElements(stageRef.current.find((node) => node.id().startsWith('timeline-')));
        setTimelineRefs({});
        setHasChanged(true);
    }, [stageRef, clearElements, setHasChanged]);

    // Utility function to find all elements with IDs starting with "element-"
    const findAllSoundEventElements = useCallback(() => {
        if (!stageRef?.current) return [];
        return stageRef.current.find((node) => node.id().startsWith('element-'));
    }, [stageRef]);

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

import { filter, findIndex } from 'lodash';
import { useCallback, useState } from 'react';

export const useTimelineRefs = ({ setHasChanged }) => {
    const [timelineRefs, setTimelineRefs] = useState([]);

    const [stageRef, setStageRef] = useState(null);

    const updateTimelineRefs = useCallback((updateFn) => {
        setTimelineRefs((prevRefs) => {
            const updatedRefs = updateFn(prevRefs);
            return updatedRefs;
        });
    }, []);

    const addStageRef = useCallback((ref) => setStageRef(ref), []);

    const addTimelineRef = useCallback(
        (instrumentName, ref) => {
            updateTimelineRefs((prevRefs) => {
                const existingRefIndex = findIndex(prevRefs, { instrumentName });
                return existingRefIndex !== -1
                    ? prevRefs.map((r, i) => (i === existingRefIndex ? { instrumentName, ref } : r))
                    : [...prevRefs, { instrumentName, ref }];
            });
        },
        [updateTimelineRefs]
    );

    const removeTimelineRef = useCallback(
        (instrumentName) => {
            updateTimelineRefs((prevRefs) => filter(prevRefs, (r) => r.instrumentName !== instrumentName));
        },
        [updateTimelineRefs]
    );

    const processElement = (element, instrumentName, ref) => {
        const { height, width, x, y } = element.getClientRect();
        return {
            element,
            height,
            instrumentName,
            recording: element.attrs['data-recording'],
            timelineY: ref.timelineY,
            width,
            x,
            y
        };
    };

    const getProcessedElements = useCallback(() => {
        const processedElements = [];

        timelineRefs.forEach(({ instrumentName, ref }) => {
            if (ref && ref.children && ref.children.length > 0) {
                const elements = ref.find((node) => node.id().startsWith('element-'));

                // if (!elements || elements.length === 0) {
                //     console.warn(`No elements found for instrument ${instrumentName}, possible ref issue.`);
                //     return;
                // }

                elements.forEach((element) => {
                    const { height, width, x, y } = element.getClientRect();
                    const elementData = {
                        element,
                        height,
                        instrumentName,
                        recording: element.attrs['data-recording'],
                        timelineY: ref.timelineY,
                        width,
                        x,
                        y // Assuming ref contains timelineY
                    };

                    processedElements.push(elementData);
                });
            }
        });

        return processedElements;
    }, [timelineRefs]);

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
        timelineRefs.forEach(({ ref }) => {
            clearElements(ref?.find((node) => node.id().startsWith('element-')) || []);
        });
        setTimelineRefs([]);
        setHasChanged(true);
    }, [timelineRefs, clearElements, setHasChanged]);

    const deleteAllTimelines = useCallback(() => {
        if (!stageRef?.current) {
            console.warn('Stage reference is not set.');
            return;
        }
        clearElements(stageRef.current.find((node) => node.id().startsWith('timeline-')));
        setTimelineRefs([]);
        setHasChanged(true);
    }, [stageRef, clearElements, setHasChanged]);

    return {
        addStageRef,
        addTimelineRef,
        deleteAllElements,
        deleteAllTimelines,
        getProcessedElements,
        removeTimelineRef,
        stageRef,
        timelineRefs
    };
};

export default useTimelineRefs;

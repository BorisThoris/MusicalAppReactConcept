import { useCallback, useState } from 'react';

export const useTimelineRefs = ({ setHasChanged }) => {
    const [timelineRefs, setTimelineRefs] = useState({}); // Change to an object
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
            updateTimelineRefs((prevRefs) => ({
                ...prevRefs,
                [instrumentName]: ref // Add or update the ref for the instrumentName
            }));
        },
        [updateTimelineRefs]
    );

    const removeTimelineRef = useCallback(
        (instrumentName) => {
            updateTimelineRefs((prevRefs) => {
                const { [instrumentName]: _, ...rest } = prevRefs; // Remove the ref for the instrumentName
                return rest;
            });
        },
        [updateTimelineRefs]
    );

    const getProcessedElements = useCallback(() => {
        const processedElements = [];
        const seenElementIds = new Set(); // To track unique element IDs

        if (stageRef && stageRef.current) {
            const stage = stageRef.current;
            const elements = stage.find((node) => node.id().startsWith('element-'));

            elements.forEach((element) => {
                const elementId = element.id(); // Get the element ID

                if (!seenElementIds.has(elementId)) {
                    // Check if the ID is already seen
                    const { height, width, x, y } = element.getClientRect();
                    const { instrumentName } = element.attrs['data-recording'];

                    const elementData = {
                        element,
                        height,
                        instrumentName,
                        recording: element.attrs['data-recording'],
                        timelineY: element.parent.attrs.timelineY, // Assuming timelineY is stored in the parent
                        width,
                        x,
                        y
                    };

                    processedElements.push(elementData);
                    seenElementIds.add(elementId); // Mark this ID as seen
                }
            });
        }

        return processedElements;
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
        const seenElementIds = new Set(); // To track unique element IDs

        if (stageRef && stageRef.current) {
            const stage = stageRef.current;
            const elements = stage.find((node) => node.id().startsWith('element-'));

            elements.forEach((element) => {
                const elementId = element.id();

                if (!seenElementIds.has(elementId)) {
                    // Ensure we haven't already processed this element
                    clearElements([element]); // Clear this specific element
                    seenElementIds.add(elementId); // Mark this ID as processed
                }
            });
        }

        setTimelineRefs({}); // Clear the timeline references (now an object)
        setHasChanged(true); // Mark that changes have occurred
    }, [stageRef, clearElements, setTimelineRefs, setHasChanged]);

    const deleteAllTimelines = useCallback(() => {
        if (!stageRef?.current) {
            console.warn('Stage reference is not set.');
            return;
        }
        clearElements(stageRef.current.find((node) => node.id().startsWith('timeline-')));
        setTimelineRefs({}); // Clear the timeline references (now an object)
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

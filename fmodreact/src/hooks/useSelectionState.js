import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { CollisionsContext } from '../providers/CollisionsProvider/CollisionsProvider';
import { useInstrumentRecordingsOperations } from './useInstrumentRecordingsOperations';
import { useOverlapCalculator } from './useOverlapCalculator/useOverlapCalculator';
import { useTimeRange } from './useTimeRange';

export const useSelectionState = ({ markersAndTrackerOffset }) => {
    const { calculateCollisions, flatOverlapGroups, getProcessedElements, overlapGroups, stageRef } =
        useContext(CollisionsContext);

    const { duplicateMultipleOverlapGroups } = useInstrumentRecordingsOperations();
    const { getEventById, updateRecording } = useInstrumentRecordingsOperations();

    const [selectedItems, setSelectedItems] = useState({});
    const [filteredSelectedItems, setFilteredSelectedItems] = useState({});
    const [highestYLevel, setHighestYLevel] = useState(0);
    const { calculateOverlapsForAllInstruments } = useOverlapCalculator(filteredSelectedItems, filteredSelectedItems);

    const prevSelectedItemsRef = useRef({});
    const { groupEndTime, groupStartTime } = useTimeRange(selectedItems);

    useEffect(() => {
        if (JSON.stringify(prevSelectedItemsRef.current) === JSON.stringify(selectedItems)) {
            return;
        }

        const filterItemsByInstrument = (items) => {
            return Object.values(items).reduce((acc, item) => {
                const instrument = item.instrumentName;
                if (!acc[instrument]) {
                    acc[instrument] = {};
                }
                acc[instrument][item.id] = item;
                return acc;
            }, {});
        };

        const filteredItems = filterItemsByInstrument(selectedItems);
        setFilteredSelectedItems(filteredItems);
    }, [overlapGroups, selectedItems]);

    useEffect(() => {
        if (JSON.stringify(prevSelectedItemsRef.current) === JSON.stringify(overlapGroups)) {
            return;
        }

        const updatedSelectedItems = Object.keys(selectedItems).reduce((newSelectedItems, itemId) => {
            // eslint-disable-next-line no-restricted-syntax
            for (const group of Object.values(flatOverlapGroups)) {
                if (`${group.id}` === `${itemId}`) {
                    // eslint-disable-next-line no-param-reassign
                    newSelectedItems[itemId] = { ...group, element: stageRef.current.findOne(`#element-${group.id}`) };
                    break;
                }
            }
            return newSelectedItems;
        }, {});

        prevSelectedItemsRef.current = overlapGroups;
        setSelectedItems(updatedSelectedItems);
    }, [flatOverlapGroups, overlapGroups, selectedItems, stageRef]);

    const setSelectionBasedOnCoordinates = useCallback(
        ({ intersectedElements, yLevel }) => {
            const newSelectedItems = intersectedElements.reduce((acc, element) => {
                acc[element.id] = {
                    ...element,
                    endX: element.endX,
                    endY: element.endY,
                    startX: element.startX,
                    startY: element.startY,
                    timelineY: element.timelineY
                };
                return acc;
            }, {});

            // Convert both objects to JSON strings for easy comparison
            const prevSelectedItemsJson = JSON.stringify(selectedItems);
            const newSelectedItemsJson = JSON.stringify(newSelectedItems);

            // Only update state if the new selected items are different
            if (prevSelectedItemsJson !== newSelectedItemsJson) {
                setSelectedItems(newSelectedItems);
                setHighestYLevel(yLevel + markersAndTrackerOffset * 2 + 10);
            }
        },
        [selectedItems, markersAndTrackerOffset]
    );

    const clearSelection = useCallback(() => {
        setSelectedItems({});
    }, []);

    const toggleItem = useCallback(
        (input) => {
            setSelectedItems((prevSelectedItems) => {
                const itemsToToggle = Array.isArray(input) ? input : [input];
                const newSelectedItems = { ...prevSelectedItems };

                itemsToToggle.forEach(({ id }) => {
                    if (newSelectedItems[id]) {
                        delete newSelectedItems[id];
                    } else if (flatOverlapGroups[id]) {
                        newSelectedItems[id] = { ...flatOverlapGroups[id] };
                    }
                });

                return newSelectedItems;
            });
        },
        [flatOverlapGroups]
    );

    const unSelectItem = useCallback((input) => {
        setSelectedItems((prevSelectedItems) => {
            const itemsToDelete = Array.isArray(input) ? input : [input];
            const newSelectedItems = { ...prevSelectedItems };

            itemsToDelete.forEach(({ id }) => {
                if (newSelectedItems[id]) {
                    delete newSelectedItems[id];
                }
            });

            return newSelectedItems;
        });
    }, []);

    const isItemSelected = useCallback((itemId) => !!selectedItems[itemId], [selectedItems]);

    const updateSelectedItemsStartTime = useCallback(
        (newStartTime) => {
            Object.keys(selectedItems).forEach((itemId) => {
                if (selectedItems[itemId]) {
                    const actualEvent = getEventById(itemId);

                    updateRecording({
                        newStartTime: actualEvent.startTime + newStartTime,
                        recording: selectedItems[itemId]
                    });
                }
            });
        },
        [getEventById, selectedItems, updateRecording]
    );

    const flatValues = Object.keys(selectedItems).reduce((acc, key) => {
        const recording = flatOverlapGroups[key];
        if (recording) {
            acc[key] = recording;
        }
        return acc;
    }, {});

    const duplicateSelections = () => {
        const calculatedInstrumentOverlaps = calculateOverlapsForAllInstruments();

        const groupsToDuplicate = Object.values(calculatedInstrumentOverlaps).flatMap((events) =>
            Object.values(events).map((ev) => ({
                overlapGroup: { ...ev },
                startTimeOffset: groupEndTime - groupStartTime
            }))
        );

        duplicateMultipleOverlapGroups(groupsToDuplicate);
    };

    const deleteSelections = useCallback(
        (selectedEvents) => {
            const eventsArray = Array.isArray(selectedEvents) ? selectedEvents : [selectedEvents];

            const processedElements = getProcessedElements();

            processedElements.forEach(({ element, instrumentName }) => {
                eventsArray.forEach((event) => {
                    const elementId = element.id().replace('element-', '');

                    if (event.instrumentName === instrumentName && event.id === elementId) {
                        if (event.parentId) {
                            const parentElement = element.getStage()?.findOne(`#parent-${event.parentId}`);

                            if (parentElement) {
                                parentElement.destroy();
                            }
                        }

                        element.destroy();
                    }
                });
            });

            calculateCollisions();
        },
        [calculateCollisions, getProcessedElements]
    );

    return {
        clearSelection,
        deleteSelections,
        duplicateSelections,
        flatValues,
        groupEndTime,
        groupStartTime,
        highestYLevel,
        isItemSelected,
        selectedItems,
        setSelectionBasedOnCoordinates,
        toggleItem,
        unSelectItem,
        updateSelectedItemsStartTime
    };
};

export default useSelectionState;

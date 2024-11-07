import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { CollisionsContext } from '../providers/CollisionsProvider/CollisionsProvider';
import { useInstrumentRecordingsOperations } from './useInstrumentRecordingsOperations';
import { useTimeRange } from './useTimeRange';

export const useSelectionState = ({ markersAndTrackerOffset }) => {
    const { getProcessedElements, getSoundEventById, overlapGroups } = useContext(CollisionsContext);
    const { duplicateEventsToInstrument } = useInstrumentRecordingsOperations();
    const { getEventById } = useInstrumentRecordingsOperations();

    const [selectedItems, setSelectedItems] = useState({});
    const [filteredSelectedItems, setFilteredSelectedItems] = useState({});
    const [highestYLevel, setHighestYLevel] = useState(0);

    const prevSelectedItemsRef = useRef({});
    const { groupEndTime, groupStartTime } = useTimeRange(selectedItems);

    useEffect(() => {
        if (JSON.stringify(prevSelectedItemsRef.current) === JSON.stringify(selectedItems)) {
            return;
        }

        const filterItemsByInstrument = (items) => {
            return Object.values(items).reduce((acc, item) => {
                const instrument = item.instrumentName;
                return {
                    ...acc,
                    [instrument]: {
                        ...acc[instrument],
                        [item.id]: item
                    }
                };
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
            const elementData = getSoundEventById(itemId);
            if (elementData) {
                return {
                    ...newSelectedItems,
                    [itemId]: { ...elementData.recording, element: elementData.element }
                };
            }
            return newSelectedItems;
        }, {});

        prevSelectedItemsRef.current = overlapGroups;
        setSelectedItems(updatedSelectedItems);
    }, [getProcessedElements, getSoundEventById, overlapGroups, selectedItems]);

    const setSelectionBasedOnCoordinates = useCallback(
        ({ intersectedElements, yLevel }) => {
            const newSelectedItems = intersectedElements.reduce((acc, element) => {
                return {
                    ...acc,
                    [element.id]: {
                        ...element
                    }
                };
            }, {});

            if (JSON.stringify(selectedItems) !== JSON.stringify(newSelectedItems)) {
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
                return itemsToToggle.reduce(
                    (newSelectedItems, { id }) => {
                        const processedElements = getProcessedElements();
                        const elementData = processedElements.find(
                            (element) => element.element.attrs.id === `element-${id}`
                        );

                        if (newSelectedItems[id]) {
                            const { [id]: removed, ...rest } = newSelectedItems;
                            return rest;
                        }
                        if (elementData) {
                            return {
                                ...newSelectedItems,
                                [id]: { ...elementData.recording, element: elementData.element }
                            };
                        }
                        return newSelectedItems;
                    },
                    { ...prevSelectedItems }
                );
            });
        },
        [getProcessedElements]
    );

    const unSelectItem = useCallback((input) => {
        setSelectedItems((prevSelectedItems) => {
            const itemsToDelete = Array.isArray(input) ? input : [input];
            return itemsToDelete.reduce(
                (newSelectedItems, { id }) => {
                    const { [id]: removed, ...rest } = newSelectedItems;
                    return rest;
                },
                { ...prevSelectedItems }
            );
        });
    }, []);

    const isItemSelected = useCallback((itemId) => !!selectedItems[itemId], [selectedItems]);

    const updateSelectedItemsStartTime = useCallback((newStartTime) => {}, []);

    const deleteSelections = useCallback(
        (selectedEvents) => {
            const eventsArray = Array.isArray(selectedEvents) ? selectedEvents : [selectedEvents];
            const processedElements = getProcessedElements();

            const elementsToDelete = processedElements.filter(({ element, instrumentName }) =>
                eventsArray.some(
                    (event) =>
                        event.instrumentName === instrumentName && event.id === element.id().replace('element-', '')
                )
            );

            elementsToDelete.forEach(({ element, instrumentName }) => {
                const event = eventsArray.find(
                    (ev) => ev.instrumentName === instrumentName && ev.id === element.id().replace('element-', '')
                );
                if (event) {
                    element.destroy();
                }
            });
        },
        [getProcessedElements]
    );

    // Helper function to update a selected item by id
    const updateSelectedItemById = (id, updates) => {
        setSelectedItems((prevSelectedValues) => {
            // Create a new copy of selectedValues to avoid direct mutation
            const updatedValues = { ...prevSelectedValues };

            // Find the item by id and apply updates
            if (updatedValues[id]) {
                updatedValues[id] = {
                    ...updatedValues[id],
                    ...updates // Apply new startTime and endTime values
                };
            }

            return updatedValues;
        });
    };

    return {
        clearSelection,
        deleteSelections,
        groupEndTime,
        groupStartTime,
        highestYLevel,
        isItemSelected,
        selectedItems,
        setSelectedItems,
        setSelectionBasedOnCoordinates,
        toggleItem,
        unSelectItem,
        updateSelectedItemById,
        updateSelectedItemsStartTime
    };
};

import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { ELEMENT_ID_PREFIX } from '../globalConstants/elementIds';
import { CollisionsContext } from '../providers/CollisionsProvider/CollisionsProvider';
import { useTimeRange } from './useTimeRange';

// Use a constant to ensure empty selections always have the same reference
const EMPTY_SELECTION = {};

export const useSelectionState = ({ markersAndTrackerOffset }) => {
    const { getProcessedElements, getProcessedItems, getSoundEventById, overlapGroups } = useContext(CollisionsContext);

    const [selectedItems, setSelectedItems] = useState({});

    const [highestYLevel, setHighestYLevel] = useState(0);

    const prevSelectedItemsRef = useRef({});
    const { groupEndTime, groupStartTime } = useTimeRange(selectedItems);

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
                        const processedItems = getProcessedItems();

                        const elementData = processedItems.find(
                            (element) => element.element.attrs.id === `${ELEMENT_ID_PREFIX}${id}`
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
        [getProcessedItems]
    );

    const isItemSelected = useCallback((itemId) => !!selectedItems[itemId], [selectedItems]);

    const updateSelectedItemsStartTime = useCallback((newStartTime) => {}, []);

    const deleteSelections = useCallback((selectedEvents) => {
        const eventsArray = Array.isArray(selectedEvents) ? selectedEvents : [selectedEvents];

        // Remove deleted items from selectedItems
        setSelectedItems((prevSelectedItems) => {
            const updatedSelectedItems = { ...prevSelectedItems };
            eventsArray.forEach(({ id }) => {
                delete updatedSelectedItems[id];
            });
            return updatedSelectedItems;
        });
    }, []);

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

    const memoizedSelectedItems = useMemo(() => {
        return Object.keys(selectedItems).length === 0 ? EMPTY_SELECTION : selectedItems;
    }, [selectedItems]);

    return {
        clearSelection,
        deleteSelections,
        groupEndTime,
        groupStartTime,
        highestYLevel,
        isItemSelected,
        selectedItems: memoizedSelectedItems,
        setSelectedItems,
        setSelectionBasedOnCoordinates,
        toggleItem,
        updateSelectedItemById,
        updateSelectedItemsStartTime
    };
};

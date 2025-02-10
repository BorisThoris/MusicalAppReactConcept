import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { ELEMENT_ID_PREFIX } from '../globalConstants/elementIds';
import { CollisionsContext } from '../providers/CollisionsProvider/CollisionsProvider';
import { useTimeRange } from './useTimeRange';

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
                        console.log('getProcessedItems', processedItems);

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

                        alert('sad');
                        return newSelectedItems;
                    },
                    { ...prevSelectedItems }
                );
            });
        },
        [getProcessedItems]
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
                        event.instrumentName === instrumentName &&
                        event.id === element.id().replace(ELEMENT_ID_PREFIX, '')
                )
            );

            elementsToDelete.forEach(({ element, instrumentName }) => {
                const event = eventsArray.find(
                    (ev) =>
                        ev.instrumentName === instrumentName && ev.id === element.id().replace(ELEMENT_ID_PREFIX, '')
                );
                if (event) {
                    element.destroy();
                }
            });

            // Remove deleted items from selectedItems
            setSelectedItems((prevSelectedItems) => {
                const updatedSelectedItems = { ...prevSelectedItems };
                eventsArray.forEach(({ id }) => {
                    delete updatedSelectedItems[id];
                });
                return updatedSelectedItems;
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

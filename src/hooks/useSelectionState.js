import { useCallback, useContext, useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { CollisionsContext } from '../providers/CollisionsProvider/CollisionsProvider';
import { useTimeRange } from './useTimeRange';

const EMPTY_SELECTION = {};

export const useSelectionState = ({ markersAndTrackerOffset }) => {
    const { processedItems } = useContext(CollisionsContext);
    const [selectedItems, setSelectedItems] = useState({});
    const [highestYLevel, setHighestYLevel] = useState(0);
    const { groupEndTime, groupStartTime } = useTimeRange(selectedItems);

    // Update selection based on intersected elements and y-level.
    const setSelectionBasedOnCoordinates = useCallback(
        ({ intersectedElements, yLevel }) => {
            const newSelectedItems = intersectedElements.reduce((acc, element) => {
                acc[element.id] = { ...element };
                return acc;
            }, {});

            const currentIds = Object.keys(selectedItems);
            const newIds = Object.keys(newSelectedItems);
            const hasChanged = currentIds.length !== newIds.length || currentIds.some((id) => !newIds.includes(id));

            if (hasChanged) {
                setSelectedItems(newSelectedItems);
                setHighestYLevel(yLevel + markersAndTrackerOffset * 2 + 10);
            }
        },
        [selectedItems, markersAndTrackerOffset]
    );

    // Clears the current selection.
    const clearSelection = useCallback(() => {
        setSelectedItems({});
    }, []);

    // Toggles the selection state for provided item(s) using the data-recording attr.
    const toggleItem = useCallback(
        (input) => {
            setSelectedItems((prevSelectedItems) => {
                const itemsToToggle = Array.isArray(input) ? input : [input];
                const newSelectedItems = { ...prevSelectedItems };

                itemsToToggle.forEach(({ id }) => {
                    const elementData = processedItems.find((item) => {
                        const recData = item.element?.getAttr('data-recording');
                        return recData && recData.id === id;
                    });
                    if (newSelectedItems[id]) {
                        delete newSelectedItems[id];
                    } else if (elementData) {
                        const recData = elementData.element.getAttr('data-recording') || elementData.recording;
                        newSelectedItems[id] = {
                            ...recData,
                            element: elementData.element
                        };
                    }
                });

                return newSelectedItems;
            });
        },
        [processedItems]
    );

    // Returns whether an item is selected.
    const isItemSelected = useCallback((itemId) => !!selectedItems[itemId], [selectedItems]);

    // Deletes selected events and cleans up the associated elements.
    const deleteSelections = useCallback((selectedEvents) => {
        const eventsArray = Array.isArray(selectedEvents) ? selectedEvents : [selectedEvents];
        setSelectedItems((prevSelectedItems) => {
            const updatedSelectedItems = { ...prevSelectedItems };
            eventsArray.forEach(({ element, id }) => {
                delete updatedSelectedItems[id];
                element.destroy();
            });
            return updatedSelectedItems;
        });
    }, []);

    // Updates a selected item by its id with new values.
    const updateSelectedItemById = useCallback((id, updates) => {
        setSelectedItems((prevSelectedValues) => {
            if (!prevSelectedValues[id]) return prevSelectedValues;
            return {
                ...prevSelectedValues,
                [id]: {
                    ...prevSelectedValues[id],
                    ...updates
                }
            };
        });
    }, []);

    // Memoized selection state for consistent reference.
    const memoizedSelectedItems = useMemo(() => {
        return Object.keys(selectedItems).length === 0 ? EMPTY_SELECTION : selectedItems;
    }, [selectedItems]);

    // Ensure the visual selection state of each processed item matches our state.
    useLayoutEffect(() => {
        processedItems.forEach((item) => {
            if (!item.element) return;
            const recordingData = item.element.getAttr('data-recording');
            const id = recordingData?.id;
            const currentlySelected = recordingData?.isSelected || false;
            const shouldSelect = !!(id && selectedItems[id]);
            if (currentlySelected !== shouldSelect) {
                item.element.setAttr('data-recording', {
                    ...recordingData,
                    isSelected: shouldSelect
                });
                const layer = item.element.getLayer();
                if (layer) {
                    layer.draw();
                }
            }
        });
    }, [selectedItems, processedItems]);

    // Sync the selectedItems state with processedItems.
    useEffect(() => {
        // Update the selection state:
        // - Remove any selected item that no longer has a matching processed item with isSelected true.
        // - Add any processed item that is marked as selected.
        setSelectedItems((prevSelectedItems) => {
            const updatedSelectedItems = {};

            // Retain only those items that still have a matching processed item with isSelected true.
            Object.keys(prevSelectedItems).forEach((id) => {
                const hasMatchingElement = processedItems.some((item) => {
                    const recData = item.element?.getAttr('data-recording');
                    return recData && recData.id === id && recData.isSelected;
                });
                if (hasMatchingElement) {
                    updatedSelectedItems[id] = prevSelectedItems[id];
                }
            });

            // Add any new processed items that are marked as selected.
            processedItems.forEach((item) => {
                const recData = item.element?.getAttr('data-recording');
                const id = recData?.id;
                if (id && recData.isSelected) {
                    updatedSelectedItems[id] = {
                        ...recData,
                        element: item.element
                    };
                }
            });

            // Shallow equality check: compare keys and their associated values.
            const prevKeys = Object.keys(prevSelectedItems);
            const updatedKeys = Object.keys(updatedSelectedItems);
            const isEqual =
                prevKeys.length === updatedKeys.length &&
                prevKeys.every((key) => updatedSelectedItems[key] === prevSelectedItems[key]);

            return isEqual ? prevSelectedItems : updatedSelectedItems;
        });
    }, [processedItems]);

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
        updateSelectedItemById
    };
};

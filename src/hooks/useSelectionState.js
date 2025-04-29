import isEqual from 'lodash/isEqual';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { CollisionsContext } from '../providers/CollisionsProvider/CollisionsProvider';
import { useTimeRange } from './useTimeRange';

const EMPTY_SELECTION = {};

// Helper function moved outside the hook.
const getRecordingData = (element) => {
    if (!element) return null;

    if (typeof element.getAttr === 'function') {
        return element.getAttr('data-recording') || element.getAttr('data-overlap-group') || null;
    }
    if (typeof element === 'string') {
        try {
            const parsed = JSON.parse(element);
            return parsed?.attrs?.['data-recording'] || parsed?.attrs?.['data-overlap-group'] || null;
        } catch (e) {
            console.error('Failed to parse element JSON', e);
            return null;
        }
    } else if (typeof element === 'object') {
        return element.attrs?.['data-recording'] || element.attrs?.['data-overlap-group'] || null;
    }
    return null;
};

export const useSelectionState = ({ markersAndTrackerOffset }) => {
    const { processedItems } = useContext(CollisionsContext);
    const [selectedItems, setSelectedItems] = useState({});
    const [highestYLevel, setHighestYLevel] = useState(0);
    const { groupEndTime, groupStartTime } = useTimeRange(selectedItems);

    // Build a memoized map of processed items keyed by their recording id.
    const processedItemsMap = useMemo(() => {
        const map = new Map();
        processedItems.forEach((item) => {
            const recording = item.element?.getAttr('data-recording') || item.element?.getAttr('data-overlap-group');
            if (recording) {
                const recData = recording;
                map.set(recData.id, item);
            }
        });
        return map;
    }, [processedItems]);

    // Update selection based on intersected elements and y-level using functional state update.
    const setSelectionBasedOnCoordinates = useCallback(
        ({ intersectedElements, yLevel }) => {
            setSelectedItems((prevSelectedItems) => {
                const newSelectedItems = intersectedElements.reduce((acc, element) => {
                    acc[element.id] = { ...element };
                    return acc;
                }, {});

                const currentIds = Object.keys(prevSelectedItems);
                const newIds = Object.keys(newSelectedItems);
                const hasChanged = currentIds.length !== newIds.length || currentIds.some((id) => !newIds.includes(id));

                if (hasChanged) {
                    setHighestYLevel(yLevel + markersAndTrackerOffset * 2 + 10);
                    return newSelectedItems;
                }
                return prevSelectedItems;
            });
        },
        [markersAndTrackerOffset]
    );

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
                    const elementData = processedItemsMap.get(id);
                    if (newSelectedItems[id]) {
                        delete newSelectedItems[id];
                    } else if (elementData) {
                        const recData =
                            elementData.element.getAttr('data-recording') ||
                            elementData.element.getAttr('data-overlap-group');
                        newSelectedItems[id] = {
                            ...recData,
                            element: elementData.element
                        };
                    }
                });

                return newSelectedItems;
            });
        },
        [processedItemsMap]
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

    useEffect(() => {
        const layersToDraw = new Set();

        processedItems.forEach((item) => {
            if (!item.element) return;

            const recData = item.element.getAttr('data-recording') || item.element.getAttr('data-overlap-group');
            const id = recData?.id;
            const currentlySelected = recData?.isSelected || false;
            const shouldSelect = !!(id && selectedItems[id]);

            if (currentlySelected !== shouldSelect) {
                const attrName =
                    recData && item.element.getAttr('data-recording') ? 'data-recording' : 'data-overlap-group';

                item.element.setAttr(attrName, {
                    ...recData,
                    isSelected: shouldSelect
                });

                const layer = item.element.getLayer();
                if (layer) {
                    layersToDraw.add(layer);
                }
            }
        });

        // Draw each unique layer only once at the end.
        layersToDraw.forEach((layer) => {
            layer.draw();
        });
    }, [selectedItems, processedItems]);

    // Combine loops to update selections based on processed items.
    useEffect(() => {
        setSelectedItems((prevSelectedItems) => {
            const updatedSelectedItems = {};
            processedItems.forEach((item) => {
                const recData = getRecordingData(item.element);
                if (recData && recData.id && recData.isSelected) {
                    updatedSelectedItems[recData.id] = { ...recData, element: item.element };
                }
            });
            return isEqual(prevSelectedItems, updatedSelectedItems) ? prevSelectedItems : updatedSelectedItems;
        });
    }, [processedItems]);

    console.log(selectedItems, 'selectedItems');

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

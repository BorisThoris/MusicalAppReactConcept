import isEqual from 'lodash/isEqual';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { CollisionsContext } from '../providers/CollisionsProvider/CollisionsProvider';
import { useTimeRange } from './useTimeRange';

const EMPTY_SELECTION = {};

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

    const toggleItem = useCallback(
        (input) => {
            setSelectedItems((prevSelectedItems) => {
                const itemsToToggle = Array.isArray(input) ? input : [input];
                const newSelectedItems = { ...prevSelectedItems };

                itemsToToggle.forEach(({ id }) => {
                    const elementData = processedItems.find((item) => {
                        const recData =
                            item.element?.getAttr('data-recording') || item.element?.getAttr('data-overlap-group');
                        return recData?.id === id;
                    });

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
        [processedItems]
    );

    const isItemSelected = useCallback((itemId) => !!selectedItems[itemId], [selectedItems]);

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

        layersToDraw.forEach((layer) => {
            layer.draw();
        });
    }, [selectedItems, processedItems]);

    useEffect(() => {
        setSelectedItems((prevSelectedItems) => {
            const updatedSelectedItems = {};

            processedItems.forEach((item) => {
                const recData = getRecordingData(item.element);
                if (recData && recData.id && recData.isSelected) {
                    updatedSelectedItems[recData.id] = { ...recData, element: item.element };
                }

                const group = item.element?.attrs['data-overlap-group'];
                if (group?.elements) {
                    Object.values(group.elements).forEach((child) => {
                        if (child?.id && child.isSelected) {
                            updatedSelectedItems[child.id] = { ...child, element: child.element };
                        }
                    });
                }
            });

            return isEqual(prevSelectedItems, updatedSelectedItems) ? prevSelectedItems : updatedSelectedItems;
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

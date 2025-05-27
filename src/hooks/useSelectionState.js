import isEqual from 'lodash/isEqual';
import { useCallback, useContext, useMemo, useState } from 'react';
import { CollisionsContext } from '../providers/CollisionsProvider/CollisionsProvider';
import { useTimeRange } from './useTimeRange';

const EMPTY_SELECTION = {};

function getRecordingData(item) {
    return item.element?.getAttr('data-recording') || item.element?.getAttr('data-overlap-group');
}

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
            // normalize to array
            const itemsToToggle = Array.isArray(input) ? input : [input];
            const toggledNodes = [];

            setSelectedItems((prevSelectedItems) => {
                const newSelectedItems = { ...prevSelectedItems };

                itemsToToggle.forEach(({ id }) => {
                    // find the container whose recData contains our id
                    const container = processedItems.find((item) => {
                        const recData = getRecordingData(item);
                        if (!recData) return false;
                        if (recData.id === id) return true;
                        return Boolean(recData.elements && recData.elements[id]);
                    });
                    if (!container) return;

                    const recData = getRecordingData(container);
                    let entryData;
                    let node;

                    if (recData.id === id) {
                        // top-level match
                        entryData = recData;
                        node = container.element;
                    } else {
                        // child match
                        entryData = recData.elements[id];
                        // assume each child node has attrs.id = "element-<id>"
                        node = container.element.findOne(`#element-${id}`) || container.element;
                    }

                    // toggle selection
                    if (newSelectedItems[id]) {
                        toggledNodes.push(newSelectedItems[id].element);
                        delete newSelectedItems[id];
                    } else {
                        newSelectedItems[id] = {
                            ...entryData,
                            element: node
                        };
                        toggledNodes.push(node);
                    }
                });

                return newSelectedItems;
            });

            // redraw only the layers we touched
            toggledNodes.forEach((node) => {
                const layer = node.getLayer();
                if (layer) layer.batchDraw();
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

    const updateSelectedItemById = useCallback(({ id, isSelected, updates }) => {
        setSelectedItems((prevSelectedValues) => {
            const existing = prevSelectedValues[id];
            if (!existing) return prevSelectedValues;

            const merged = { ...existing, ...updates };

            if (isEqual(existing, merged)) {
                return prevSelectedValues;
            }

            if (isSelected === false) {
                // @ts-ignore
                const { [id]: _, ...rest } = prevSelectedValues;
                return rest;
            }

            return {
                ...prevSelectedValues,
                [id]: merged
            };
        });
    }, []);

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
        updateSelectedItemById
    };
};

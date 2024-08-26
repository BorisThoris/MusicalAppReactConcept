import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { useBoxMove } from '../hooks/useBoxMove';
import { usePanelControl } from '../hooks/usePanelControl';
import { PanelContext } from '../hooks/usePanelState';
import { useSelectionState } from '../hooks/useSelectionState';
import { CollisionsContext } from './CollisionsProvider/CollisionsProvider';
import { TimelineContext } from './TimelineProvider';

export const SelectionContext = createContext({
    clearSelection: () => {},
    isItemSelected: (id) => false,
    selectedItems: {},
    selectedValues: [{}],
    setSelectionBasedOnCoordinates: ({ intersectedElements, yLevel }) => {},

    toggleItem: (id) => {}
});

export const SelectionProvider = ({ children }) => {
    const { timelineState } = useContext(TimelineContext);
    const { closePanel, openSelectionsPanel, panels } = useContext(PanelContext);
    const { calculateCollisions, getProcessedElements } = useContext(CollisionsContext);

    const markersAndTrackerOffset = useMemo(() => timelineState.markersAndTrackerOffset, [timelineState]);

    const {
        clearSelection,
        duplicateSelections,
        flatValues,
        groupEndTime,
        groupStartTime,
        highestYLevel,
        isItemSelected,
        selectedItems,
        setSelectionBasedOnCoordinates,
        toggleItem,
        updateSelectedItemsStartTime
    } = useSelectionState({ markersAndTrackerOffset });

    const {
        handleSelectionBoxClick,
        handleSelectionBoxDragEnd,
        handleSelectionBoxMove,
        selectedElementsCords,
        setSelectedElementsCords
    } = useBoxMove({ selectedItems });

    usePanelControl(selectedItems, panels, openSelectionsPanel, closePanel);

    const deleteSelections = useCallback(
        (selectedEvents) => {
            // Ensure selectedEvents is an array, even if a single event is passed
            const eventsArray = Array.isArray(selectedEvents) ? selectedEvents : [selectedEvents];

            // Get all processed elements from the timeline
            const processedElements = getProcessedElements();

            // Filter the elements that match the selected events and destroy them
            processedElements.forEach(({ element, instrumentName }) => {
                eventsArray.forEach((event) => {
                    // Extract the ID from the element and remove the "element-" prefix for comparison
                    const elementId = element.id().replace('element-', '');

                    if (event.instrumentName === instrumentName && event.id === elementId) {
                        if (event.parentId) {
                            // Look for the parent group by ID prefixed with "parent-"
                            const parentElement = element.getStage()?.findOne(`#parent-${event.parentId}`);

                            if (parentElement) {
                                parentElement.destroy(); // Remove the parent group from the Konva layer
                            }
                        }

                        element.destroy(); // Remove the element from the Konva layer
                    }
                });
            });

            // Recalculate collisions after elements are destroyed
            calculateCollisions();
        },
        [calculateCollisions, getProcessedElements]
    );

    const selectedValues = Object.values(flatValues);

    const value = useMemo(() => {
        return {
            clearSelection,
            deleteSelections,

            duplicateSelections,
            endTime: groupEndTime,
            handleSelectionBoxClick,
            handleSelectionBoxDragEnd,
            handleSelectionBoxMove,
            highestYLevel,
            isItemSelected,
            selectedElementsCords,
            selectedItems,
            selectedValues,
            setSelectedElementsCords,
            setSelectionBasedOnCoordinates,
            startTime: groupStartTime,
            toggleItem,
            updateSelectedItemsStartTime
        };
    }, [
        clearSelection,
        deleteSelections,
        duplicateSelections,
        groupEndTime,
        handleSelectionBoxClick,
        handleSelectionBoxDragEnd,
        handleSelectionBoxMove,
        highestYLevel,
        isItemSelected,
        selectedElementsCords,
        selectedItems,
        selectedValues,
        setSelectedElementsCords,
        setSelectionBasedOnCoordinates,
        groupStartTime,
        toggleItem,
        updateSelectedItemsStartTime
    ]);

    return <SelectionContext.Provider value={value}>{children}</SelectionContext.Provider>;
};

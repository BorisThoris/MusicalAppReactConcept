import React, { createContext, useCallback, useContext, useMemo } from 'react';
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
    const { overlapGroups, pushToHistory, setOverlapGroups } = useContext(CollisionsContext);

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

    // Implement the deleteRecording function
    const deleteSelections = useCallback(
        (selectedEvents) => {
            const updatedGroups = { ...overlapGroups };

            // Ensure selectedEvents is an array, even if a single event is passed
            const eventsArray = Array.isArray(selectedEvents) ? selectedEvents : [selectedEvents];

            eventsArray.forEach((event) => {
                const instrument = event.instrumentName;
                if (updatedGroups[instrument] && updatedGroups[instrument][event.id]) {
                    delete updatedGroups[instrument][event.id];
                }
            });

            pushToHistory(updatedGroups);
            setOverlapGroups(updatedGroups);
        },
        [overlapGroups, pushToHistory, setOverlapGroups]
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

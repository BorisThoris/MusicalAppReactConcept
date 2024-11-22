import React, { createContext, useCallback, useContext, useEffect, useMemo } from 'react';
import { useBoxMove } from '../hooks/useBoxMove';
import { PanelContext, SELECTIONS_PANEL_ID } from '../hooks/usePanelState';
import { useSelectionState } from '../hooks/useSelectionState';
import { TimelineContext } from './TimelineProvider';

export const SelectionContext = createContext({
    clearSelection: () => {},
    duplicateSelections: (startTime = '') => null,
    isItemSelected: (id) => false,
    selectedItems: {},
    selectedValues: [{}],
    setSelectionBasedOnCoordinates: ({ intersectedElements, yLevel }) => {},

    toggleItem: (id) => {}
});

export const SelectionProvider = ({ children }) => {
    const { timelineState } = useContext(TimelineContext);
    const { closeSelectionsPanel, openSelectionsPanel, panels } = useContext(PanelContext);

    const markersAndTrackerOffset = useMemo(() => timelineState.markersAndTrackerOffset, [timelineState]);

    const {
        clearSelection,
        deleteSelections,
        duplicateSelections,
        groupEndTime,
        groupStartTime,
        highestYLevel,
        isItemSelected,
        selectedItems,
        setSelectionBasedOnCoordinates,
        toggleItem,
        updateSelectedItemById
    } = useSelectionState({ markersAndTrackerOffset });

    const { handleSelectionBoxMove } = useBoxMove({ selectedItems });

    useEffect(() => {
        const isSelectedItemsNotEmpty = Object.keys(selectedItems).length > 0;
        const panelNotOpen = !panels[SELECTIONS_PANEL_ID];

        if (isSelectedItemsNotEmpty && panelNotOpen) {
            openSelectionsPanel();
        }
    }, [openSelectionsPanel, panels, selectedItems]);

    const selectedValues = Object.values(selectedItems).sort((a, b) => {
        if (!a.startTime) return 1;
        if (!b.startTime) return -1;
        return a.startTime - b.startTime;
    });

    const handleCloseSelectionsPanel = useCallback(() => {
        closeSelectionsPanel();
        clearSelection();
    }, [clearSelection, closeSelectionsPanel]);

    const value = useMemo(() => {
        return {
            clearSelection,
            deleteSelections,
            duplicateSelections,
            endTime: groupEndTime,
            handleCloseSelectionsPanel,
            handleSelectionBoxMove,
            highestYLevel,
            isItemSelected,
            selectedItems,
            selectedValues,

            setSelectionBasedOnCoordinates,
            startTime: groupStartTime,
            toggleItem,
            updateSelectedItemById
        };
    }, [
        updateSelectedItemById,
        clearSelection,
        deleteSelections,
        duplicateSelections,
        groupEndTime,
        handleCloseSelectionsPanel,
        handleSelectionBoxMove,
        highestYLevel,
        isItemSelected,
        selectedItems,
        selectedValues,
        setSelectionBasedOnCoordinates,
        groupStartTime,
        toggleItem
    ]);

    return <SelectionContext.Provider value={value}>{children}</SelectionContext.Provider>;
};

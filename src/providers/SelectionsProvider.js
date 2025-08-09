import React, { createContext, useCallback, useContext, useEffect, useMemo } from 'react';
import { useBoxMove } from '../hooks/useBoxMove';
import { PanelContext, SELECTIONS_PANEL_ID } from '../hooks/usePanelState';
import { useSelectionState } from '../hooks/useSelectionState';
import { TimelineContext } from './TimelineProvider';

export const SelectionContext = createContext(null);

export const SelectionProvider = ({ children }) => {
    const { markersAndTrackerOffset } = useContext(TimelineContext);
    const { closeSelectionsPanel, openSelectionsPanel, panels } = useContext(PanelContext);

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
        unselectItem,
        updateSelectedItemById
    } = useSelectionState({ markersAndTrackerOffset });

    const { handleSelectionBoxMove } = useBoxMove({ selectedItems });

    // Panel integration logic
    useEffect(() => {
        const isSelectedItemsNotEmpty = Object.keys(selectedItems).length > 0;
        const panelNotOpen = !panels[SELECTIONS_PANEL_ID];

        if (isSelectedItemsNotEmpty && panelNotOpen) {
            openSelectionsPanel();
        }
    }, [openSelectionsPanel, panels, selectedItems]);

    const selectedValues = useMemo(() => {
        return Object.values(selectedItems).sort((a, b) => {
            if (!a.startTime) return 1;
            if (!b.startTime) return -1;
            return a.startTime - b.startTime;
        });
    }, [selectedItems]);

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
            unselectItem,
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
        unselectItem,
        toggleItem
    ]);

    return <SelectionContext.Provider value={value}>{children}</SelectionContext.Provider>;
};

import React, { createContext, useContext, useMemo } from 'react';
import { useBoxMove } from '../hooks/useBoxMove';
import { usePanelControl } from '../hooks/usePanelControl';
import { PanelContext } from '../hooks/usePanelState';
import { useSelectionState } from '../hooks/useSelectionState';
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

    const markersAndTrackerOffset = useMemo(() => timelineState.markersAndTrackerOffset, [timelineState]);

    const {
        clearSelection,
        deleteSelections,
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

    const { handleSelectionBoxMove } = useBoxMove({ selectedItems });

    usePanelControl(selectedItems, panels, openSelectionsPanel, closePanel);

    const selectedValues = Object.values(flatValues);

    const value = useMemo(() => {
        return {
            clearSelection,
            deleteSelections,
            duplicateSelections,
            endTime: groupEndTime,
            handleSelectionBoxMove,
            highestYLevel,
            isItemSelected,
            selectedItems,
            selectedValues,
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
        handleSelectionBoxMove,
        highestYLevel,
        isItemSelected,
        selectedItems,
        selectedValues,
        setSelectionBasedOnCoordinates,
        groupStartTime,
        toggleItem,
        updateSelectedItemsStartTime
    ]);

    return <SelectionContext.Provider value={value}>{children}</SelectionContext.Provider>;
};

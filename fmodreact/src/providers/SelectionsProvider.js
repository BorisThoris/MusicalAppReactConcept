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
    setSelectionBasedOnCoordinates: ({ endX, endY, startX, startY }) => {},

    toggleItem: (id) => {}
});

export const SelectionProvider = ({ children }) => {
    const { timelineState } = useContext(TimelineContext);
    const { closePanel, openPanel, panels } = useContext(PanelContext);
    const markersAndTrackerOffset = useMemo(() => timelineState.markersAndTrackerOffset, [timelineState]);

    const {
        clearSelection,
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

    usePanelControl(selectedItems, panels, openPanel, closePanel);

    const selectedValues = Object.values(flatValues);

    const value = useMemo(() => {
        return {
            clearSelection,
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

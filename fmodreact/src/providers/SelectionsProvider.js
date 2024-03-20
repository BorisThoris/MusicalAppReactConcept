import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { PanelContext, SELECTIONS_PANEL_ID } from '../hooks/usePanelState';
import { InstrumentRecordingsContext } from './InstrumentsProvider';
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
    const { overlapGroups } = useContext(InstrumentRecordingsContext);
    const { timelineState } = useContext(TimelineContext);
    const { closePanel, openPanel, panels } = useContext(PanelContext);
    const markersAndTrackerOffset = useMemo(() => timelineState.markersAndTrackerOffset, [timelineState]);

    const [selectedItems, setSelectedItems] = useState({});

    useEffect(() => {
        const isSelectedItemsNotEmpty = Object.keys(selectedItems).length > 0;
        const isPanelOpen = !!panels[SELECTIONS_PANEL_ID];

        if (isSelectedItemsNotEmpty && !isPanelOpen) {
            openPanel({ id: SELECTIONS_PANEL_ID });
        } else if (!isSelectedItemsNotEmpty && isPanelOpen) {
            closePanel(SELECTIONS_PANEL_ID);
        }
    }, [closePanel, openPanel, panels, selectedItems]);

    const toggleItem = useCallback((recording) => {
        setSelectedItems((prevSelectedItems) => {
            const newSelectedItems = { ...prevSelectedItems };

            if (newSelectedItems[recording.id]) {
                delete newSelectedItems[recording.id];
            } else {
                newSelectedItems[recording.id] = recording;
            }
            return newSelectedItems;
        });
    }, []);

    const isItemSelected = useCallback(
        (itemId) => {
            return !!selectedItems[itemId];
        },
        [selectedItems]
    );

    const clearSelection = useCallback(() => {
        setSelectedItems({});
    }, []);

    const timelineHeight = 200;
    const selectEvents = useCallback(
        (recordingOrEvent, startX, endX, startY, endY, yLevel) => {
            const isSelectedInTimeRange = recordingOrEvent.startTime <= endX && recordingOrEvent.endTime >= startX;
            const isSelectedInYRange =
                yLevel <= endY - markersAndTrackerOffset && yLevel + 200 >= startY - markersAndTrackerOffset;

            if (!isSelectedInTimeRange || !isSelectedInYRange) {
                return {};
            }

            const selected = { [recordingOrEvent.id]: { ...recordingOrEvent } };

            if (recordingOrEvent.events) {
                recordingOrEvent.events.forEach((event) => {
                    const selectedNestedEvents = selectEvents(event, startX, endX, startY, endY, yLevel);
                    Object.assign(selected, selectedNestedEvents);
                });
            }

            return selected;
        },
        [markersAndTrackerOffset]
    );

    const setSelectionBasedOnCoordinates = useCallback(
        ({ endX, endY, startX, startY }) => {
            const newSelectedItems = Object.entries(overlapGroups).reduce((acc, [instrumentName, group], index) => {
                const yLevel = index * timelineHeight;

                group.forEach((recording) => {
                    const selectedFromRecording = selectEvents(recording, startX, endX, startY, endY, yLevel);
                    Object.assign(acc, selectedFromRecording);
                });

                return acc;
            }, {});

            setSelectedItems(newSelectedItems);
        },
        [overlapGroups, selectEvents]
    );

    const valuesArray = Object.values(Object.keys(selectedItems)).sort((a, b) => a.startTime - b.startTime);

    const test = Object.values(overlapGroups).reduce((acc, group) => {
        group.forEach((recording) => {
            // Check if recording itself matches and should be included
            if (valuesArray.includes(recording.id)) {
                // If the recording matches, consider adding its events
                if (recording.events) {
                    acc.push(...recording.events.filter((event) => valuesArray.includes(`${event.id}`)));
                }
            } else if (recording.events) {
                // Directly filter matching events within this recording
                const matchingEvents = recording.events.filter((event) => valuesArray.includes(`${event.id}`));
                acc.push(...matchingEvents);
            }
        });
        return acc;
    }, []);

    const value = useMemo(() => {
        return {
            clearSelection,
            isItemSelected,
            selectedItems,
            selectedValues: Object.values(test),
            setSelectionBasedOnCoordinates,
            toggleItem
        };
    }, [clearSelection, isItemSelected, selectedItems, setSelectionBasedOnCoordinates, test, toggleItem]);

    return <SelectionContext.Provider value={value}>{children}</SelectionContext.Provider>;
};

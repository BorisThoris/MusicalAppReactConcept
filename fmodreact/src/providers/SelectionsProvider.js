import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useInstrumentRecordingsOperations } from '../hooks/useInstrumentRecordingsOperations';
import { PanelContext, SELECTIONS_PANEL_ID } from '../hooks/usePanelState';
import { InstrumentRecordingsContext } from './InstrumentsProvider';
import { TimelineContext, TimelineHeight } from './TimelineProvider';

export const SelectionContext = createContext({
    clearSelection: () => {},
    isItemSelected: (id) => false,
    selectedItems: {},
    selectedValues: [{}],
    setSelectionBasedOnCoordinates: ({ endX, endY, startX, startY }) => {},

    toggleItem: (id) => {}
});

export const SelectionProvider = ({ children }) => {
    const { updateRecording } = useInstrumentRecordingsOperations();

    const { overlapGroups } = useContext(InstrumentRecordingsContext);
    const { getEventById } = useInstrumentRecordingsOperations();
    const { timelineState } = useContext(TimelineContext);
    const { closePanel, openPanel, panels } = useContext(PanelContext);
    const markersAndTrackerOffset = useMemo(() => timelineState.markersAndTrackerOffset, [timelineState]);

    const [selectedItems, setSelectedItems] = useState({});
    const [highestYLevel, setHighestYLevel] = useState(0);

    const [groupStartTime, setGroupStartTime] = useState(null);
    const [groupEndTime, setGroupEndTime] = useState(null);

    const updateGroupTimeRange = useCallback(() => {
        const itemTimes = Object.values(selectedItems).map((item) => ({
            endTime: item.endTime,
            startTime: item.startTime
        }));

        const earliestStartTime = Math.min(...itemTimes.map((item) => item.startTime));
        const latestEndTime = Math.max(...itemTimes.map((item) => item.endTime));

        setGroupStartTime(earliestStartTime === Infinity ? null : earliestStartTime);
        setGroupEndTime(latestEndTime === -Infinity ? null : latestEndTime);
    }, [selectedItems]);

    useEffect(() => {
        if (Object.keys(selectedItems).length > 0) {
            updateGroupTimeRange();
        } else {
            // Reset group times if there are no selected items
            setGroupStartTime(null);
            setGroupEndTime(null);
        }
    }, [selectedItems, updateGroupTimeRange]);

    useEffect(() => {
        const isSelectedItemsNotEmpty = Object.keys(selectedItems).length > 0;
        const isPanelOpen = !!panels[SELECTIONS_PANEL_ID];

        if (isSelectedItemsNotEmpty && !isPanelOpen) {
            openPanel({ id: SELECTIONS_PANEL_ID });
        } else if (!isSelectedItemsNotEmpty && isPanelOpen) {
            closePanel(SELECTIONS_PANEL_ID);
        }
    }, [closePanel, openPanel, panels, selectedItems]);

    const toggleItem = useCallback((input) => {
        setSelectedItems((prevSelectedItems) => {
            const newSelectedItems = { ...prevSelectedItems };
            // Normalize input to an array
            const recordings = Array.isArray(input) ? input : [input];

            recordings.forEach((recording) => {
                if (newSelectedItems[recording.id]) {
                    // If the item is already selected, remove it
                    delete newSelectedItems[recording.id];
                } else {
                    // Otherwise, add the item

                    newSelectedItems[recording.id] = recording;
                }
            });

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

    const selectEvents = useCallback(
        (recordingOrEvent, startX, endX, startY, endY, yLevel) => {
            const isSelectedInTimeRange = recordingOrEvent.startTime <= endX && recordingOrEvent.endTime >= startX;
            const isSelectedInYRange =
                yLevel <= endY - markersAndTrackerOffset && yLevel + TimelineHeight >= startY - markersAndTrackerOffset;

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
            // Reduce function to find selected items.

            let highestYIndex = 0;

            const newSelectedItems = Object.entries(overlapGroups).reduce((acc, [instrumentName, group], index) => {
                const yLevel = index * TimelineHeight;

                group.forEach((recording) => {
                    const selectedFromRecording = selectEvents(recording, startX, endX, startY, endY, yLevel);
                    if (Object.values(selectedFromRecording).length > 0) {
                        Object.assign(acc, selectedFromRecording);

                        highestYIndex = yLevel + TimelineHeight;
                    }
                });

                return acc;
            }, {});

            setSelectedItems(newSelectedItems);
            setHighestYLevel(highestYIndex + markersAndTrackerOffset + 10);
        },
        [markersAndTrackerOffset, overlapGroups, selectEvents]
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

    const updateSelectedItemsStartTime = useCallback(
        (newStartTime) => {
            Object.keys(selectedItems).forEach((itemId) => {
                if (selectedItems[itemId]) {
                    const actualEvent = getEventById(itemId);

                    updateRecording({
                        eventLength: actualEvent.eventLength,
                        index: itemId,
                        instrumentName: actualEvent.instrumentName,
                        newStartTime: actualEvent.startTime + newStartTime
                    });
                }
            });
        },
        [selectedItems, getEventById, updateRecording]
    );

    const value = useMemo(() => {
        return {
            clearSelection,
            endTime: groupEndTime,
            highestYLevel,
            isItemSelected,
            selectedItems,
            selectedValues: Object.values(test),
            setSelectionBasedOnCoordinates,
            startTime: groupStartTime,
            toggleItem,
            updateSelectedItemsStartTime
        };
    }, [
        clearSelection,
        highestYLevel,
        isItemSelected,
        selectedItems,
        setSelectionBasedOnCoordinates,
        test,
        toggleItem,
        groupStartTime,
        groupEndTime,
        updateSelectedItemsStartTime
    ]);

    return <SelectionContext.Provider value={value}>{children}</SelectionContext.Provider>;
};

import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { InstrumentRecordingsContext } from '../providers/InstrumentsProvider';
import { TimelineHeight } from '../providers/TimelineProvider';
import { useInstrumentRecordingsOperations } from './useInstrumentRecordingsOperations';
import { useTimeRange } from './useTimeRange';

export const useSelectionState = ({ markersAndTrackerOffset }) => {
    const { flatOverlapGroups, overlapGroups } = useContext(InstrumentRecordingsContext);
    const { getEventById, updateRecording } = useInstrumentRecordingsOperations();

    const [selectedItems, setSelectedItems] = useState({});
    const [highestYLevel, setHighestYLevel] = useState(0);

    const prevSelectedItemsRef = useRef({});

    const { groupEndTime, groupStartTime } = useTimeRange(selectedItems);

    // Generate flatValues based on selectedItems
    const flatValues = Object.keys(selectedItems).reduce((acc, key) => {
        const recording = flatOverlapGroups[key];
        if (recording) {
            acc[key] = recording;
        }
        return acc;
    }, {});

    useEffect(() => {
        if (JSON.stringify(prevSelectedItemsRef.current) === JSON.stringify(overlapGroups)) {
            return; // If the selected items have not changed, do nothing
        }

        const updatedSelectedItems = Object.keys(selectedItems).reduce((newSelectedItems, itemId) => {
            // eslint-disable-next-line no-restricted-syntax
            for (const group of Object.values(flatOverlapGroups)) {
                const match = `${group.id}` === `${itemId}`;
                if (match) {
                    // eslint-disable-next-line no-param-reassign
                    newSelectedItems[itemId] = { ...group };
                    break;
                }
            }
            return newSelectedItems;
        }, {});

        prevSelectedItemsRef.current = overlapGroups;

        setSelectedItems(updatedSelectedItems);
    }, [flatOverlapGroups, overlapGroups, selectedItems]);

    const selectEvents = useCallback(
        (recordingOrEvent, startX, endX, startY, endY, yLevel) => {
            const isSelectedInTimeRange = recordingOrEvent.startTime <= endX && recordingOrEvent.endTime >= startX;
            const isSelectedInYRange =
                yLevel <= endY - markersAndTrackerOffset && yLevel + TimelineHeight >= startY - markersAndTrackerOffset;

            if (!isSelectedInTimeRange || !isSelectedInYRange) {
                return {};
            }

            if (!recordingOrEvent.events) {
                return { [recordingOrEvent.id]: { ...recordingOrEvent } };
            }

            if (recordingOrEvent.locked) {
                return recordingOrEvent.events.reduce((acc, event) => {
                    acc[event.id] = { ...event };
                    return acc;
                }, {});
            }

            return recordingOrEvent.events.reduce((selected, event) => {
                const selectedNestedEvents = selectEvents(event, startX, endX, startY, endY, yLevel);
                return { ...selected, ...selectedNestedEvents };
            }, {});
        },
        [markersAndTrackerOffset]
    );

    const setSelectionBasedOnCoordinates = useCallback(
        ({ endX, endY, startX, startY }) => {
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

    const clearSelection = useCallback(() => {
        setSelectedItems({});
    }, []);

    const toggleItem = useCallback(
        (input) => {
            setSelectedItems((prevSelectedItems) => {
                const newSelectedItems = { ...prevSelectedItems };
                const recordings = Array.isArray(input) ? input : [input];
                recordings.forEach((recording) => {
                    if (newSelectedItems[recording.id]) {
                        delete newSelectedItems[recording.id];
                    } else {
                        // Fetching new selected item from the current overlapGroups
                        // eslint-disable-next-line no-restricted-syntax
                        for (const group of Object.values(overlapGroups)) {
                            const found = group.find((item) => item.id === recording.id);
                            if (found) {
                                newSelectedItems[recording.id] = { ...found };
                                break;
                            }
                        }
                    }
                });

                return newSelectedItems;
            });
        },
        [overlapGroups]
    );

    const isItemSelected = useCallback((itemId) => !!selectedItems[itemId], [selectedItems]);

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
        [getEventById, selectedItems, updateRecording]
    );

    return {
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
    };
};

export default useSelectionState;

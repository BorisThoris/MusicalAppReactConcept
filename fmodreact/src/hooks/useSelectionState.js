import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { InstrumentRecordingsContext } from '../providers/InstrumentsProvider';
import { TimelineHeight } from '../providers/TimelineProvider';
import { useInstrumentRecordingsOperations } from './useInstrumentRecordingsOperations';
import useOverlapCalculator from './useOverlapCalculator/useOverlapCalculator';
import { useTimeRange } from './useTimeRange';

export const useSelectionState = ({ markersAndTrackerOffset }) => {
    const { flatOverlapGroups, overlapGroups } = useContext(InstrumentRecordingsContext);
    const { duplicateMultipleOverlapGroups } = useInstrumentRecordingsOperations();
    const { getEventById, updateRecording } = useInstrumentRecordingsOperations();

    const [selectedItems, setSelectedItems] = useState({});
    const [filteredSelectedItems, setFilteredSelectedItems] = useState({});

    const [highestYLevel, setHighestYLevel] = useState(0);
    const { calculateOverlapsForAllInstruments } = useOverlapCalculator(filteredSelectedItems, filteredSelectedItems);

    const prevSelectedItemsRef = useRef({});

    const { groupEndTime, groupStartTime } = useTimeRange(selectedItems);

    useEffect(() => {
        if (JSON.stringify(prevSelectedItemsRef.current) === JSON.stringify(selectedItems)) {
            return;
        }

        const filterItemsByInstrument = (items) => {
            return Object.values(items).reduce((acc, item) => {
                const instrument = item.instrumentName;
                if (!acc[instrument]) {
                    acc[instrument] = {};
                }
                acc[instrument][item.id] = item;
                return acc;
            }, {});
        };

        const filteredItems = filterItemsByInstrument(selectedItems);
        setFilteredSelectedItems(filteredItems);
    }, [overlapGroups, selectedItems]);

    useEffect(() => {
        if (JSON.stringify(prevSelectedItemsRef.current) === JSON.stringify(overlapGroups)) {
            return;
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

            const selectNestedEvents = (event) => {
                const evVals = Object.values(event.events || {});

                if (evVals.length > 1)
                    return evVals.reduce((acc, nestedEvent) => {
                        return { ...acc, ...selectEvents(nestedEvent, startX, endX, startY, endY, yLevel) };
                    }, {});

                return { [event.id]: { ...event, events: { [event.id]: event } } };
            };

            if (!recordingOrEvent.events) {
                return {
                    [recordingOrEvent.id]: {
                        ...recordingOrEvent,
                        events: { [recordingOrEvent.id]: { ...recordingOrEvent, locked: false } }
                    }
                };
            }

            if (recordingOrEvent.locked) {
                const lockedSelected = Object.fromEntries(
                    Object.values(recordingOrEvent.events).map((event) => [
                        event.id,
                        { ...event, events: { [event.id]: { ...event, locked: false } } }
                    ])
                );

                return lockedSelected;
            }

            return {
                ...selectNestedEvents(recordingOrEvent)
            };
        },
        [markersAndTrackerOffset]
    );

    const setSelectionBasedOnCoordinates = useCallback(
        ({ endX, endY, startX, startY }) => {
            let highestYIndex = 0;

            const newSelectedItems = Object.values(overlapGroups).reduce((acc, events, index) => {
                const yLevel = index * TimelineHeight;

                // Iterate over each event in this instrument's group
                Object.values(events).forEach((event) => {
                    const selectedFromEvent = selectEvents(event, startX, endX, startY, endY, yLevel);
                    if (Object.values(selectedFromEvent).length > 0) {
                        Object.assign(acc, { ...selectedFromEvent });
                        highestYIndex = yLevel + TimelineHeight;
                    }
                });

                return acc;
            }, {});

            setSelectedItems(newSelectedItems);
            setHighestYLevel(highestYIndex + markersAndTrackerOffset + 10);
        },
        [overlapGroups, markersAndTrackerOffset, selectEvents]
    );

    const clearSelection = useCallback(() => {
        setSelectedItems({});
    }, []);

    const toggleItem = useCallback(
        (input) => {
            setSelectedItems((prevSelectedItems) => {
                const itemsToToggle = Array.isArray(input) ? input : [input];
                const newSelectedItems = { ...prevSelectedItems };

                itemsToToggle.forEach(({ id }) => {
                    if (newSelectedItems[id]) {
                        delete newSelectedItems[id];
                    } else if (flatOverlapGroups[id]) {
                        newSelectedItems[id] = { ...flatOverlapGroups[id] };
                    }
                });

                return newSelectedItems;
            });
        },
        [flatOverlapGroups]
    );

    const unSelectItem = useCallback((input) => {
        setSelectedItems((prevSelectedItems) => {
            const itemsToDelete = Array.isArray(input) ? input : [input];
            const newSelectedItems = { ...prevSelectedItems };

            itemsToDelete.forEach(({ id }) => {
                if (newSelectedItems[id]) {
                    delete newSelectedItems[id];
                }
            });

            return newSelectedItems;
        });
    }, []);

    const isItemSelected = useCallback((itemId) => !!selectedItems[itemId], [selectedItems]);

    const updateSelectedItemsStartTime = useCallback(
        (newStartTime) => {
            Object.keys(selectedItems).forEach((itemId) => {
                if (selectedItems[itemId]) {
                    const actualEvent = getEventById(itemId);

                    updateRecording({
                        newStartTime: actualEvent.startTime + newStartTime,
                        recording: selectedItems[itemId]
                    });
                }
            });
        },
        [getEventById, selectedItems, updateRecording]
    );

    const flatValues = Object.keys(selectedItems).reduce((acc, key) => {
        const recording = flatOverlapGroups[key];
        if (recording) {
            acc[key] = recording;
        }
        return acc;
    }, {});

    const duplicateSelections = () => {
        const calculatedInstrumentOverlaps = calculateOverlapsForAllInstruments();

        const groupsToDuplicate = Object.values(calculatedInstrumentOverlaps).flatMap((events) =>
            Object.values(events).map((ev) => ({
                overlapGroup: { ...ev },
                startTimeOffset: groupEndTime - groupStartTime
            }))
        );

        duplicateMultipleOverlapGroups(groupsToDuplicate);
    };

    return {
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
        unSelectItem,
        updateSelectedItemsStartTime
    };
};

export default useSelectionState;

import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { InstrumentRecordingsContext } from '../providers/InstrumentsProvider';
import { TimelineHeight } from '../providers/TimelineProvider';
import { useInstrumentRecordingsOperations } from './useInstrumentRecordingsOperations';
import useOverlapCalculator, { processOverlapCalculations } from './useOverlapCalculator/useOverlapCalculator';
import { useTimeRange } from './useTimeRange';

export const useSelectionState = ({ markersAndTrackerOffset }) => {
    const { flatOverlapGroups, overlapGroups } = useContext(InstrumentRecordingsContext);
    const { duplicateOverlapGroup } = useInstrumentRecordingsOperations();
    const { getEventById, updateRecording } = useInstrumentRecordingsOperations();

    const [selectedItems, setSelectedItems] = useState({});
    const [filteredSelectedItems, setFilteredSelectedItems] = useState([]);

    const [highestYLevel, setHighestYLevel] = useState(0);

    const { calculateOverlapsForAllInstruments } = useOverlapCalculator(filteredSelectedItems, filteredSelectedItems);

    const prevSelectedItemsRef = useRef({});

    const { groupEndTime, groupStartTime } = useTimeRange(selectedItems);

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

                let testReturn = { ...selected, ...selectedNestedEvents };

                if (selected[recordingOrEvent.id]) {
                    testReturn = { ...testReturn, [recordingOrEvent.id]: { ...recordingOrEvent } };
                }

                return { ...testReturn };
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

                selectEvents(group, startX, endX, startY, endY, yLevel);

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

    // Generate flatValues based on selectedItems
    const flatValues = Object.keys(selectedItems).reduce((acc, key) => {
        const recording = flatOverlapGroups[key];
        if (recording) {
            acc[key] = recording;
        }
        return acc;
    }, {});

    const duplicateSelections = () => {
        const calcedOverlapGroups = calculateOverlapsForAllInstruments();

        Object.keys(calcedOverlapGroups).forEach((instrument) => {
            // Loop through each item in the instrument's array (each event)
            calcedOverlapGroups[instrument].forEach((item) => {
                duplicateOverlapGroup({
                    // locked: false,
                    overlapGroup: item,
                    startTimeOffset: groupEndTime - groupStartTime
                });
            });
        });
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

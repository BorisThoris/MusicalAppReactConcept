import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { InstrumentRecordingsContext, InstrumentRecordingsProvider } from './InstrumentsProvider';

export const SelectionContext = createContext({
    clearSelection: () => {},
    isItemSelected: (id) => false,
    selectedItems: {},
    selectedValues: [{}],
    toggleItem: (id) => {}
});

export const SelectionProvider = ({ children }) => {
    const { overlapGroups } = useContext(InstrumentRecordingsContext);
    const [selectedItems, setSelectedItems] = useState({});

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

    const valuesArray = Object.values(Object.keys(selectedItems)).sort((a, b) => a.startTime - b.startTime);

    console.log(overlapGroups);

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

    console.log(test);

    console.log(valuesArray);
    console.log(test);

    const value = useMemo(() => {
        return {
            clearSelection,
            isItemSelected,
            selectedItems,
            selectedValues: Object.values(test),
            toggleItem
        };
    }, [clearSelection, isItemSelected, selectedItems, test, toggleItem]);

    return <SelectionContext.Provider value={value}>{children}</SelectionContext.Provider>;
};

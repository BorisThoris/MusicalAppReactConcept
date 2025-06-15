import isEqual from 'lodash/isEqual';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { CollisionsContext } from '../providers/CollisionsProvider/CollisionsProvider';
import { useTimeRange } from './useTimeRange';

const EMPTY_SELECTION = {};

function getRecordingData(item) {
    const attrFn = item?.element?.getAttr;
    if (typeof attrFn !== 'function') return null;

    const rec = item.element.getAttr('data-recording') ?? item.element.getAttr('data-overlap-group');
    if (!rec) return null;

    if (!rec.initialId) rec.initialId = rec.id;

    return rec;
}

export const useSelectionState = ({ markersAndTrackerOffset = 0 }) => {
    const { processedItems = [] } = useContext(CollisionsContext) || {};
    const [selectedItems, setSelectedItems] = useState({});
    const [highestYLevel, setHighestYLevel] = useState(0);
    const { groupEndTime, groupStartTime } = useTimeRange(selectedItems);

    const groupMembership = useMemo(() => {
        const map = {};
        processedItems.forEach((item) => {
            const rec = getRecordingData(item);
            if (rec && rec.id && rec.elements && typeof rec.elements === 'object') {
                map[rec.id] = Object.keys(rec.elements);
            }
        });
        return map;
    }, [processedItems]);

    const clearSelection = useCallback(() => {
        setSelectedItems({});
    }, []);

    const toggleItem = useCallback(
        (input) => {
            const items = Array.isArray(input) ? input : [input];
            const ids = items.map((i) => i?.id).filter(Boolean);
            if (!ids.length) return;

            setSelectedItems((prev) => {
                const next = { ...prev };

                ids.forEach((id, idx) => {
                    const item = items[idx];
                    const children =
                        item?.elements && typeof item.elements === 'object'
                            ? Object.keys(item.elements)
                            : groupMembership[id];

                    const isGroup = Boolean(children);

                    if (isGroup) {
                        if (next[id]) {
                            delete next[id];
                        } else {
                            children.forEach((cid) => delete next[cid]);

                            const element = item?.element;
                            const recData = item ?? getRecordingData({ element }) ?? {};

                            next[id] = { ...recData, element };
                        }
                    } else {
                        if (next[id]) {
                            delete next[id];
                        } else {
                            const container = processedItems.find((it) => getRecordingData(it)?.elements?.[id]);
                            const rec = getRecordingData(container) || {};
                            const child = rec.elements?.[id] || {};
                            const node =
                                item?.element?.findOne?.(`#element-${id}`) ?? item?.element ?? container?.element;

                            next[id] = { ...child, element: node };
                        }

                        const parentItem = processedItems.find((it) => getRecordingData(it)?.elements?.[id]);
                        const parentRec = getRecordingData(parentItem);
                        if (parentRec?.id) {
                            const siblings = groupMembership[parentRec.id] || [];
                            const allSelected = siblings.every((cid) => Boolean(next[cid]));

                            if (allSelected) {
                                siblings.forEach((cid) => delete next[cid]);
                                next[parentRec.id] = { ...parentRec, element: parentItem?.element };
                            } else {
                                delete next[parentRec.id];
                            }
                        }
                    }
                });

                return next;
            });
        },
        [processedItems, groupMembership]
    );

    const setSelectionBasedOnCoordinates = useCallback(
        ({ intersectedElements, yLevel }) => {
            if (!intersectedElements) return;
            clearSelection();
            setHighestYLevel(yLevel + markersAndTrackerOffset * 2 + 10);
            toggleItem(intersectedElements);
        },
        [markersAndTrackerOffset, clearSelection, toggleItem]
    );

    const deleteSelections = useCallback((events) => {
        const arr = Array.isArray(events) ? events : [events];
        setSelectedItems((prev) => {
            const next = { ...prev };
            arr.forEach(({ element, id }) => {
                if (id in next) {
                    delete next[id];
                }
                if (element?.destroy) {
                    element.destroy();
                }
            });
            return next;
        });
    }, []);

    const isItemSelected = useCallback((id) => Boolean(selectedItems[id]), [selectedItems]);

    const updateSelectedItemById = useCallback(({ id, isSelected, updates }) => {
        const initialId = updates?.initialId ?? updates?.id ?? id;
        const currentId = id;

        setSelectedItems((prev) => {
            const existing = prev[initialId];
            const merged = { ...existing, ...updates };

            if (isSelected === false) {
                const { [initialId]: _, ...rest } = prev;
                return rest;
            }

            if (initialId !== currentId) {
                const { [currentId]: existingCurrent, [initialId]: _, ...rest } = prev;
                return {
                    ...rest,
                    [currentId]: {
                        ...(existingCurrent || {}),
                        ...merged,
                        initialId: currentId
                    }
                };
            }

            if (isEqual(existing, merged)) return prev;
            return { ...prev, [initialId]: merged };
        });
    }, []);

    const memoizedSelectedItems = Object.keys(selectedItems).length === 0 ? EMPTY_SELECTION : selectedItems;

    return {
        clearSelection,
        deleteSelections,
        groupEndTime,
        groupStartTime,
        highestYLevel,
        isItemSelected,
        selectedItems: memoizedSelectedItems,
        setSelectedItems,
        setSelectionBasedOnCoordinates,
        toggleItem,
        updateSelectedItemById
    };
};

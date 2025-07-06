import isEqual from 'lodash/isEqual';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { CollisionsContext } from '../providers/CollisionsProvider/CollisionsProvider';
import { useTimeRange } from './useTimeRange';

const EMPTY_SELECTION = {};

/**
 * Extract recording metadata (group id, elements, etc.)
 */
function getRecordingData(item) {
    const attrFn = item?.element?.getAttr;
    if (typeof attrFn !== 'function') return null;

    const rec = item.element.getAttr('data-recording') ?? item.element.getAttr('data-overlap-group');
    if (!rec) return null;

    if (!rec.initialId) rec.initialId = rec.id;
    return rec;
}

/**
 * Normalize selectedItems: collapse full groups and expand invalid groups
 */
function normalizeSelection(selected, groupMap) {
    const next = { ...selected };

    // collapse fully selected groups
    Object.entries(groupMap).forEach(([groupId, children]) => {
        const allSelected = children.every((childId) => Boolean(next[childId]));
        if (allSelected) {
            children.forEach((cid) => delete next[cid]);
            next[groupId] = selected[groupId] || {
                elements: children.reduce((acc, cid) => ({ ...acc, [cid]: {} }), {}),
                id: groupId
            };
        }
    });

    return next;
}

export const useSelectionState = ({ markersAndTrackerOffset = 0 }) => {
    const { processedItems = [] } = useContext(CollisionsContext) || {};
    const [selectedItems, setSelectedItems] = useState({});
    const [highestYLevel, setHighestYLevel] = useState(0);
    const { groupEndTime, groupStartTime } = useTimeRange(selectedItems);

    // Build group membership map: { groupId: [childId, ...] }
    const groupMembership = useMemo(
        () =>
            Object.fromEntries(
                processedItems
                    .map((item) => {
                        const rec = getRecordingData(item);
                        if (rec?.id && rec.elements && typeof rec.elements === 'object') {
                            return [rec.id, Object.keys(rec.elements)];
                        }
                        return null;
                    })
                    .filter(Boolean)
            ),
        [processedItems]
    );

    // Recalculate selection when group structure changes
    useEffect(() => {
        setSelectedItems((prev) => normalizeSelection(prev, groupMembership));
    }, [groupMembership]);

    const clearSelection = useCallback(() => setSelectedItems({}), []);

    const unselectItem = useCallback(
        (input) => {
            const ids = (Array.isArray(input) ? input : [input])
                .map((i) => (typeof i === 'string' ? i : i?.id))
                .filter(Boolean);
            if (!ids.length) return;

            setSelectedItems((prev) => {
                const next = { ...prev };
                ids.forEach((id) => {
                    delete next[id];
                    Object.entries(groupMembership).forEach(([gid, children]) => {
                        if (children.includes(id) && prev[gid]) {
                            delete next[gid];
                            children.forEach((cid) => {
                                if (cid !== id) {
                                    const parent = prev[gid];
                                    next[cid] = { element: parent.element, id: cid, ...(parent.elements || {})[cid] };
                                }
                            });
                        }
                    });
                });
                return next;
            });
        },
        [groupMembership]
    );

    const toggleItem = useCallback(
        (input) => {
            const items = Array.isArray(input) ? input : [input];
            setSelectedItems((prev) => {
                const next = { ...prev };
                items.forEach((item) => {
                    const { id } = item;
                    const children = item.elements ? Object.keys(item.elements) : groupMembership[id];
                    const isGroup = Boolean(children);

                    if (isGroup) {
                        if (next[id]) {
                            delete next[id];
                        } else {
                            children.forEach((cid) => delete next[cid]);
                            next[id] = item;
                        }
                    } else {
                        if (next[id]) {
                            delete next[id];
                        } else {
                            next[id] = item;
                        }

                        Object.entries(groupMembership).forEach(([pid, siblings]) => {
                            if (siblings.includes(id)) {
                                const allSel = siblings.every((cid) => Boolean(next[cid]));
                                if (allSel) {
                                    siblings.forEach((cid) => delete next[cid]);
                                    const parentItem = processedItems.find((it) => getRecordingData(it)?.id === pid);
                                    const rec = getRecordingData(parentItem) || {};
                                    next[pid] = { ...rec, element: parentItem?.element };
                                } else {
                                    delete next[pid];
                                }
                            }
                        });
                    }
                });
                return next;
            });
        },
        [groupMembership, processedItems]
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
                delete next[id];
                element?.destroy?.();
            });
            return next;
        });
    }, []);

    const isItemSelected = useCallback(
        (id) => {
            if (selectedItems[id]) return true;

            return Object.entries(groupMembership).some(
                ([groupId, children]) => children.includes(id) && Boolean(selectedItems[groupId])
            );
        },
        [selectedItems, groupMembership]
    );

    const updateSelectedItemById = useCallback(({ id, isSelected, updates }) => {
        setSelectedItems((prev) => {
            const existing = prev[id];
            const merged = { ...existing, ...updates };
            if (isSelected === false) {
                const { [id]: _, ...rest } = prev;
                return rest;
            }
            return isEqual(existing, merged) ? prev : { ...prev, [id]: merged };
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
        unselectItem,
        updateSelectedItemById
    };
};

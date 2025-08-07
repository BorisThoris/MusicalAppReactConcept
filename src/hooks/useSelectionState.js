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

/**
 * Normalize based on internal isSelected flags
 */
function normalizeSelection(selectedItems, groupMembership) {
    const normalized = { ...selectedItems };
    console.log('Passed items', normalized);
    const groupedChildren = new Set();

    // eslint-disable-next-line no-restricted-syntax
    for (const [groupId, { children, groupData }] of Object.entries(groupMembership)) {
        const allSelected = children.every((cid) =>
            Object.values(groupData.elements).some((item) => item.id === cid && item.isSelected === true)
        );

        if (allSelected) {
            normalized[groupId] = {
                ...groupData
            };
            children.forEach((cid) => groupedChildren.add(cid));
        }
    }

    // eslint-disable-next-line no-restricted-syntax
    for (const [id, item] of Object.entries(selectedItems || {})) {
        if (groupMembership[id]) break;
        if (!groupedChildren.has(id)) {
            normalized[id] = item;
        }
    }

    console.log('finalized normalized selection', normalized);

    return normalized;
}

export function useSelectionState({ markersAndTrackerOffset = 0 } = {}) {
    const { processedItems = [] } = useContext(CollisionsContext) || {};
    const [selectedItems, setSelectedItems] = useState(() => ({}));
    const [highestYLevel, setHighestYLevel] = useState(0);
    const { groupEndTime, groupStartTime } = useTimeRange(selectedItems);

    const groupMembership = useMemo(() => {
        const groups = {};

        // eslint-disable-next-line no-restricted-syntax
        for (const item of processedItems) {
            const data = getRecordingData(item);
            if (data?.elements && typeof data.elements === 'object') {
                groups[data.id] = {
                    children: Object.keys(data.elements),
                    element: item.element,
                    groupData: data
                };
            }
        }

        return groups;
    }, [processedItems]);

    useEffect(() => {
        setSelectedItems((prev) => {
            console.log('   ');
            console.log('groupMembership', groupMembership);
            console.log('prevItems', prev);
            const normalized = normalizeSelection(prev, groupMembership);
            return isEqual(prev, normalized) ? prev : normalized;
        });
    }, [groupMembership]);

    const clearSelection = useCallback(() => {
        setSelectedItems({});
    }, []);

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

                    Object.entries(groupMembership).forEach(([gid, { children }]) => {
                        if (children.includes(id) && prev?.[gid]) {
                            delete next[gid];
                            children.forEach((cid) => {
                                if (cid !== id) {
                                    const parent = prev[gid];
                                    next[cid] = {
                                        element: parent.element,
                                        id: cid,
                                        ...(parent.elements || {})[cid]
                                    };
                                }
                            });
                        }
                    });
                });
                return next ?? {};
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
                    const children = item.elements ? Object.keys(item.elements) : groupMembership[id]?.children;
                    const isGroup = Boolean(children?.length);

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

                        Object.entries(groupMembership).forEach(([pid, { children: siblings, element, groupData }]) => {
                            if (siblings.includes(id)) {
                                const allSel = siblings.every((cid) => Boolean(next[cid]));
                                if (allSel) {
                                    siblings.forEach((cid) => delete next[cid]);
                                    next[pid] = { ...groupData, element };
                                } else {
                                    delete next[pid];
                                }
                            }
                        });
                    }
                });

                return next ?? {};
            });
        },
        [groupMembership]
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
            return next ?? {};
        });
    }, []);

    const isItemSelected = useCallback(
        (id) => {
            if (selectedItems?.[id]) return true;

            return false;
        },
        [selectedItems]
    );

    const updateSelectedItemById = useCallback(({ id, isSelected, updates }) => {
        setSelectedItems((prev) => {
            const existing = prev?.[id];
            const merged = { ...existing, ...updates };

            if (isSelected === false) {
                const { [id]: _, ...rest } = prev ?? {};
                return rest;
            }

            const diff = isEqual(existing, merged);
            return diff ? prev : { ...prev, [id]: merged };
        });
    }, []);

    const memoizedSelectedItems = useMemo(() => {
        if (!selectedItems || typeof selectedItems !== 'object') return EMPTY_SELECTION;
        return Object.keys(selectedItems).length === 0 ? EMPTY_SELECTION : selectedItems;
    }, [selectedItems]);

    return {
        clearSelection,
        deleteSelections,
        groupEndTime,
        groupStartTime,
        highestYLevel,
        isItemSelected,
        selectedItems: memoizedSelectedItems,
        setSelectionBasedOnCoordinates,
        toggleItem,
        unselectItem,
        updateSelectedItemById
    };
}

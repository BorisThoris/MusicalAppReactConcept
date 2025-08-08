import isEqual from 'lodash/isEqual';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { CollisionsContext } from '../providers/CollisionsProvider/CollisionsProvider';
import { useTimeRange } from './useTimeRange';

const EMPTY_SELECTION = {};

function getRecordingData(item) {
    if (!item) return null;

    const attrFn = item?.element?.getAttr;
    if (typeof attrFn !== 'function') return null;

    const rec = item.element.getAttr('data-recording') ?? item.element.getAttr('data-overlap-group');
    if (!rec) return null;

    if (!rec.initialId) rec.initialId = rec.id;
    return rec;
}

/**
 * Normalize selection based on group membership
 * Handles the logic for selecting/deselecting groups vs individual elements
 */
function normalizeSelection(selectedItems, groupMembership) {
    if (!selectedItems || Object.keys(selectedItems).length === 0) {
        return {};
    }

    const normalized = { ...selectedItems };
    const groupedChildren = new Set();

    // First pass: Check if all children of a group are selected
    Object.entries(groupMembership).forEach(([groupId, { children, groupData }]) => {
        if (!children || children.length === 0) return;

        const allChildrenSelected = children.every((childId) => selectedItems[childId] !== undefined);

        if (allChildrenSelected) {
            // Replace individual children with group selection
            normalized[groupId] = {
                ...groupData,
                element: groupData.element || null
            };

            // Mark children as part of a group selection
            children.forEach((childId) => {
                groupedChildren.add(childId);
                delete normalized[childId];
            });
        }
    });

    // Second pass: Handle partial group selections
    Object.entries(groupMembership).forEach(([groupId, { children }]) => {
        if (!children || children.length === 0) return;

        const selectedChildren = children.filter((childId) => selectedItems[childId] !== undefined);

        // If some but not all children are selected, remove group selection
        if (selectedChildren.length > 0 && selectedChildren.length < children.length) {
            delete normalized[groupId];
        }
    });

    return normalized;
}

export function useSelectionState({ markersAndTrackerOffset = 0 } = {}) {
    const { processedItems = [] } = useContext(CollisionsContext) || {};
    const [selectedItems, setSelectedItems] = useState(() => ({}));
    const [highestYLevel, setHighestYLevel] = useState(0);
    const { groupEndTime, groupStartTime } = useTimeRange(selectedItems);

    // Build group membership map
    const groupMembership = useMemo(() => {
        const groups = {};

        processedItems.forEach((item) => {
            try {
                const data = getRecordingData(item);
                if (data?.elements && typeof data.elements === 'object') {
                    groups[data.id] = {
                        children: Object.keys(data.elements),
                        element: item.element,
                        groupData: data
                    };
                }
            } catch (error) {
                // Silent error handling for production
            }
        });

        return groups;
    }, [processedItems]);

    // Normalize selection when group membership changes
    useEffect(() => {
        setSelectedItems((prev) => {
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

                    // Handle group unselection
                    Object.entries(groupMembership).forEach(([gid, { children }]) => {
                        if (children.includes(id) && prev?.[gid]) {
                            // Remove group selection
                            delete next[gid];

                            // Add back individual children that weren't being unselected
                            children.forEach((childId) => {
                                if (childId !== id && prev[gid]) {
                                    const parent = prev[gid];
                                    next[childId] = {
                                        element: parent.element,
                                        id: childId,
                                        ...(parent.elements || {})[childId]
                                    };
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
            if (!input) return;

            const items = Array.isArray(input) ? input : [input];

            setSelectedItems((prev) => {
                const next = { ...prev };

                items.forEach((item) => {
                    if (!item || !item.id) {
                        return;
                    }

                    const { id } = item;
                    const children = item.elements ? Object.keys(item.elements) : groupMembership[id]?.children;
                    const isGroup = Boolean(children?.length);

                    if (isGroup) {
                        // Handle group selection/deselection
                        if (next[id]) {
                            // Deselect group
                            delete next[id];
                            // Add back individual children
                            children.forEach((childId) => {
                                next[childId] = {
                                    element: item.element,
                                    id: childId,
                                    ...(item.elements || {})[childId]
                                };
                            });
                        } else {
                            // Select group
                            children.forEach((childId) => delete next[childId]);
                            next[id] = item;
                        }
                    } else {
                        // Handle individual element selection
                        if (next[id]) {
                            delete next[id];
                        } else {
                            next[id] = item;
                        }

                        // Check if this creates a complete group selection
                        Object.entries(groupMembership).forEach(([gid, { children: siblings, element, groupData }]) => {
                            if (siblings.includes(id)) {
                                const allSelected = siblings.every((cid) => Boolean(next[cid]));

                                if (allSelected) {
                                    // Replace individual selections with group selection
                                    siblings.forEach((cid) => delete next[cid]);
                                    next[gid] = { ...groupData, element };
                                } else {
                                    // Ensure group is not selected if not all children are selected
                                    delete next[gid];
                                }
                            }
                        });
                    }
                });

                return next;
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

            return next;
        });
    }, []);

    const isItemSelected = useCallback(
        (id) => {
            if (!id) return false;
            return Boolean(selectedItems?.[id]);
        },
        [selectedItems]
    );

    const updateSelectedItemById = useCallback(({ id, isSelected, updates }) => {
        if (!id) return;

        setSelectedItems((prev) => {
            const existing = prev?.[id];
            const merged = { ...existing, ...updates };

            if (isSelected === false) {
                const newState = { ...prev };
                delete newState[id];
                return newState;
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

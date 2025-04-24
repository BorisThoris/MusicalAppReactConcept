import React, { createContext, useCallback, useContext, useMemo, useRef } from 'react';
import { ELEMENT_ID_PREFIX, GROUP_ELEMENT_ID_PREFIX } from '../globalConstants/elementIds';
import pixelToSecondRatio from '../globalConstants/pixelToSeconds';
import { CollisionsContext } from './CollisionsProvider/CollisionsProvider';
import { SelectionContext } from './SelectionsProvider';

// @ts-ignore
export const SoundEventDragContext = createContext();

export const SoundEventDragProvider = ({ children }) => {
    const { dragging, refreshBeat, setDragging, stageRef } = useContext(CollisionsContext);
    const { clearSelection, isItemSelected, selectedItems } = useContext(SelectionContext);

    console.log('selectedItems', selectedItems);

    // Convert selectedItems to raw IDs array
    const selectedElementIds = useMemo(
        () =>
            Object.values(selectedItems).map(({ element, id, type }) => {
                console.log('element', element);
                const isGroup = element.attrs['data-overlap-group'];
                const prefix = isGroup ? GROUP_ELEMENT_ID_PREFIX : ELEMENT_ID_PREFIX;
                const computedType = isGroup ? 'group' : 'element';

                return { id: `${prefix}${id}`, type: computedType };
            }),
        [selectedItems]
    );

    // Refs for drag state
    const initialXRef = useRef(null);
    const currentYRef = useRef(0);
    const dragRequestRef = useRef(null);
    const highlightedTimelinesRef = useRef(new Set());
    const initialPositionsRef = useRef(new Map());

    // Utility to update Konva attrs
    const forceUpdatePosition = useCallback((el) => {
        el.setAttrs({ x: el.x(), y: el.y() });
    }, []);

    // Highlight helpers omitted for brevity...
    const applyHighlightToTimeline = (timeline) => {
        if (timeline) {
            timeline.fill('yellow');
            timeline.getLayer().draw();
        }
    };
    const removeHighlightFromTimeline = (timeline) => {
        if (timeline) {
            timeline.fill('white');
            timeline.getLayer().draw();
        }
    };

    // Find closest timeline events/rects omitted for brevity...

    const findClosestTimelineEvents = useCallback(
        (element) => {
            const pos = element.getAbsolutePosition();
            let closest = null;
            let minDist = Infinity;
            const all = stageRef.find((n) => n.attrs?.id?.includes('-events'));
            all.forEach((node) => {
                const box = node.parent.getAbsolutePosition();
                const d = Math.abs(pos.y - box.y);
                if (d < minDist) {
                    minDist = d;
                    closest = node;
                }
            });
            return closest;
        },
        [stageRef]
    );

    const findClosestTimelineRect = useCallback(
        (element) => {
            const boxEl = element.getClientRect();
            let closest = null;
            let minDist = Infinity;
            const all = stageRef.find((n) => n.attrs?.id?.includes('timelineRect'));
            all.forEach((node) => {
                const box = node.getClientRect();
                const d = Math.abs(boxEl.y - box.y);
                if (d < minDist) {
                    minDist = d;
                    closest = node;
                }
            });
            return closest;
        },
        [stageRef]
    );

    const insertElementIntoTimeline = useCallback(({ closestTimeline, element }) => {
        const name = closestTimeline?.attrs?.id.split('-')[0] || 'Unknown';
        if (element.attrs['data-recording']) {
            element.setAttr('data-recording', {
                ...element.attrs['data-recording'],
                instrumentName: name
            });
        } else if (element.attrs['data-overlap-group']) {
            element.setAttr('data-overlap-group', {
                ...element.attrs['data-overlap-group'],
                instrumentName: name
            });
        }
    }, []);

    const updateStartTimeForElement = useCallback(
        ({ designatedStartTime = null, element }) => {
            if (element.attrs['data-recording']) {
                const start = designatedStartTime ?? element.x() / pixelToSecondRatio;
                const rec = { ...element.attrs['data-recording'] };
                const end = start + rec.eventLength;

                if (rec.startTime === start && rec.endTime === end) return;

                element.setAttr('data-recording', { ...rec, endTime: end, startTime: start });
            } else if (element.attrs['data-overlap-group']) {
                const grp = { ...element.attrs['data-overlap-group'] };
                const newGroupStart = designatedStartTime ?? element.x() / pixelToSecondRatio;
                const offset = newGroupStart - grp.startTime;

                grp.startTime = newGroupStart;
                grp.endTime = newGroupStart + grp.length;

                element.setAttr('data-overlap-group', grp);

                Object.values(grp.elements).forEach((child) => {
                    const currentChildStart =
                        child.node.attrs['data-recording']?.startTime ?? child.node.x() / pixelToSecondRatio;
                    const newChildStart = currentChildStart + offset;

                    updateStartTimeForElement({ designatedStartTime: newChildStart, element: child.node });

                    const tl = findClosestTimelineEvents(child.node);
                    insertElementIntoTimeline({ closestTimeline: tl, element: child.node });
                });
            }
        },
        [findClosestTimelineEvents, insertElementIntoTimeline]
    );

    const processSelectedElements = useCallback(
        (stage, action) => {
            selectedElementIds.forEach(({ id }) => {
                const node = stage.findOne((currentNode) => {
                    return currentNode.attrs.id === id;
                });

                if (node) action(node);
            });
        },
        [selectedElementIds]
    );

    const handleDragStart = useCallback(
        (event) => {
            event.evt.stopPropagation();
            event.target.moveToTop();

            const recording = event.target.attrs['data-recording'];
            const overlap = event.target.attrs['data-overlap-group'];

            let rawId;
            let prefix;
            let isGroupDrag = false;

            if (recording?.id) {
                rawId = recording.id;
                prefix = ELEMENT_ID_PREFIX;
            } else if (overlap?.id) {
                rawId = overlap.id;
                prefix = GROUP_ELEMENT_ID_PREFIX;
                isGroupDrag = true;
            } else {
                return;
            }

            initialXRef.current = event.target.x();
            currentYRef.current = event.evt.y;

            const stage = stageRef;
            // If not dragging a group, capture all selected elements; otherwise capture only the group
            if (!isGroupDrag) {
                processSelectedElements(stage, (element) => {
                    initialPositionsRef.current.set(element.attrs.id, { x: element.x(), y: element.y() });
                });
            } else {
                initialPositionsRef.current.set(event.target.attrs.id, { x: event.target.x(), y: event.target.y() });
            }

            // Prepare dragging state
            const newDragging = {};
            const itemId = `${prefix}${rawId}`;

            newDragging[itemId] = true;

            if (!isGroupDrag) {
                selectedElementIds.forEach(({ id }) => {
                    newDragging[id] = true;
                });
            }

            setDragging((prev) => ({ ...prev, ...newDragging }));
        },
        [stageRef, processSelectedElements, selectedElementIds, setDragging]
    );

    const handleDragMove = useCallback(
        (e) => {
            e.evt.stopPropagation();
            const idAttr = e.target.attrs.id || '';
            const isGroup = idAttr.startsWith(GROUP_ELEMENT_ID_PREFIX);
            if (!idAttr.startsWith(ELEMENT_ID_PREFIX) && !isGroup) return;

            if (dragRequestRef.current) cancelAnimationFrame(dragRequestRef.current);

            dragRequestRef.current = requestAnimationFrame(() => {
                const curX = e.target.x();
                const curY = e.evt.y;
                const totalDX = curX - initialXRef.current;
                const dY = curY - currentYRef.current;
                currentYRef.current = curY;

                const newHighlights = new Set();
                const mover = (node) => {
                    const init = initialPositionsRef.current.get(node.attrs.id);
                    if (init) node.setAttr('x', init.x + totalDX);
                    node.move({ y: dY });
                    forceUpdatePosition(node);
                    const tl = findClosestTimelineRect(node);
                    if (tl) newHighlights.add(tl);
                };

                // If dragging a group, only move the group; otherwise move selected items
                if (isGroup) {
                    mover(e.target);
                } else if (selectedElementIds.length) {
                    processSelectedElements(stageRef, mover);
                } else {
                    mover(e.target);
                }

                highlightedTimelinesRef.current.forEach((t) => {
                    if (!newHighlights.has(t)) removeHighlightFromTimeline(t);
                });
                newHighlights.forEach((t) => {
                    if (!highlightedTimelinesRef.current.has(t)) applyHighlightToTimeline(t);
                });
                highlightedTimelinesRef.current = newHighlights;
            });
        },
        [forceUpdatePosition, findClosestTimelineRect, processSelectedElements, selectedElementIds, stageRef]
    );

    const finalizeDrag = useCallback(
        (node) => {
            const tl = findClosestTimelineEvents(node);
            insertElementIntoTimeline({ closestTimeline: tl, element: node });
            updateStartTimeForElement({ element: node });
        },
        [findClosestTimelineEvents, insertElementIntoTimeline, updateStartTimeForElement]
    );

    const handleDragEnd = useCallback(
        (e) => {
            const idAttr = e.target.attrs.id || '';
            const isGroup = idAttr.startsWith(GROUP_ELEMENT_ID_PREFIX);

            if (isGroup) {
                finalizeDrag(e.target);
            } else if (selectedElementIds.length) {
                processSelectedElements(stageRef, finalizeDrag);
            } else {
                finalizeDrag(e.target);
            }

            highlightedTimelinesRef.current.forEach(removeHighlightFromTimeline);
            highlightedTimelinesRef.current.clear();
            initialXRef.current = null;
            currentYRef.current = 0;
            initialPositionsRef.current.clear();
            setDragging({});
            refreshBeat();
        },
        [finalizeDrag, processSelectedElements, refreshBeat, selectedElementIds, stageRef, setDragging]
    );

    console.log('DRAGGING', dragging);
    const isElementBeingDragged = useCallback((id) => !!dragging[id], [dragging]);

    const value = useMemo(
        () => ({
            applyHighlightToTimeline,
            handleDragEnd,
            handleDragMove,
            handleDragStart,
            insertElementIntoTimeline,
            isElementBeingDragged,
            removeHighlightFromTimeline
        }),
        [handleDragStart, handleDragMove, handleDragEnd, insertElementIntoTimeline, isElementBeingDragged]
    );

    return <SoundEventDragContext.Provider value={value}>{children}</SoundEventDragContext.Provider>;
};

const useDrag = () => useContext(SoundEventDragContext);

export default useDrag;

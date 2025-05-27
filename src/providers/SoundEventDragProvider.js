import React, { createContext, useCallback, useContext, useMemo, useRef } from 'react';
import { ELEMENT_ID_PREFIX, GROUP_ELEMENT_ID_PREFIX } from '../globalConstants/elementIds';
import { CollisionsContext } from './CollisionsProvider/CollisionsProvider';
import { usePixelRatio } from './PixelRatioProvider/PixelRatioProvider';
import { SelectionContext } from './SelectionsProvider';

export const SoundEventDragContext = createContext();

export const SoundEventDragProvider = ({ children }) => {
    const pixelToSecondRatio = usePixelRatio();
    const { dragging, refreshBeat, setDragging, stageRef } = useContext(CollisionsContext);
    const { selectedItems } = useContext(SelectionContext);

    function extractElementIdsFromGroup(groupElm, targetId) {
        console.log('here');

        const chl = Object.values(groupElm.elements)
            .filter((child) => targetId === child.id)
            .map((child) => child.id);

        return chl;
    }

    const selectedElementIds = useMemo(() => {
        const result = [];

        // eslint-disable-next-line no-restricted-syntax
        for (const { element, id } of Object.values(selectedItems)) {
            const isGroup = element?.attrs?.['data-overlap-group'];

            if (isGroup) {
                const groupString = element?.attrs?.['data-overlap-group'];
                const childrenIds = extractElementIdsFromGroup(groupString, id);
                childrenIds.forEach((childId) =>
                    result.push({ id: `${ELEMENT_ID_PREFIX}${childId}`, type: 'element' })
                );

                result.push({ id: `${GROUP_ELEMENT_ID_PREFIX}${id}`, type: 'group' });
            } else {
                result.push({ id: `${ELEMENT_ID_PREFIX}${id}`, type: 'element' });
            }
        }

        return result;
    }, [selectedItems]);

    const initialXRef = useRef(null);
    const currentYRef = useRef(0);
    const dragRequestRef = useRef(null);
    const highlightedTimelinesRef = useRef(new Set());
    const initialPositionsRef = useRef(new Map());

    const forceUpdatePosition = useCallback((el) => {
        el.setAttrs({ x: el.x(), y: el.y() });
    }, []);

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

    const findClosestTimelineEvents = useCallback(
        (element) => {
            const pos = element.getAbsolutePosition();
            let closest = null;
            let minDist = Infinity;
            const all = stageRef.find((n) => n.attrs?.id?.includes('-events'));
            all.forEach((el) => {
                const box = el.parent.getAbsolutePosition();
                const d = Math.abs(pos.y - box.y);
                if (d < minDist) {
                    minDist = d;
                    closest = el;
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
            all.forEach((el) => {
                const box = el.getClientRect();
                const d = Math.abs(boxEl.y - box.y);
                if (d < minDist) {
                    minDist = d;
                    closest = el;
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
                        child.element.attrs['data-recording']?.startTime ?? child.element.x() / pixelToSecondRatio;
                    const newChildStart = currentChildStart + offset;
                    updateStartTimeForElement({ designatedStartTime: newChildStart, element: child.element });
                    const tl = findClosestTimelineEvents(child.element);
                    insertElementIntoTimeline({ closestTimeline: tl, element: child.element });
                });
            }
        },
        [findClosestTimelineEvents, insertElementIntoTimeline, pixelToSecondRatio]
    );

    const processSelectedElements = useCallback(
        (stage, action) => {
            selectedElementIds.forEach(({ id }) => {
                const element = stage.findOne((n) => n.attrs.id === id);
                if (!element) {
                    console.warn(`⚠️ Element not found for ID: ${id}`);
                } else {
                    action(element);
                }
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

            processSelectedElements(stage, (element) => {
                initialPositionsRef.current.set(element.attrs.id, { x: element.x(), y: element.y() });
            });

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
                const mover = (element) => {
                    const init = initialPositionsRef.current.get(element.attrs.id);
                    if (init) {
                        element.setAttr('x', init.x + totalDX);
                    }

                    element.move({ y: dY });
                    forceUpdatePosition(element);

                    const tl = findClosestTimelineRect(element);
                    if (tl) {
                        newHighlights.add(tl);
                    }
                };

                // If dragging a group, only move the group; otherwise move selected items
                if (selectedElementIds.length) {
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
        (element) => {
            const tl = findClosestTimelineEvents(element);
            insertElementIntoTimeline({ closestTimeline: tl, element });
            updateStartTimeForElement({ element });
        },
        [findClosestTimelineEvents, insertElementIntoTimeline, updateStartTimeForElement]
    );

    const handleDragEnd = useCallback(
        (e) => {
            if (selectedElementIds.length) {
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

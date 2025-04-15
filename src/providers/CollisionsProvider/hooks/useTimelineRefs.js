/* eslint-disable no-debugger */
import { get } from 'lodash';
import find from 'lodash/find';
import omit from 'lodash/omit';
import set from 'lodash/set';
import { useCallback, useRef } from 'react';
import { ELEMENT_ID_PREFIX } from '../../../globalConstants/elementIds';

export const useTimelineRefs = ({ setHasChanged }) => {
    const timelineRefs = useRef({});
    const stageRef = useRef(null);

    const getStage = () => stageRef.current?.current;

    const addTimelineRef = useCallback((instrumentName, ref) => {
        timelineRefs.current = set({ ...timelineRefs.current }, instrumentName, ref);
    }, []);

    const removeTimelineRef = useCallback((instrumentName) => {
        timelineRefs.current = omit(timelineRefs.current, instrumentName);
    }, []);

    const addStageRef = useCallback((ref) => {
        stageRef.current = ref;
    }, []);

    const removeStageRef = useCallback(() => {
        stageRef.current = null;
    }, []);

    const findAllSoundEventElements = useCallback((parentGroup) => {
        const stage = getStage();
        if (!stage) return [];

        return stage.find((node) => {
            if (!node.id().startsWith(ELEMENT_ID_PREFIX)) return false;
            return !parentGroup || node.attrs['data-parent-group-id'] === parentGroup.attrs.id;
        });
    }, []);

    const getAllGroups = useCallback(() => {
        const stage = getStage();
        return stage?.find((node) => node.attrs?.['data-group-id']) || [];
    }, []);

    const getGroupById = useCallback((groupId) => {
        const stage = getStage();
        return stage?.findOne((node) => node.id() === groupId) || null;
    }, []);

    const getSoundEventById = useCallback((id) => {
        const stage = getStage();
        if (!stage) return null;

        const elements = stage.find((node) => node.id().startsWith(`${ELEMENT_ID_PREFIX}${id}`));
        const element = find(elements, (node) => node.id() === `${ELEMENT_ID_PREFIX}${id}`);
        if (!element) return null;

        const { height, width, x, y } = element.getClientRect?.() || {};
        const recording = element.attrs?.['data-recording'] || {};
        const instrumentName = recording.instrumentName || null;
        const timelineY = element.parent?.attrs?.timelineY || null;

        return { element, height, instrumentName, recording, timelineY, width, x, y };
    }, []);

    const getProcessedElements = useCallback(
        (parentGroup) => {
            const elements = findAllSoundEventElements(parentGroup);
            const seen = new Set();

            return elements.reduce((acc, el) => {
                const id = el.id();
                if (seen.has(id)) return acc;

                const grouped = get(el, "attrs['data-group-child']", false);
                if (grouped && !parentGroup) return acc;

                const { height, width, x, y } = el.getClientRect();
                acc.push({
                    element: el,
                    height,
                    instrumentName: get(el, "attrs['data-recording'].instrumentName", null),
                    recording: get(el, "attrs['data-recording']", {}),
                    rect: { height, width, x, y },
                    timelineY: get(el, 'parent.attrs.timelineY', 0),
                    width,
                    x,
                    y
                });

                seen.add(id);
                return acc;
            }, []);
        },
        [findAllSoundEventElements]
    );

    const getProcessedGroups = useCallback(() => {
        const groups = getAllGroups();
        const seen = new Set();

        return groups.reduce((acc, group) => {
            if (seen.has(group.id()) || !group.hasChildren()) return acc;

            const { height, width, x, y } = group.getClientRect();
            acc.push({
                group,
                node: group,
                ...group.getAttr('data-overlap-group'),
                elements: group.find((n) => n.id().startsWith(ELEMENT_ID_PREFIX)),
                rect: { height, width, x, y }
            });

            seen.add(group.id());
            return acc;
        }, []);
    }, [getAllGroups]);

    const getProcessedItems = useCallback(() => {
        const elements = findAllSoundEventElements();
        const seen = new Set();

        return elements
            .map((el) => {
                const id = el.id();
                if (seen.has(id) || !el.getClientRect) return null;

                const { height, width, x, y } = el.getClientRect();
                seen.add(id);

                return {
                    clientRect: { height, width, x, y },
                    element: el,
                    height,
                    id,
                    instrumentName: get(el, "attrs['data-recording'].instrumentName", null),
                    recording: get(el, "attrs['data-recording']", {}),
                    timelineY: get(el, 'attrs.timelineY', 0),
                    type: 'element',
                    width,
                    x,
                    y
                };
            })
            .filter(Boolean);
    }, [findAllSoundEventElements]);

    const clearElements = useCallback((elements) => {
        elements.forEach((el) => {
            const stage = el.getStage();
            stage?.findOne(`#parent-${el.id().replace(ELEMENT_ID_PREFIX, '')}`)?.destroy();
            el.destroy();
        });
    }, []);

    const deleteAllElements = useCallback(() => {
        const stage = getStage();
        if (!stage) return;

        clearElements(findAllSoundEventElements());
        timelineRefs.current = {};
        setHasChanged(true);
    }, [findAllSoundEventElements, clearElements, setHasChanged]);

    const deleteAllTimelines = useCallback(() => {
        const stage = getStage();
        if (!stage) {
            console.warn('Stage reference is not set.');
            return;
        }

        clearElements(findAllSoundEventElements());
        timelineRefs.current = {};
        setHasChanged(true);
    }, [findAllSoundEventElements, clearElements, setHasChanged]);

    return {
        addStageRef,
        addTimelineRef,
        deleteAllElements,
        deleteAllTimelines,
        findAllSoundEventElements,
        getAllGroups,
        getGroupById,
        getProcessedElements,
        getProcessedGroups,
        getProcessedItems,
        getSoundEventById,
        removeStageRef,
        removeTimelineRef,
        stageRef: stageRef.current,
        timelineRefs
    };
};

import { useCallback, useContext } from 'react';
import { playEventInstance } from '../../../../fmodLogic/eventInstanceHelpers';
import pixelToSecondRatio from '../../../../globalConstants/pixelToSeconds';
import { PanelContext } from '../../../../hooks/usePanelState';
import { useCustomCursorContext } from '../../../../providers/CursorProvider';
import { usePaintings } from '../../../../providers/PaintingProvider';
import { SelectionContext } from '../../../../providers/SelectionsProvider';
import { TimelineContext } from '../../../../providers/TimelineProvider';

const usePanelControls = () => {
    const { openSelectionsPanel } = useContext(PanelContext);
    const { timelineState } = useContext(TimelineContext);
    const { clearSelection, toggleItem: selectElement } = useContext(SelectionContext);

    return { clearSelection, openSelectionsPanel, selectElement, timelineState };
};

export const useClickHandlers = ({ elementRef, handleClickOverlapGroup, parent, recording, timelineY }) => {
    const { eventInstance } = recording;
    const { openSelectionsPanel, selectElement, timelineState } = usePanelControls();

    const canvasOffsetY = timelineState.canvasOffsetY || undefined;

    const openSelectionPanel = useCallback(() => {
        if (parent?.locked) {
            const parentEvents = parent.events;
            const target = parentEvents;

            selectElement(target);
            openSelectionsPanel({ y: timelineY + canvasOffsetY + elementRef.current.attrs.height });
        } else {
            selectElement(recording);
            openSelectionsPanel({ y: timelineY + canvasOffsetY + elementRef.current.attrs.height });
        }
    }, [
        parent?.locked,
        parent?.events,
        selectElement,
        openSelectionsPanel,
        timelineY,
        canvasOffsetY,
        elementRef,
        recording
    ]);

    const handleClick = useCallback(
        (evt) => {
            const isParentPresent = !!parent;

            openSelectionPanel();

            if (isParentPresent && handleClickOverlapGroup && parent.locked) {
                handleClickOverlapGroup();
            }
        },
        [parent, handleClickOverlapGroup, openSelectionPanel]
    );

    const handleDoubleClick = useCallback(() => playEventInstance(eventInstance), [eventInstance]);

    return { handleClick, handleDoubleClick };
};

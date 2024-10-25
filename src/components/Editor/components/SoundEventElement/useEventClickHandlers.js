import { useCallback, useContext } from 'react';
import { playEventInstance } from '../../../../fmodLogic/eventInstanceHelpers';
import { PanelContext } from '../../../../hooks/usePanelState';
import { SelectionContext } from '../../../../providers/SelectionsProvider';
import { TimelineContext } from '../../../../providers/TimelineProvider';

export const useClickHandlers = ({ elementRef, handleClickOverlapGroup, parent, recording, timelineY }) => {
    const { eventInstance } = recording;
    const { openSelectionsPanel } = useContext(PanelContext);
    const { timelineState } = useContext(TimelineContext);
    const { toggleItem: selectElement } = useContext(SelectionContext);

    const canvasOffsetY = timelineState.canvasOffsetY || undefined;

    const openSelectionPanel = useCallback(() => {
        selectElement(recording);
        openSelectionsPanel({ y: timelineY + canvasOffsetY + elementRef.current.attrs.height });
    }, [selectElement, openSelectionsPanel, timelineY, canvasOffsetY, elementRef, recording]);

    const handleClick = useCallback(
        (evt) => {
            evt.evt.preventDefault();
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

import { useCallback, useContext } from 'react';
import { playEventInstance } from '../../../../fmodLogic/eventInstanceHelpers';
import pixelToSecondRatio from '../../../../globalConstants/pixelToSeconds';
import { PanelContext, SELECTIONS_PANEL_ID } from '../../../../hooks/usePanelState';
import { SelectionContext } from '../../../../providers/SelectionsProvider';
import { TimelineContext } from '../../../../providers/TimelineProvider';

const usePanelControls = () => {
    const { openPanel, openParamsPanel } = useContext(PanelContext);
    const { timelineState } = useContext(TimelineContext);
    const { clearSelection, toggleItem: selectElement } = useContext(SelectionContext);

    return { clearSelection, openPanel, openParamsPanel, selectElement, timelineState };
};

export const useClickHandlers = ({ elementRef, handleClickOverlapGroup, parent, recording, timelineY }) => {
    const { eventInstance, index, instrumentName, startTime } = recording;
    const { clearSelection, openPanel, openParamsPanel, selectElement, timelineState } = usePanelControls();
    const startingPositionInTimeline = startTime * pixelToSecondRatio;
    const canvasOffsetY = timelineState.canvasOffsetY || undefined;

    const openSelectionPanel = useCallback(() => {
        if (parent?.locked) {
            const parentEvents = parent.events;
            const target = parentEvents;

            selectElement(target);
            openPanel({ id: SELECTIONS_PANEL_ID, y: timelineY + canvasOffsetY + elementRef.current.attrs.height });
        } else {
            selectElement(recording);
            openPanel({ id: SELECTIONS_PANEL_ID, y: timelineY + canvasOffsetY + elementRef.current.attrs.height });
        }
    }, [parent?.locked, parent?.events, selectElement, openPanel, timelineY, canvasOffsetY, elementRef, recording]);

    const openInstrumentParamsPanel = useCallback(() => {
        if (openParamsPanel) {
            openParamsPanel({
                index,
                instrumentName,
                overlapGroup: recording,
                x: startingPositionInTimeline,
                y: timelineY + canvasOffsetY + elementRef.current.attrs.height
            });
        }
    }, [
        recording,
        openParamsPanel,
        index,
        instrumentName,
        startingPositionInTimeline,
        timelineY,
        canvasOffsetY,
        elementRef
    ]);

    const handleClick = useCallback(
        (evt) => {
            const isLeftClickWithCtrl = evt.evt.button === 0 && evt.evt.ctrlKey;
            const isParentPresent = !!parent;

            if (isLeftClickWithCtrl) {
                return openSelectionPanel();
            }

            clearSelection();

            if (isParentPresent && handleClickOverlapGroup) {
                handleClickOverlapGroup();
            } else if (!isParentPresent) {
                openInstrumentParamsPanel();
            }
        },
        [parent, clearSelection, handleClickOverlapGroup, openSelectionPanel, openInstrumentParamsPanel]
    );

    const handleDoubleClick = useCallback(() => playEventInstance(eventInstance), [eventInstance]);

    return { handleClick, handleDoubleClick };
};

export default useClickHandlers;

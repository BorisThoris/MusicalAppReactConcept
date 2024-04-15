import { useCallback, useContext } from 'react';
import { playEventInstance } from '../../../../fmodLogic/eventInstanceHelpers';
import pixelToSecondRatio from '../../../../globalConstants/pixelToSeconds';
import { PanelContext, SELECTIONS_PANEL_ID } from '../../../../hooks/usePanelState';
import { SelectionContext } from '../../../../providers/SelectionsProvider';
import { TimelineContext } from '../../../../providers/TimelineProvider';

export const useClickHandlers = ({ elementRef, handleClickOverlapGroup, parent, recording, timelineY }) => {
    const { index, instrumentName } = recording;

    const { openPanel, openParamsPanel } = useContext(PanelContext);
    const { timelineState } = useContext(TimelineContext);
    const { clearSelection, toggleItem: selectElement } = useContext(SelectionContext);

    const startingPositionInTimeline = recording.startTime * pixelToSecondRatio;
    const canvasOffsetY = timelineState.canvasOffsetY || undefined;

    const openSelectionPanel = useCallback(() => {
        const target = parent?.locked ? parent.events : recording;

        selectElement(target);
        openPanel({ id: SELECTIONS_PANEL_ID });
    }, [parent, recording, selectElement, openPanel]);

    const openInstrumentParamsPanel = useCallback(() => {
        if (openParamsPanel) {
            openParamsPanel({
                index,
                instrumentName,
                x: startingPositionInTimeline,
                y: timelineY + canvasOffsetY + elementRef.current.attrs.height
            });
        }
    }, [index, instrumentName, startingPositionInTimeline, timelineY, canvasOffsetY, elementRef, openParamsPanel]);

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

    const handleDoubleClick = useCallback(() => playEventInstance(recording.eventInstance), [recording.eventInstance]);

    return { handleClick, handleDoubleClick };
};

export default useClickHandlers;

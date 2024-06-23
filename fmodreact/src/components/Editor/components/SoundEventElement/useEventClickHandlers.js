import { useCallback, useContext } from 'react';
import { playEventInstance } from '../../../../fmodLogic/eventInstanceHelpers';
import pixelToSecondRatio from '../../../../globalConstants/pixelToSeconds';
import { PanelContext } from '../../../../hooks/usePanelState';
import { useCustomCursorContext } from '../../../../providers/CursorProvider';
import { usePaintings } from '../../../../providers/PaintingProvider';
import { SelectionContext } from '../../../../providers/SelectionsProvider';
import { TimelineContext } from '../../../../providers/TimelineProvider';

const usePanelControls = () => {
    const { openParamsPanel, openSelectionsPanel } = useContext(PanelContext);
    const { timelineState } = useContext(TimelineContext);
    const { clearSelection, toggleItem: selectElement } = useContext(SelectionContext);

    return { clearSelection, openParamsPanel, openSelectionsPanel, selectElement, timelineState };
};

export const useClickHandlers = ({ elementRef, handleClickOverlapGroup, parent, recording, timelineY }) => {
    const { eventInstance, index, instrumentName, startTime } = recording;
    const { paintEvent, paintingTarget } = usePaintings();
    const { cursorPos } = useCustomCursorContext();
    const { clearSelection, openParamsPanel, openSelectionsPanel, selectElement, timelineState } = usePanelControls();
    const startingPositionInTimeline = startTime * pixelToSecondRatio;
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

            if (isParentPresent && handleClickOverlapGroup && parent.locked) {
                handleClickOverlapGroup();
            } else {
                openInstrumentParamsPanel();
            }

            if (paintingTarget) {
                paintEvent({ instrumentName: recording.instrumentName, x: cursorPos.screenX });
            }
        },
        [
            parent,
            clearSelection,
            handleClickOverlapGroup,
            cursorPos,
            paintingTarget,
            openSelectionPanel,
            openInstrumentParamsPanel,
            paintEvent,
            recording.instrumentName
        ]
    );

    const handleDoubleClick = useCallback(() => playEventInstance(eventInstance), [eventInstance]);

    return { handleClick, handleDoubleClick };
};

export default useClickHandlers;

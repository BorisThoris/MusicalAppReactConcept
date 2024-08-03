import React, { useCallback, useContext } from 'react';
import { useInstrumentPanel } from '../../../../hooks/useInstrumentPanel';
import { PanelContext } from '../../../../hooks/usePanelState';
import { useRipples } from '../../../../hooks/useRipples';
import { useCustomCursorContext } from '../../../../providers/CursorProvider';
import { RecordingsPlayerContext } from '../../../../providers/RecordingsPlayerProvider';
import { SelectionContext } from '../../../../providers/SelectionsProvider';
import { markersAndTrackerOffset, TimelineContext, TimelineHeight } from '../../../../providers/TimelineProvider';

export const useTimelinePointerEffects = ({ index, instrumentName }) => {
    const { setTrackerPosition } = useContext(RecordingsPlayerContext);
    const { timelineState } = useContext(TimelineContext);

    const { addRipple, removeRipple, ripples } = useRipples();

    const timelineY = TimelineHeight * index + markersAndTrackerOffset;

    // Use the context instead of the hook directly
    const { cursorPos, handleClick, handleMouseMove } = useCustomCursorContext();

    const { clearSelection } = useContext(SelectionContext);

    const { cancelDelayedOpen, closeInstrumentPanel, setupDelayedOpen } = useInstrumentPanel(
        instrumentName,
        timelineY,
        timelineState
    );

    const onPointerDown = useCallback(
        (evt) => {
            handleClick();
            closeInstrumentPanel();

            setTrackerPosition(cursorPos.screenX);
            addRipple(cursorPos.x, cursorPos.y - timelineY);

            if (evt.evt.button === 0 && !evt.evt.ctrlKey) {
                clearSelection();
            }

            setupDelayedOpen(() => {
                addRipple(cursorPos.x, cursorPos.y, 'red');
            }, 500);
        },
        [
            handleClick,
            closeInstrumentPanel,
            setTrackerPosition,
            cursorPos.screenX,
            cursorPos.x,
            cursorPos.y,
            addRipple,
            timelineY,
            setupDelayedOpen,
            clearSelection
        ]
    );

    const onPointerUp = useCallback(() => {
        handleClick();
        cancelDelayedOpen();
    }, [cancelDelayedOpen, handleClick]);

    const onMouseMove = useCallback(
        (evt) => {
            cancelDelayedOpen();
            handleMouseMove(evt, timelineY);
        },
        [cancelDelayedOpen, handleMouseMove, timelineY]
    );

    return {
        onMouseMove,
        onPointerDown,
        onPointerUp,
        removeRipple,
        ripples
    };
};

export default useTimelinePointerEffects;

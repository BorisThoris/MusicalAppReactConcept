import React, { useCallback, useContext } from 'react';
import { playEventInstance } from '../../../../fmodLogic/eventInstanceHelpers';
import { useInstrumentRecordingsOperations } from '../../../../hooks/useInstrumentRecordingsOperations';
import { PanelContext } from '../../../../hooks/usePanelState';
import usePlayback from '../../../../hooks/usePlayback';

export const useEventHandlers = (overlapGroup) => {
    const { closeParamsPanel: closePanel, setFocusedEvent } = useContext(PanelContext);

    const {
        deleteOverlapGroup: deleteOverlapGroupFunc,
        deleteRecording,
        duplicateOverlapGroup,
        updateOverlapGroupTimes
    } = useInstrumentRecordingsOperations();
    const { setNewTimeout } = usePlayback({ playbackStatus: true });

    const handleClose = useCallback(() => closePanel(false), [closePanel]);
    const handlePlayEvent = useCallback((eventInstance) => playEventInstance(eventInstance), []);
    const resetFocusedEvent = useCallback(() => setFocusedEvent(-1), [setFocusedEvent]);
    const deleteOverlapGroup = useCallback(
        () => deleteOverlapGroupFunc(overlapGroup),
        [deleteOverlapGroupFunc, overlapGroup]
    );

    const onDuplicateGroup = useCallback(
        () => duplicateOverlapGroup({ overlapGroup }),
        [duplicateOverlapGroup, overlapGroup]
    );

    return {
        deleteOverlapGroup,
        deleteRecording,
        handleClose,
        handlePlayEvent,
        onDuplicateGroup,
        resetFocusedEvent,
        setNewTimeout,
        updateOverlapGroupTimes
    };
};

export default useEventHandlers;

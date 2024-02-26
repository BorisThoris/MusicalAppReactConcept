import React, { useCallback } from "react";
import { playEventInstance } from "../../../../fmodLogic/eventInstanceHelpers";
import { useInstrumentRecordingsOperations } from "../../../../hooks/useInstrumentRecordingsOperations";
import usePlayback from "../../../../hooks/usePlayback";

export const useEventHandlers = (targetedGroup, setFocusedEvent, onPressX) => {
  const { deleteRecording, duplicateOverlapGroup, updateOverlapGroupTimes } =
    useInstrumentRecordingsOperations();
  const { setNewTimeout } = usePlayback({ playbackStatus: true });

  const handleClose = useCallback(() => onPressX(false), [onPressX]);
  const handlePlayEvent = useCallback(
    (eventInstance) => playEventInstance(eventInstance),
    [],
  );
  const resetFocusedEvent = useCallback(
    () => setFocusedEvent(-1),
    [setFocusedEvent],
  );
  const deleteOverlapGroup = useCallback(
    () => deleteRecording(targetedGroup, undefined),
    [deleteRecording, targetedGroup],
  );
  const onDuplicateGroup = useCallback(
    () => duplicateOverlapGroup({ overlapGroup: targetedGroup }),
    [duplicateOverlapGroup, targetedGroup],
  );

  return {
    deleteOverlapGroup,
    deleteRecording,
    handleClose,
    handlePlayEvent,
    onDuplicateGroup,
    resetFocusedEvent,
    setNewTimeout,
    updateOverlapGroupTimes,
  };
};

export default useEventHandlers;

import React, { useCallback, useContext, useMemo } from 'react';
import { playEventInstance } from '../../../../fmodLogic/eventInstanceHelpers';
import pixelToSecondRatio from '../../../../globalConstants/pixelToSeconds';
import { useInstrumentRecordingsOperations } from '../../../../hooks/useInstrumentRecordingsOperations';
import { PanelContext, SELECTIONS_PANEL_ID } from '../../../../hooks/usePanelState';
import usePlayback from '../../../../hooks/usePlayback';
import { useSelectionState } from '../../../../hooks/useSelectionState';
import { SelectionContext } from '../../../../providers/SelectionsProvider';
import { TimelineContext } from '../../../../providers/TimelineProvider';
import { CloseIcon, FlexContainer, PlayIcon, TrashIcon } from '../Panel/Panel.styles';
import { PanelWrapper } from '../Panel/PanelWrapper';
import TimeControl from '../Panel/TimeControl';
import { SelectedEventsList } from './SelectedEventsList';

export const SelectionsPanel = () => {
    const { closePanel, panels } = useContext(PanelContext);
    const { timelineState } = useContext(TimelineContext);
    const {
        clearSelection,
        duplicateSelections,
        endTime,
        highestYLevel,
        selectedValues,
        startTime,
        updateSelectedItemsStartTime
    } = useContext(SelectionContext);

    const { deleteRecording } = useInstrumentRecordingsOperations();
    const { setNewTimeout } = usePlayback({ playbackStatus: true });

    const handlePlayEvent = useCallback((eventInstance) => playEventInstance(eventInstance), []);

    const markersAndTrackerOffset = useMemo(() => timelineState.markersAndTrackerOffset, [timelineState]);

    const { unSelectItem } = useSelectionState({ markersAndTrackerOffset });

    const { y } = panels[SELECTIONS_PANEL_ID];
    const startTimeCorrected = selectedValues[0]?.startTime;
    const calculatedYLevel = highestYLevel + timelineState.canvasOffsetY;
    const panelYPosition = y > calculatedYLevel ? y + timelineState.canvasOffsetY : calculatedYLevel;

    const useReplayEvents = useCallback(() => {
        selectedValues.forEach((event) => {
            setNewTimeout(() => playEventInstance(event.eventInstance), event.startTime - startTimeCorrected);
        });
    }, [selectedValues, setNewTimeout, startTimeCorrected]);

    const handleClose = useCallback(() => {
        closePanel(SELECTIONS_PANEL_ID);
        clearSelection();
    }, [clearSelection, closePanel]);

    const onDeleteRecording = useCallback(
        (event) => {
            deleteRecording(event);
            unSelectItem(event);
        },
        [deleteRecording, unSelectItem]
    );

    const onPlayEvent = useCallback(
        (eventInstance) => {
            handlePlayEvent(eventInstance);
        },
        [handlePlayEvent]
    );

    const onTrashClick = useCallback(() => {
        deleteRecording(selectedValues);
    }, [selectedValues, deleteRecording]);

    if (selectedValues.length > 0) {
        return (
            <PanelWrapper x={startTime * pixelToSecondRatio} y={panelYPosition} timelineState={timelineState}>
                <button onClick={duplicateSelections}>DupTest</button>

                <CloseIcon onClick={handleClose}>X</CloseIcon>
                <FlexContainer>
                    <PlayIcon onClick={useReplayEvents}>▶</PlayIcon>
                    <TrashIcon onClick={onTrashClick}>🗑️</TrashIcon>
                </FlexContainer>

                {selectedValues.length > 1 && (
                    <TimeControl
                        endTime={endTime}
                        startTime={startTime}
                        onModifyStartTime={updateSelectedItemsStartTime}
                    />
                )}

                <FlexContainer>
                    <SelectedEventsList
                        selectedValues={selectedValues}
                        onDeleteRecording={onDeleteRecording}
                        onPlayEvent={onPlayEvent}
                        onClose={handleClose}
                    />
                </FlexContainer>
            </PanelWrapper>
        );
    }

    return null;
};

export default SelectionsPanel;

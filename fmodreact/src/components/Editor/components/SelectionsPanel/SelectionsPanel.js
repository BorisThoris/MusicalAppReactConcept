/* eslint-disable react-perf/jsx-no-new-function-as-prop */
import React, { useCallback, useContext, useEffect } from 'react';
import { playEventInstance } from '../../../../fmodLogic/eventInstanceHelpers';
import { PanelContext, SELECTIONS_PANEL_ID } from '../../../../hooks/usePanelState';
import { SelectionContext } from '../../../../providers/SelectionsProvider';
import { TimelineContext } from '../../../../providers/TimelineProvider';
import { EventItem } from '../Panel/EventItem';
import { CloseIcon, FlexContainer, PlayIcon, TrashIcon } from '../Panel/Panel.styles';
import { PanelWrapper } from '../Panel/PanelWrapper';
import { useEventHandlers } from '../Panel/useEventsHandlers';

export const SelectionsPanel = () => {
    const { closePanel } = useContext(PanelContext);
    const { timelineState } = useContext(TimelineContext);
    const { clearSelection, selectedValues } = useContext(SelectionContext);
    const { deleteRecording, handlePlayEvent, setNewTimeout } = useEventHandlers(selectedValues);

    const statTime = selectedValues[0]?.startTime;

    const useReplayEvents = useCallback(
        () =>
            selectedValues.forEach((event) => {
                setNewTimeout(() => playEventInstance(event.eventInstance), event.startTime - statTime);
            }),
        [selectedValues, setNewTimeout, statTime]
    );
    const anySelectedEvents = selectedValues?.length > 0;

    const handleClose = useCallback(() => {
        closePanel(SELECTIONS_PANEL_ID);
        clearSelection();
    }, [clearSelection, closePanel]);

    const renderSelectedEvents = () => {
        return selectedValues.map((event) => (
            <EventItem
                key={event.id}
                event={event}
                // eslint-disable-next-line react-perf/jsx-no-new-function-as-prop
                onDelete={() => deleteRecording(event)}
                // eslint-disable-next-line react-perf/jsx-no-new-function-as-prop
                onPlay={() => handlePlayEvent(event.eventInstance)}
                onClose={handleClose}
            />
        ));
    };

    if (anySelectedEvents) {
        return (
            <PanelWrapper x={0} timelineState={timelineState}>
                <CloseIcon onClick={handleClose}>X</CloseIcon>
                <FlexContainer>
                    <PlayIcon onClick={useReplayEvents}>▶</PlayIcon>
                    <TrashIcon onClick={() => selectedValues.forEach((event) => deleteRecording(event))}>🗑️</TrashIcon>
                </FlexContainer>

                <FlexContainer>{renderSelectedEvents()}</FlexContainer>
            </PanelWrapper>
        );
    }

    return null;
};

export default SelectionsPanel;

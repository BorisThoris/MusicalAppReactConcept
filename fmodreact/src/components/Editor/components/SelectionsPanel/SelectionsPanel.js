import React, { useCallback, useContext, useMemo } from 'react';
import styled from 'styled-components';
import { playEventInstance } from '../../../../fmodLogic/eventInstanceHelpers';
import pixelToSecondRatio from '../../../../globalConstants/pixelToSeconds';
import { PanelContext, SELECTIONS_PANEL_ID } from '../../../../hooks/usePanelState';
import usePlayback from '../../../../hooks/usePlayback';
import { useSelectionState } from '../../../../hooks/useSelectionState';
import { CollisionsContext } from '../../../../providers/CollisionsProvider/CollisionsProvider';
import { SelectionContext } from '../../../../providers/SelectionsProvider';
import { TimelineContext, TimelineHeight, Y_OFFSET } from '../../../../providers/TimelineProvider';
import { CloseIcon, FlexContainer, PlayIcon, TrashIcon } from '../Panel/Panel.styles';
import { PanelWrapper } from '../Panel/PanelWrapper';
import TimeControl from '../Panel/TimeControl';
import { SelectedEventsList } from './SelectedEventsList';

const organizeEventsByParentId = (events) => {
    const eventMap = {};

    events.forEach((event) => {
        if (!eventMap[event.id]) {
            eventMap[event.id] = { ...event, children: [] };
        } else {
            eventMap[event.id] = { ...eventMap[event.id], ...event };
        }

        if (event.parentId) {
            if (!eventMap[event.parentId]) {
                eventMap[event.parentId] = { children: [] };
            }
            eventMap[event.parentId].children.push(eventMap[event.id]);
        }
    });

    return Object.values(eventMap).filter((event) => !event.parentId);
};

const EventsContainer = styled(FlexContainer)`
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    gap: 20px;
`;

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

    const { copyEvents } = useContext(CollisionsContext);
    const { deleteSelections } = useContext(SelectionContext);
    const { setNewTimeout } = usePlayback({ playbackStatus: true });

    const handlePlayEvent = useCallback((eventInstance) => playEventInstance(eventInstance), []);

    const markersAndTrackerOffset = useMemo(() => timelineState.markersAndTrackerOffset, [timelineState]);

    const { unSelectItem } = useSelectionState({ markersAndTrackerOffset });

    const { y } = panels[SELECTIONS_PANEL_ID];
    const startTimeCorrected = selectedValues[0]?.startTime;
    const calculatedYLevel = highestYLevel + timelineState.canvasOffsetY;
    const panelYPosition =
        y > calculatedYLevel
            ? y + timelineState.canvasOffsetY + TimelineHeight * 2
            : calculatedYLevel + TimelineHeight * 1.5;

    const useReplayEvents = useCallback(() => {
        selectedValues.forEach((event) => {
            setNewTimeout(() => playEventInstance(event.eventInstance), event.startTime - startTimeCorrected);
        });
    }, [selectedValues, setNewTimeout, startTimeCorrected]);

    const handleClose = useCallback(() => {
        closePanel(SELECTIONS_PANEL_ID);
        clearSelection();
    }, [clearSelection, closePanel]);

    const onDeleteChildRecording = useCallback(
        (event) => {
            deleteSelections(event);
            unSelectItem(event);
        },
        [deleteSelections, unSelectItem]
    );

    const onPlayEvent = useCallback(
        (eventInstance) => {
            handlePlayEvent(eventInstance);
        },
        [handlePlayEvent]
    );

    const onTrashClick = useCallback(() => {
        deleteSelections(selectedValues);
    }, [selectedValues, deleteSelections]);

    const onCopyClick = useCallback(() => {
        copyEvents(selectedValues);
    }, [selectedValues, copyEvents]);

    if (selectedValues.length > 0) {
        // Sort the selected values by start time
        const sortedSelectedValues = selectedValues.slice().sort((a, b) => a.startTime - b.startTime);
        const organizedEvents = organizeEventsByParentId(sortedSelectedValues);

        return (
            <PanelWrapper x={startTime * pixelToSecondRatio} y={panelYPosition} timelineState={timelineState}>
                <button onClick={duplicateSelections}>DupTest</button>
                <button onClick={onCopyClick}>Copy</button>

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

                <EventsContainer>
                    <SelectedEventsList
                        selectedValues={organizedEvents}
                        onDeleteRecording={onDeleteChildRecording}
                        onPlayEvent={onPlayEvent}
                        onClose={handleClose}
                    />
                </EventsContainer>
            </PanelWrapper>
        );
    }

    return null;
};

export default SelectionsPanel;

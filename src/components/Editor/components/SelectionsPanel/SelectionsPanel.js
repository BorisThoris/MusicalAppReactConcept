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

const EventsContainer = styled(FlexContainer)`
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    gap: 20px;
`;

export const SelectionsPanel = () => {
    const { closePanel } = useContext(PanelContext);
    const { timelineState } = useContext(TimelineContext);
    const { clearSelection, endTime, selectedValues, startTime, updateSelectedItemById } = useContext(SelectionContext);

    const { copyEvents } = useContext(CollisionsContext);
    const { deleteSelections } = useContext(SelectionContext);
    const { setNewTimeout } = usePlayback({ playbackStatus: true });

    const handlePlayEvent = useCallback((eventInstance) => playEventInstance(eventInstance), []);

    const markersAndTrackerOffset = useMemo(() => timelineState.markersAndTrackerOffset, [timelineState]);

    const { unSelectItem } = useSelectionState({ markersAndTrackerOffset });

    const startTimeCorrected = selectedValues[0]?.startTime;

    const useReplayEvents = useCallback(() => {
        selectedValues.forEach((event) => {
            setNewTimeout(() => playEventInstance(event.eventInstance), event.startTime - startTimeCorrected);
        });
    }, [selectedValues, setNewTimeout, startTimeCorrected]);

    const calculatePanelYPosition = () => {
        // Check if selectedValues is available and not empty
        if (!selectedValues || selectedValues.length === 0) {
            return 0; // Default Y position if there are no selected values
        }

        // Extract Y positions directly using Konva's getAbsolutePosition and DOM offset
        const parsedElements = selectedValues.map((item) => {
            const { element } = item;
            const elementAbsolutePos = element?.getAbsolutePosition() || { x: 0, y: 0 };

            // Get the Konva stage container's DOM offset in the page
            const stageContainer = element.getStage().container();
            const containerRect = stageContainer.getBoundingClientRect();

            // Calculate global Y position
            const globalYPosition = containerRect.top + elementAbsolutePos.y;

            return {
                ...item,
                konvaElement: element,
                yPosition: globalYPosition
            };
        });

        // Sort parsed elements by Y position
        const sortedByYPosition = parsedElements.sort((a, b) => a.yPosition - b.yPosition);
        const lastElementYPosition = sortedByYPosition[sortedByYPosition.length - 1]?.yPosition || 0;

        const panelYPosition = lastElementYPosition + Y_OFFSET + TimelineHeight;

        return panelYPosition;
    };

    // Example usage
    const panelYPosition = calculatePanelYPosition();

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
        copyEvents(Object.values(selectedValues));
    }, [selectedValues, copyEvents]);

    const onModifyStartTime = useCallback(
        ({ delta, id }) => {
            if (selectedValues && typeof selectedValues === 'object') {
                const updatedValues = { ...selectedValues };

                Object.entries(updatedValues).forEach(([key, { element }]) => {
                    const oldRecording = element.attrs['data-recording'];

                    if (id && oldRecording.id !== id) {
                        return;
                    }

                    if (element) {
                        element.move({ x: delta * pixelToSecondRatio, y: 0 });

                        const newRecording = {
                            ...oldRecording,
                            endTime: oldRecording.endTime + delta,
                            startTime: oldRecording.startTime + delta
                        };

                        element.setAttr('data-recording', newRecording);

                        updateSelectedItemById(oldRecording.id, {
                            endTime: newRecording.endTime,
                            startTime: newRecording.startTime
                        });

                        const layer = element.getLayer();
                        if (layer) {
                            layer.draw();
                        }
                    }
                });
            }
        },
        [selectedValues, updateSelectedItemById]
    );

    if (selectedValues.length > 0) {
        return (
            <PanelWrapper x={startTime * pixelToSecondRatio} y={panelYPosition} timelineState={timelineState}>
                <button onClick={onCopyClick}>Copy</button>
                <CloseIcon onClick={handleClose}>X</CloseIcon>
                <FlexContainer>
                    <PlayIcon onClick={useReplayEvents}>▶</PlayIcon>
                    <TrashIcon onClick={onTrashClick}>🗑️</TrashIcon>
                </FlexContainer>

                <TimeControl endTime={endTime} startTime={startTime} onModifyStartTime={onModifyStartTime} />

                <EventsContainer>
                    <SelectedEventsList
                        selectedValues={selectedValues}
                        onDeleteRecording={onDeleteChildRecording}
                        onPlayEvent={onPlayEvent}
                        onClose={handleClose}
                        onModifyStartTime={onModifyStartTime}
                    />
                </EventsContainer>
            </PanelWrapper>
        );
    }

    return null;
};

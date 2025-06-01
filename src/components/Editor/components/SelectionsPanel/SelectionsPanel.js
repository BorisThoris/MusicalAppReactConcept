import React, { useCallback, useContext } from 'react';
import styled from 'styled-components';
import { playEventInstance } from '../../../../fmodLogic/eventInstanceHelpers';
import { PanelContext, SELECTIONS_PANEL_ID } from '../../../../hooks/usePanelState';
import usePlayback from '../../../../hooks/usePlayback';
import { CollisionsContext } from '../../../../providers/CollisionsProvider/CollisionsProvider';
import { usePixelRatio } from '../../../../providers/PixelRatioProvider/PixelRatioProvider';
import { SelectionContext } from '../../../../providers/SelectionsProvider';
import { TimelineContext, TimelineHeight, Y_OFFSET } from '../../../../providers/TimelineProvider';
import { CloseIcon, FlexContainer, PlayIcon, TrashIcon } from '../Panel/Panel.styles';
import { PanelWrapper } from '../Panel/PanelWrapper';
import { getElementsToModify, updateElementStartTime } from '../Panel/recordingHelpers';
import TimeControl from '../Panel/TimeControl';
import { SelectedEventsList } from './SelectedEventsList';

const EventsContainer = styled(FlexContainer)`
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    gap: 20px;
`;

export const SelectionsPanel = () => {
    const pixelToSecondRatio = usePixelRatio();
    const { closePanel } = useContext(PanelContext);
    const { timelineState } = useContext(TimelineContext);
    const { clearSelection, deleteSelections, endTime, selectedValues, startTime } = useContext(SelectionContext);

    const { copyEvents, stageRef } = useContext(CollisionsContext);

    const { setNewTimeout } = usePlayback({ playbackStatus: true });

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
            const stageContainer = stageRef.container();
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

    const onTrashClick = useCallback(() => {
        deleteSelections(selectedValues);
    }, [selectedValues, deleteSelections]);

    const onCopyClick = useCallback(() => {
        copyEvents(Object.values(selectedValues));
    }, [selectedValues, copyEvents]);

    const handleModifyStartTime = useCallback(
        ({ delta, id: filterId }) => {
            // 1) collect every element (flat) we might need to shift
            const allEls = getElementsToModify({ pixelToSecondRatio, selectedValues });

            // 2) if an id filter was passed, drop the rest
            const toShift = allEls.filter((el) => {
                if (!filterId) return true;
                const rec = el.attrs['data-recording'];
                return rec?.id === filterId;
            });

            // 3) shift each one
            toShift.forEach((el) => updateElementStartTime({ delta, element: el, pixelToSecondRatio }));
        },
        [pixelToSecondRatio, selectedValues]
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

                <TimeControl endTime={endTime} startTime={startTime} onModifyStartTime={handleModifyStartTime} />

                <EventsContainer>
                    <SelectedEventsList selectedValues={selectedValues} />
                </EventsContainer>
            </PanelWrapper>
        );
    }

    return null;
};

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

const GroupControls = styled.div`
    border: 1px solid #ccc;
    padding: 1px;
    margin: 1px 0;
    border-radius: 8px;
    background-color: #f8f8f8;
`;

const GroupControlsLabel = styled.div`
    font-weight: bold;
    font-size: 15px;
`;

export const SelectionsPanel = () => {
    const pixelToSecondRatio = usePixelRatio();
    const { closePanel } = useContext(PanelContext);
    const { timelineState } = useContext(TimelineContext);
    const { clearSelection, deleteSelections, endTime, selectedValues, startTime } = useContext(SelectionContext);

    const { copyEvents, stageRef } = useContext(CollisionsContext);
    const { setNewTimeout } = usePlayback({ playbackStatus: true });

    const hasGroupSelection = selectedValues.length > 1;
    const startTimeCorrected = selectedValues[0]?.startTime;

    const useReplayEvents = useCallback(() => {
        selectedValues.forEach((event) => {
            setNewTimeout(() => playEventInstance(event.eventInstance), event.startTime - startTimeCorrected);
        });
    }, [selectedValues, setNewTimeout, startTimeCorrected]);

    const calculatePanelYPosition = () => {
        if (!selectedValues || selectedValues.length === 0) return 0;

        const parsedElements = selectedValues.map((item) => {
            const { element } = item;
            const elementAbsolutePos = element?.getAbsolutePosition() || { x: 0, y: 0 };

            const stageContainer = stageRef.container();
            const containerRect = stageContainer.getBoundingClientRect();
            const globalYPosition = containerRect.top + elementAbsolutePos.y;

            return {
                ...item,
                konvaElement: element,
                yPosition: globalYPosition
            };
        });

        const sortedByYPosition = parsedElements.sort((a, b) => a.yPosition - b.yPosition);
        const lastElementYPosition = sortedByYPosition[sortedByYPosition.length - 1]?.yPosition || 0;

        return lastElementYPosition + Y_OFFSET + TimelineHeight;
    };

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
            const allEls = getElementsToModify({ pixelToSecondRatio, selectedValues });
            const toShift = allEls.filter((el) => {
                if (!filterId) return true;
                const rec = el.attrs['data-recording'];
                return rec?.id === filterId;
            });

            toShift.forEach((el) => updateElementStartTime({ delta, element: el, pixelToSecondRatio }));
        },
        [pixelToSecondRatio, selectedValues]
    );

    if (selectedValues.length > 0) {
        return (
            <PanelWrapper x={startTime * pixelToSecondRatio} y={panelYPosition} timelineState={timelineState}>
                <button onClick={onCopyClick}>Copy</button>
                <CloseIcon onClick={handleClose}>X</CloseIcon>

                {hasGroupSelection && (
                    <GroupControls>
                        <GroupControlsLabel>Selections Controls</GroupControlsLabel>
                        <FlexContainer>
                            <PlayIcon onClick={useReplayEvents}>▶</PlayIcon>
                            <TrashIcon onClick={onTrashClick}>🗑️</TrashIcon>
                        </FlexContainer>
                        <TimeControl
                            endTime={endTime}
                            startTime={startTime}
                            onModifyStartTime={handleModifyStartTime}
                        />
                    </GroupControls>
                )}

                <EventsContainer>
                    <SelectedEventsList selectedValues={selectedValues} />
                </EventsContainer>
            </PanelWrapper>
        );
    }

    return null;
};

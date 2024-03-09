import React, { useCallback, useContext } from 'react';
import { playEventInstance } from '../../../../fmodLogic/eventInstanceHelpers';
import pixelToSecondRatio from '../../../../globalConstants/pixelToSeconds';
import { PanelContext, PARAMS_PANEL_ID } from '../../../../hooks/usePanelState';
import { InstrumentRecordingsContext } from '../../../../providers/InstrumentsProvider';
import { TimelineContext } from '../../../../providers/TimelineProvider';
import { EventItem } from '../Panel/EventItem';
import { CloseIcon, DuplicateIcon, FlexContainer, PlayIcon, TrashIcon } from '../Panel/Panel.styles';
import { PanelWrapper } from '../Panel/PanelWrapper';
import TimeControl from '../Panel/TimeControl';
import { useEventHandlers } from '../Panel/useEventsHandlers';

export const ParamsPanel = () => {
    const { recordings } = useContext(InstrumentRecordingsContext);
    const { timelineState } = useContext(TimelineContext);

    const { closeParamsPanel: closePanel, focusedEvent, panelsObj, setFocusedEvent } = useContext(PanelContext);
    const {
        index: targetIndex,
        instrumentName: targetInstrumentGroup,
        overlapGroup,
        y
    } = panelsObj[`${PARAMS_PANEL_ID}`];

    const targetInRecordings = recordings[targetInstrumentGroup][targetIndex];
    const { endTime, id, startTime: groupStartTime, startTime } = targetInRecordings || {};
    const targetEvents = targetInRecordings?.events;

    const {
        deleteOverlapGroup,
        deleteRecording,
        handleClose,
        handlePlayEvent,
        onDuplicateGroup,
        setNewTimeout,
        updateOverlapGroupTimes
    } = useEventHandlers(overlapGroup, setFocusedEvent, closePanel);

    const useReplayEvents = useCallback(
        () =>
            targetEvents.forEach((event) => {
                setNewTimeout(() => playEventInstance(event.eventInstance), event.startTime - groupStartTime);
            }),
        [groupStartTime, setNewTimeout, targetEvents]
    );

    const modifyGroupStartTime = useCallback(
        (delta) => {
            updateOverlapGroupTimes({
                groupId: id,
                newStartTime: startTime + delta
            });
        },
        [id, startTime, updateOverlapGroupTimes]
    );

    const renderEvents = () =>
        targetEvents?.map((event) => {
            // eslint-disable-next-line react-perf/jsx-no-new-function-as-prop
            const onDelteNote = () => deleteRecording(event, targetInRecordings);

            return (
                <EventItem
                    key={event.id}
                    overlapGroup={targetInRecordings}
                    event={event}
                    onDelete={onDelteNote}
                    setFocusedEvent={setFocusedEvent}
                    focusedEvent={focusedEvent}
                    onPlay={handlePlayEvent}
                    onClose={handleClose}
                />
            );
        });

    if (targetInRecordings)
        return (
            <PanelWrapper x={targetInRecordings.startTime * pixelToSecondRatio} y={y} timelineState={timelineState}>
                <span>Group:</span>
                <CloseIcon onClick={handleClose}>X</CloseIcon>

                {targetEvents?.length > 1 && (
                    <>
                        <FlexContainer>
                            <PlayIcon onClick={useReplayEvents}>▶</PlayIcon>
                            <TrashIcon onClick={deleteOverlapGroup}>🗑️</TrashIcon>
                            <DuplicateIcon onClick={onDuplicateGroup}>Dup</DuplicateIcon>
                        </FlexContainer>

                        <TimeControl endTime={endTime} startTime={startTime} onModifyStartTime={modifyGroupStartTime} />

                        <span>{targetEvents.length} Events:</span>
                    </>
                )}

                <FlexContainer>{renderEvents()}</FlexContainer>
            </PanelWrapper>
        );
    return null;
};

export default ParamsPanel;

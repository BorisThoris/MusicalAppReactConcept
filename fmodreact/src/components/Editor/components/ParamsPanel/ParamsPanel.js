import React, { useCallback, useContext, useEffect } from 'react';
import { playEventInstance } from '../../../../fmodLogic/eventInstanceHelpers';
import pixelToSecondRatio from '../../../../globalConstants/pixelToSeconds';
import { useInstrumentRecordingsOperations } from '../../../../hooks/useInstrumentRecordingsOperations';
import { PanelContext, PARAMS_PANEL_ID } from '../../../../hooks/usePanelState';
import { TimelineContext } from '../../../../providers/TimelineProvider';
import { EventItem } from '../Panel/EventItem';
import { CloseIcon, DuplicateIcon, FlexContainer, PlayIcon, TrashIcon } from '../Panel/Panel.styles';
import { PanelWrapper } from '../Panel/PanelWrapper';
import TimeControl from '../Panel/TimeControl';
import { useEventHandlers } from '../Panel/useEventsHandlers';

export const ParamsPanel = () => {
    const { timelineState } = useContext(TimelineContext);
    const { panelsObj } = useContext(PanelContext);
    const { getEventById } = useInstrumentRecordingsOperations();

    const { overlapGroup, y } = panelsObj[`${PARAMS_PANEL_ID}`];
    const foundGroup = getEventById(overlapGroup.id);

    const targetInRecordings = foundGroup;

    const { endTime, id, startTime: groupStartTime, startTime } = targetInRecordings || {};

    const {
        deleteOverlapGroup,
        deleteRecording,
        handleClose,
        handlePlayEvent,
        onDuplicateGroup,
        setNewTimeout,
        updateOverlapGroupTimes
    } = useEventHandlers({ overlapGroup });

    const targetEvents = targetInRecordings?.events;
    const targetEventsLength = Object.keys(targetEvents || {}).length;

    const hasAnyEvents = targetEventsLength >= 1;
    const hasMoreThanOneEvent = targetEventsLength > 1;

    useEffect(() => {
        if (!hasAnyEvents) {
            handleClose();
        }
    }, [handleClose, hasAnyEvents, targetEvents]);

    const useReplayEvents = useCallback(() => {
        const eventsArray = Array.isArray(targetEvents) ? targetEvents : Object.values(targetEvents || {});
        eventsArray.forEach((event) => {
            setNewTimeout(() => playEventInstance(event.eventInstance), event.startTime - groupStartTime);
        });
    }, [groupStartTime, setNewTimeout, targetEvents]);

    const modifyGroupStartTime = useCallback(
        (delta) => {
            updateOverlapGroupTimes({
                groupId: id,
                newStartTime: startTime + delta
            });
        },
        [id, startTime, updateOverlapGroupTimes]
    );

    const renderEvents = () => {
        // Ensure targetEvents is treated as an array, converting if it's an object
        const eventsArray = Array.isArray(targetEvents) ? targetEvents : Object.values(targetEvents || {});

        return eventsArray.map((event) => {
            // Function for deleting an event; defined inside map to access current event
            // eslint-disable-next-line react-perf/jsx-no-new-function-as-prop
            const onDeleteNote = () => deleteRecording(event);

            return (
                <EventItem
                    key={event.id}
                    overlapGroup={targetInRecordings}
                    event={event}
                    onDelete={onDeleteNote}
                    onPlay={handlePlayEvent}
                />
            );
        });
    };

    if (targetInRecordings)
        return (
            <PanelWrapper x={targetInRecordings.startTime * pixelToSecondRatio} y={y} timelineState={timelineState}>
                <span>Group:</span>
                <CloseIcon onClick={handleClose}>X</CloseIcon>

                {hasMoreThanOneEvent && (
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

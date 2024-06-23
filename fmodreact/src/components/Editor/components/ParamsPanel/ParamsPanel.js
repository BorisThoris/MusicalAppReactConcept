import React, { useCallback, useContext, useEffect, useMemo } from 'react';
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const targetInRecordings = foundGroup || {};
    const { endTime, id, startTime: groupStartTime, startTime } = targetInRecordings;
    const {
        deleteOverlapGroup,
        deleteRecording,
        handleClose,
        handlePlayEvent,
        onDuplicateGroup,
        setNewTimeout,
        updateOverlapGroupTimes
    } = useEventHandlers(overlapGroup);
    const hasParent = !!targetInRecordings.parentId;

    const targetEvents = useMemo(() => {
        if (!hasParent) {
            if (targetInRecordings.locked) {
                return targetInRecordings.events;
            }
            return { [targetInRecordings.id]: targetInRecordings.events[targetInRecordings.id] };
        }
        return { [foundGroup.id]: { ...foundGroup } };
    }, [hasParent, targetInRecordings, foundGroup]);

    const targetEventsLength = Object.keys(targetEvents || {}).length;
    const hasAnyEvents = targetEventsLength >= 1;
    const hasMoreThanOneEvent = targetEventsLength > 1;

    useEffect(() => {
        if (!hasParent && !hasAnyEvents) {
            handleClose();
        }
    }, [handleClose, hasAnyEvents, hasParent]);

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
        const eventsArray = Array.isArray(targetEvents) ? targetEvents : Object.values(targetEvents || {});
        return eventsArray.map((event) => (
            <EventItem
                key={event.id}
                overlapGroup={targetInRecordings}
                event={event}
                // eslint-disable-next-line react-perf/jsx-no-new-function-as-prop
                onDelete={() => deleteRecording(event)}
                onPlay={handlePlayEvent}
            />
        ));
    };

    if (!targetInRecordings) return null;

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
};

export default ParamsPanel;

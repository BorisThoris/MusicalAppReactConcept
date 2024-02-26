import PropTypes from 'prop-types'
import React, { useCallback, useContext } from 'react'
import { playEventInstance } from '../../../../fmodLogic/eventInstanceHelpers'
import pixelToSecondRatio from '../../../../globalConstants/pixelToSeconds'
import { TimelineContext } from '../../../../providers/TimelineProvider'
import EventItemComponent from './EventItem'
import {
  CloseIcon,
  DuplicateIcon,
  FlexContainer,
  PanelContainer,
  PlayIcon,
  TrashIcon,
} from './Panel.styles'
import TimeControl from './TimeControl'
import { useEventHandlers } from './useEventsHandlers'

export const Panel = ({
  focusedEvent,
  onPressX,
  panelState,
  recordings,
  setFocusedEvent,
  updateStartTime,
  x,
  y,
}) => {
  const { timelineState } = useContext(TimelineContext)
  const { index: targetIndex, instrumentName: targetInstrumentGroup } =
    panelState

  const targetInRecordings = recordings[targetInstrumentGroup][targetIndex]
  const {
    endTime,
    id,
    startTime: groupStartTime,
    startTime,
  } = targetInRecordings || {}
  const targetEvents = targetInRecordings?.events

  const {
    deleteOverlapGroup,
    deleteRecording,
    handleClose,
    handlePlayEvent,
    onDuplicateGroup,
    resetFocusedEvent,
    setNewTimeout,
    updateOverlapGroupTimes,
  } = useEventHandlers(panelState.overlapGroup, setFocusedEvent, onPressX)

  const useReplayEvents = useCallback(
    () =>
      targetEvents.forEach(event => {
        setNewTimeout(
          () => playEventInstance(event.eventInstance),
          event.startTime - groupStartTime,
        )
      }),
    [groupStartTime, setNewTimeout, targetEvents],
  )

  const modifyGroupStartTime = useCallback(
    delta => {
      updateOverlapGroupTimes({
        groupId: id,
        newStartTime: startTime + delta,
      })
    },
    [id, startTime, updateOverlapGroupTimes],
  )

  const renderEvents = () =>
    targetEvents?.map(event => {
      // eslint-disable-next-line react-perf/jsx-no-new-function-as-prop
      const onDelteNote = () => deleteRecording(event, targetInRecordings)

      return (
        <EventItemComponent
          key={event.id}
          overlapGroup={targetInRecordings}
          event={event}
          onDelete={onDelteNote}
          setFocusedEvent={setFocusedEvent}
          focusedEvent={focusedEvent}
          onPlay={handlePlayEvent}
          onClose={handleClose}
          updateStartTime={updateStartTime}
        />
      )
    })

  if (targetInRecordings)
    return (
      <PanelContainer
        onMouseLeave={resetFocusedEvent}
        x={targetInRecordings.startTime * pixelToSecondRatio}
        y={y}
        timelineState={timelineState}
      >
        <span>Group:</span>
        <CloseIcon onClick={handleClose}>X</CloseIcon>

        {targetEvents?.length > 1 && (
          <>
            <FlexContainer>
              <>
                <PlayIcon onClick={useReplayEvents}>▶</PlayIcon>
                <TrashIcon onClick={deleteOverlapGroup}>🗑️</TrashIcon>
                <DuplicateIcon onClick={onDuplicateGroup}>Dup</DuplicateIcon>
              </>
            </FlexContainer>

            <TimeControl
              endTime={endTime}
              startTime={startTime}
              onModifyStartTime={modifyGroupStartTime}
            />

            <span>{targetEvents.length} Events:</span>
          </>
        )}

        <FlexContainer>{renderEvents()}</FlexContainer>
      </PanelContainer>
    )
  return null
}

Panel.propTypes = {
  focusedEvent: PropTypes.number,
  onPressX: PropTypes.func.isRequired,
  setFocusedEvent: PropTypes.func.isRequired,
  targetedGroup: PropTypes.shape({
    endTime: PropTypes.number,
    id: PropTypes.any.isRequired,
    startTime: PropTypes.number.isRequired,
  }),
  targetEvents: PropTypes.arrayOf(
    PropTypes.shape({
      endTime: PropTypes.number.isRequired,
      eventInstance: PropTypes.object.isRequired,
      id: PropTypes.any.isRequired,
      startTime: PropTypes.number.isRequired,
    }),
  ).isRequired,
  updateStartTime: PropTypes.func.isRequired,
  x: PropTypes.number,
  y: PropTypes.number,
}

Panel.defaultProps = {
  focusedEvent: null,
  targetedGroup: null,
  x: undefined,
  y: undefined,
}

export default Panel

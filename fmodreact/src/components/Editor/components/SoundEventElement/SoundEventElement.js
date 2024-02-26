import isEqual from 'lodash/isEqual'
import PropTypes from 'prop-types'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Group, Rect, Text } from 'react-konva'
import { playEventInstance } from '../../../../fmodLogic/eventInstanceHelpers'
import pixelToSecondRatio from '../../../../globalConstants/pixelToSeconds'
import { useInstrumentRecordingsOperations } from '../../../../hooks/useInstrumentRecordingsOperations'

const CONSTANTS = {
  CORNER_RADIUS: 5,
  GRADIENT_END: { x: 100, y: 0 },
  GRADIENT_START: { x: 0, y: 0 },
  LOCK_OFFSET_Y: -10,
  SHADOW: { BLUR: 5, OFFSET: { x: 8, y: 5 }, OPACITY: 0.5 },
  STROKE_WIDTH: 2,
  TEXT_FONT_SIZE: 18,
  TEXT_STYLE: {
    fill: 'black',
    fontSize: 15,
    x: 5,
    y: 15,
  },
  TRANSPARENCY_VALUE: 0.8,
}

const getDynamicStroke = (isTargeted, isFocused) => {
  if (isTargeted) return 'blue'
  if (isFocused) return 'green'
  return 'red'
}

const getDynamicShadowBlur = isFocused =>
  isFocused ? 10 : CONSTANTS.SHADOW.BLUR

const getDynamicColorStops = isOverlapping =>
  isOverlapping ? [0, 'red', 1, 'yellow'] : [1, 'red']

const SoundEventElement = React.memo(
  ({
    canvasOffsetY,
    index,
    isFocused,
    isOverlapping,
    isTargeted,
    openPanel,
    parent,
    recording,
    setFocusedEvent,
    timelineHeight,
    timelineY,
    updateStartTime,
  }) => {
    const {
      eventInstance,
      eventLength,
      id,
      instrumentName,
      locked,
      name,
      startTime,
    } = recording

    const { lockOverlapGroupById } = useInstrumentRecordingsOperations()

    const startingPositionInTimeline = startTime * pixelToSecondRatio
    const lengthBasedWidth = eventLength * pixelToSecondRatio
    const groupRef = useRef()
    const elementRef = useRef()

    const [originalZIndex, setOriginalZIndex] = useState(0)

    const dynamicStroke = getDynamicStroke(isTargeted, isFocused)
    const dynamicShadowBlur = getDynamicShadowBlur(isFocused)
    const dynamicColorStops = getDynamicColorStops(isOverlapping)

    useEffect(() => {
      if (groupRef.current) {
        setOriginalZIndex(groupRef.current.zIndex())
      }
    }, [])

    const restoreZIndex = useCallback(() => {
      groupRef.current.setZIndex(originalZIndex)
      setFocusedEvent(-1)
    }, [originalZIndex, setFocusedEvent])

    useEffect(() => {
      if (isFocused && groupRef.current) {
        groupRef.current.moveToTop()
      }
    }, [isFocused, originalZIndex, restoreZIndex])

    const handleDragEnd = useCallback(
      e => {
        const newStartTime = e.target.x() / pixelToSecondRatio

        updateStartTime({
          eventLength,
          index: id,
          instrumentName,
          newStartTime,
          parent,
        })
      },
      [eventLength, id, instrumentName, parent, updateStartTime],
    )

    const dragBoundFunc = useCallback(
      pos => ({
        x: pos.x - 60 > 0 ? pos.x : 60,
        y: timelineY,
      }),
      [timelineY],
    )

    const handleClick = useCallback(() => {
      if (openPanel && !parent) {
        const groupX = startingPositionInTimeline
        let groupY = timelineY + canvasOffsetY

        groupY += elementRef.current.attrs.height

        openPanel({ index, instrumentName, x: groupX, y: groupY })
      }
    }, [
      openPanel,
      parent,
      startingPositionInTimeline,
      timelineY,
      canvasOffsetY,
      index,
      instrumentName,
    ])

    const handleDoubleClick = useCallback(
      () => playEventInstance(eventInstance),
      [eventInstance],
    )
    const handleDragStart = useCallback(el => el.target.moveToTop(), [])
    const handleMouseEnter = useCallback(
      () => setFocusedEvent(id),
      [id, setFocusedEvent],
    )

    const onLockSoundEventElement = useCallback(() => {
      lockOverlapGroupById({ groupId: id })
    }, [id, lockOverlapGroupById])

    return (
      <Group
        ref={groupRef}
        key={index}
        x={startingPositionInTimeline}
        draggable={!parent?.locked}
        dragBoundFunc={dragBoundFunc}
        onDragEnd={handleDragEnd}
        onClick={handleClick}
        onDblClick={handleDoubleClick}
        onDragStart={handleDragStart}
      >
        <Rect
          onMouseEnter={handleMouseEnter}
          onMouseLeave={restoreZIndex}
          ref={elementRef}
          x={0}
          y={isFocused ? -4 : 0}
          width={lengthBasedWidth}
          height={timelineHeight * 0.8}
          fillLinearGradientStartPoint={CONSTANTS.GRADIENT_START}
          fillLinearGradientEndPoint={CONSTANTS.GRADIENT_END}
          fillLinearGradientColorStops={dynamicColorStops}
          stroke={dynamicStroke}
          strokeWidth={CONSTANTS.STROKE_WIDTH}
          cornerRadius={CONSTANTS.CORNER_RADIUS}
          shadowOffset={CONSTANTS.SHADOW.OFFSET}
          shadowBlur={dynamicShadowBlur}
          shadowOpacity={CONSTANTS.SHADOW.OPACITY}
          opacity={CONSTANTS.TRANSPARENCY_VALUE}
        />
        <Text
          {...CONSTANTS.TEXT_STYLE}
          text={name}
          opacity={CONSTANTS.TRANSPARENCY_VALUE}
        />

        {!parent && (
          <Text
            onClick={onLockSoundEventElement}
            x={-10}
            y={CONSTANTS.LOCK_OFFSET_Y}
            text={locked ? '🔒' : '✔️'}
            fontSize={CONSTANTS.TEXT_FONT_SIZE}
            fill='white'
          />
        )}
      </Group>
    )
  },
  isEqual,
)

SoundEventElement.propTypes = {
  canvasOffsetY: PropTypes.number.isRequired,
  index: PropTypes.number.isRequired,
  isFocused: PropTypes.bool,
  isOverlapping: PropTypes.bool,
  isTargeted: PropTypes.bool,
  openPanel: PropTypes.func,
  parent: PropTypes.object,
  recording: PropTypes.shape({
    eventInstance: PropTypes.object.isRequired,
    eventLength: PropTypes.number.isRequired,
    id: PropTypes.number.isRequired,
    instrumentName: PropTypes.string.isRequired,
    locked: PropTypes.bool,
    name: PropTypes.string.isRequired,
    startTime: PropTypes.number.isRequired,
  }).isRequired,
  setFocusedEvent: PropTypes.func.isRequired,
  timelineHeight: PropTypes.number.isRequired,
  timelineY: PropTypes.number.isRequired,
  updateStartTime: PropTypes.func.isRequired,
}

SoundEventElement.defaultProps = {
  isFocused: false,
  isOverlapping: false,
  isTargeted: false,
  openPanel: null,
}

export default SoundEventElement

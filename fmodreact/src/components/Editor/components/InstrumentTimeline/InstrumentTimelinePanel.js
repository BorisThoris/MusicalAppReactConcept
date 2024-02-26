import PropTypes from 'prop-types'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Group, Text } from 'react-konva/'
import { useInstrumentRecordingsOperations } from '../../../../hooks/useInstrumentRecordingsOperations'

const InstrumentTimelinePanel = ({
  deleteAllRecordingsForInstrument,
  groupName,
  isLocked,
  replayInstrumentRecordings,
  toggleLocked,
  toggleMute,
}) => {
  const { duplicateInstrument } = useInstrumentRecordingsOperations()

  const onPlay = useCallback(() => {
    replayInstrumentRecordings(groupName)
  }, [groupName, replayInstrumentRecordings])

  const onDelete = useCallback(() => {
    deleteAllRecordingsForInstrument(groupName)
  }, [deleteAllRecordingsForInstrument, groupName])

  const onMute = useCallback(() => {
    toggleMute(groupName)
  }, [groupName, toggleMute])

  const onCopy = useCallback(() => {
    duplicateInstrument({ instrumentName: groupName })
  }, [duplicateInstrument, groupName])

  const icons = [
    { callback: onPlay, icon: '▶' },
    { callback: onDelete, icon: '🗑️' },
    { callback: onMute, icon: '🔇' },
    { callback: toggleLocked, icon: isLocked ? '🔒' : '🔓' },
    { callback: onCopy, icon: '📄' },
  ]

  const [widths, setWidths] = useState(Array(icons.length).fill(0))
  const [heights, setHeights] = useState(Array(icons.length).fill(0))
  const textRefs = useRef(icons.map(() => React.createRef()))

  useEffect(() => {
    const newWidths = textRefs.current.map(ref =>
      ref.current ? ref.current.getTextWidth() : 0,
    )
    const newHeights = textRefs.current.map(ref =>
      ref.current ? ref.current.textHeight : 0,
    )
    setWidths(newWidths)
    setHeights(newHeights)
  }, [textRefs])

  let parentWidth = 0
  if (textRefs.current[0] && textRefs.current[0].current) {
    const { parent } = textRefs.current[0].current
    if (parent) {
      parentWidth = 25
    }
  }

  let accumulatedHeight = groupName ? 20 : 0
  const yPositions = heights.map(h => {
    const yPos = accumulatedHeight
    accumulatedHeight += h + 2
    return yPos
  })

  const groupScale = useMemo(() => {
    return { x: 2, y: 2 }
  }, [])

  const x = useCallback(
    index => {
      return parentWidth ? (parentWidth - widths[index]) / 2 : 0
    },
    [parentWidth, widths],
  )

  return (
    <Group scale={groupScale}>
      {icons.map((icon, index) => {
        const onClick = icon.callback

        return (
          <Text
            key={icon.icon}
            text={icon.icon}
            x={x(index)}
            y={yPositions[index]}
            ref={textRefs.current[index]}
            onClick={onClick}
          />
        )
      })}
    </Group>
  )
}

InstrumentTimelinePanel.propTypes = {
  deleteAllRecordingsForInstrument: PropTypes.func.isRequired,
  groupName: PropTypes.string,
  replayInstrumentRecordings: PropTypes.func.isRequired,
  timelineHeight: PropTypes.number,
}

export default InstrumentTimelinePanel

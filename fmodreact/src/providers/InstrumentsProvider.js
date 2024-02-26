/* eslint-disable no-restricted-syntax */
import cloneDeep from 'lodash/cloneDeep'
import first from 'lodash/first'
import last from 'lodash/last'
import PropTypes from 'prop-types'
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { createEventInstance } from '../fmodLogic/eventInstanceHelpers'
import createSound from '../globalHelpers/createSound'
import useOverlapCalculator from '../hooks/useOverlapCalculator/useOverlapCalculator'

export const InstrumentRecordingsContext = createContext()

export const useInstrumentRecordings = () =>
  useContext(InstrumentRecordingsContext)

export const InstrumentRecordingsProvider = React.memo(({ children }) => {
  const [overlapGroups, setOverlapGroups] = useState({})
  const prevOverlapGroupsRef = useRef({})

  const [localLoaded, setLocalLoaded] = useState(false)

  const { calculateOverlapsForAllInstruments } = useOverlapCalculator(
    overlapGroups,
    overlapGroups,
  )

  useEffect(() => {
    const newOverlapGroups = calculateOverlapsForAllInstruments()

    const isOverlapGroupsChanged =
      JSON.stringify(newOverlapGroups) !==
      JSON.stringify(prevOverlapGroupsRef.current)

    function findDifferences(obj1, obj2, parentKey = '') {
      if (obj1 === obj2) return

      if (
        typeof obj1 !== 'object' ||
        typeof obj2 !== 'object' ||
        obj1 == null ||
        obj2 == null
      ) {
        console.log(`Difference at ${parentKey}:`, obj1, obj2)
        return
      }

      const allKeys = new Set([...Object.keys(obj1), ...Object.keys(obj2)])
      for (const key of allKeys) {
        const newKey = parentKey ? `${parentKey}.${key}` : key
        findDifferences(obj1[key], obj2[key], newKey)
      }
    }

    if (isOverlapGroupsChanged) {
      setOverlapGroups(newOverlapGroups)
      prevOverlapGroupsRef.current = cloneDeep(newOverlapGroups)
    }
  }, [calculateOverlapsForAllInstruments])

  useEffect(() => {
    const savedOverlapGroups = JSON.parse(localStorage.getItem('overlapGroups'))

    if (savedOverlapGroups) {
      try {
        const parsedOverlapGroups = savedOverlapGroups
        setOverlapGroups(parsedOverlapGroups)
      } catch (e) {
        alert('Failed to parse overlapGroups from localStorage', e)
      }
    }
  }, [])

  const recreateEvents = useCallback(() => {
    if (overlapGroups) {
      const parsedRecordings = overlapGroups
      const newRecordings = {}

      Object.keys(parsedRecordings).forEach(instrumentName => {
        newRecordings[instrumentName] = parsedRecordings[instrumentName].map(
          recording => {
            // Create main event
            const eventInstance = createEventInstance(
              recording.eventPath || 'Drum/Snare',
            )
            const mainEvent = createSound({
              eventInstance,
              eventPath: recording.eventPath || 'Drum/Snare',
              instrumentName,
              passedParams: recording.params,
              startTime: recording.startTime,
            })

            const group = {
              ...mainEvent,
              endTime: mainEvent.endTime,
              eventLength: mainEvent.eventLength,
              id: `${mainEvent.id}`,
              instrumentName: mainEvent.instrumentName,
              length: mainEvent.eventLength,
              locked: recording.locked,
              startTime: mainEvent.startTime,
            }

            // Recreate each event in the events property
            const recreatedEvents = recording.events
              ? recording.events.map(subEvent => {
                  // Create an event instance for each subEvent
                  const subEventInstance = createEventInstance(
                    subEvent.eventPath || 'Drum/Snare',
                  )

                  // Recreate the event
                  return createSound({
                    eventInstance: subEventInstance,
                    eventPath: subEvent.eventPath || 'Drum/Snare',
                    instrumentName,
                    passedParams: subEvent.params,
                    startTime: subEvent.startTime,
                  })
                })
              : []

            group.events = recreatedEvents

            group.endTime = last(group.events).endTime
            group.startTime = first(group.events).startTime

            return group
          },
        )
      })

      setOverlapGroups(newRecordings)
    }
  }, [overlapGroups])

  useEffect(() => {
    if (!localLoaded && Object.keys(overlapGroups).length > 0) {
      recreateEvents()
      setLocalLoaded(true)
    }
  }, [localLoaded, overlapGroups, recreateEvents])

  useEffect(() => {
    localStorage.setItem('overlapGroups', JSON.stringify(overlapGroups))
  }, [overlapGroups])

  const contextValue = useMemo(
    () => ({
      overlapGroups,
      recordings: overlapGroups,
      setOverlapGroups,
      setRecordings: setOverlapGroups,
    }),
    [overlapGroups],
  )

  return (
    <InstrumentRecordingsContext.Provider value={contextValue}>
      {children}
    </InstrumentRecordingsContext.Provider>
  )
})

InstrumentRecordingsProvider.propTypes = {
  children: PropTypes.node.isRequired,
}

export default InstrumentRecordingsProvider

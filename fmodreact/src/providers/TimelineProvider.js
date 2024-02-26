import React, { createContext, useMemo, useState } from 'react'

export const TimelineContext = createContext()

export const TimelineProvider = ({ children }) => {
  const [timelineState, setTimelineState] = useState({
    timelineY: undefined,
  })

  const updateTimelineState = updates => {
    setTimelineState(prevState => ({
      ...prevState,
      ...updates,
    }))
  }

  // Memoize the context value
  const value = useMemo(
    () => ({ setTimelineState, timelineState, updateTimelineState }),
    [timelineState, setTimelineState],
  )

  return (
    <TimelineContext.Provider value={value}>
      {children}
    </TimelineContext.Provider>
  )
}

export default TimelineProvider

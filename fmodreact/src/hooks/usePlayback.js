import { useCallback, useEffect, useState } from 'react'
import { stopAllPlayback } from '../fmodLogic/eventInstanceHelpers'

const usePlayback = ({ playbackStatus }) => {
  const [timeouts, setTimeouts] = useState([])

  const clearAllTimeouts = useCallback(() => {
    timeouts.forEach(clearTimeout)
    setTimeouts([])

    stopAllPlayback()
  }, [timeouts])

  const setNewTimeout = useCallback((callback, delay) => {
    const timeoutId = setTimeout(() => callback(), delay * 1000)

    setTimeouts(prevTimeouts => {
      return [...prevTimeouts, timeoutId]
    })
  }, [])

  useEffect(() => {
    if (timeouts.length > 0 && !playbackStatus) {
      clearAllTimeouts()
    }
  }, [clearAllTimeouts, playbackStatus, timeouts.length])

  return { clearAllTimeouts, setNewTimeout }
}

export default usePlayback

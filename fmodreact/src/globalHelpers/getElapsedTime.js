import convertToSeconds from './convertToSeconds'

const getElapsedTime = startTime => convertToSeconds(Date.now() - startTime)

export default getElapsedTime

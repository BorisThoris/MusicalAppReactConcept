import convertToSeconds from './convertToSeconds';

const getElapsedTime = (startTime, startOffset) => convertToSeconds(Date.now() - startTime + startOffset);

export default getElapsedTime;

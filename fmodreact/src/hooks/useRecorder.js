import { useCallback, useEffect, useState } from 'react';
import getElapsedTime from '../globalHelpers/getElapsedTime';
import { useInstrumentRecordingsOperations } from './useInstrumentRecordingsOperations';

const RECORDING_TIME_LIMIT_SECONDS = 120.0;

const useRecorder = ({ instrumentName }) => {
    const [isRecording, setIsRecording] = useState(false);
    const [startTime, setStartTime] = useState(null);
    const { addRecording, resetRecordings } = useInstrumentRecordingsOperations();

    const toggleRecording = useCallback(() => {
        setIsRecording((prevIsRecording) => !prevIsRecording);

        if (!isRecording) {
            setStartTime(Date.now());
            resetRecordings(instrumentName);
        }
    }, [instrumentName, isRecording, resetRecordings]);

    const recordEvent = (eventInstance, currentInstrumentName) => {
        if (isRecording) {
            addRecording(eventInstance, currentInstrumentName, startTime);
        }
    };

    useEffect(() => {
        const checkRecordingTimeout = () => {
            if (isRecording) {
                const elapsedTime = getElapsedTime(startTime);

                if (elapsedTime >= RECORDING_TIME_LIMIT_SECONDS) {
                    toggleRecording();
                }
            }
        };

        const intervalId = setInterval(checkRecordingTimeout, 1000);
        return () => clearInterval(intervalId);
    }, [isRecording, startTime, toggleRecording]);

    return {
        isRecording,
        recordEvent,
        toggleRecording
    };
};

export default useRecorder;

import { useCallback, useContext, useEffect, useState } from 'react';
import createSound from '../globalHelpers/createSound';
import getElapsedTime from '../globalHelpers/getElapsedTime';
import { InstrumentRecordingsContext } from '../providers/InstrumentsProvider';

const RECORDING_TIME_LIMIT_SECONDS = 120.0;

const useRecorder = ({ instrumentName }) => {
    const [isRecording, setIsRecording] = useState(false);
    const [startTime, setStartTime] = useState(null);
    const { resetInstrumentRecordings, setRecordings } = useContext(
        InstrumentRecordingsContext
    );

    const toggleRecording = useCallback(() => {
        setIsRecording((prevIsRecording) => !prevIsRecording);

        if (!isRecording) {
            setStartTime(Date.now());
            resetInstrumentRecordings(instrumentName);
        }
    }, [instrumentName, isRecording, resetInstrumentRecordings]);

    const recordEvent = (event, currentInstrumentName) => {
        if (isRecording) {
            const elapsedTime = getElapsedTime(startTime);
            const sound = createSound({
                eventName: event,
                instrumentName: currentInstrumentName,
                startTime: elapsedTime,
            });

            setRecordings((prevRecordings) => {
                const existingSounds =
                    prevRecordings[currentInstrumentName] || [];
                const updatedSounds = [...existingSounds, sound];
                return {
                    ...prevRecordings,
                    [currentInstrumentName]: updatedSounds,
                };
            });
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
        toggleRecording,
    };
};

export default useRecorder;

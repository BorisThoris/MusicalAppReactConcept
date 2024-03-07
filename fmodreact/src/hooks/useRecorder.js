import { useCallback, useContext, useEffect, useState } from 'react';
import pixelToSecondRatio from '../globalConstants/pixelToSeconds';
import getElapsedTime from '../globalHelpers/getElapsedTime';
import { useInstrumentRecordingsOperations } from './useInstrumentRecordingsOperations';
import { INSTRUMENTS_PANEL_ID, PanelContext } from './usePanelState';

const RECORDING_TIME_LIMIT_SECONDS = 120.0;

const useRecorder = ({ instrumentName }) => {
    const [isRecording, setIsRecording] = useState(false);
    const [startTime, setStartTime] = useState(null);
    const { addRecording, resetRecordings } = useInstrumentRecordingsOperations();
    const { panels } = useContext(PanelContext);
    const { instrumentLayer, isOpen: onInstrumentsPanel, x } = panels[INSTRUMENTS_PANEL_ID] || { x: 0 };

    const toggleRecording = useCallback(() => {
        setIsRecording((prevIsRecording) => !prevIsRecording);

        if (!isRecording) {
            setStartTime(Date.now());
            if (!onInstrumentsPanel) {
                resetRecordings(instrumentName);
            }
        }
    }, [isRecording, onInstrumentsPanel, resetRecordings, instrumentName]);

    const recordEvent = useCallback(
        (eventInstance, currentInstrumentName) => {
            if (isRecording) {
                const elapsedTime = (x / pixelToSecondRatio) * 1000;
                addRecording(eventInstance, instrumentLayer || currentInstrumentName, startTime, elapsedTime);
            }
        },
        [isRecording, addRecording, instrumentLayer, startTime, x]
    );

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

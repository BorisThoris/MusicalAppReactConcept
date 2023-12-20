import React, { useCallback, useContext } from 'react';
import threeMinuteMs from '../../globalConstants/songLimit';
import instrumentRecordingOperationsHook from '../../hooks/useInstrumentRecordingsOperations';
import usePanelStateHook from '../../hooks/usePanelState';
import useRecordingsPlayer from '../../hooks/useRecordingsPlayer';
import useStageWidthHook from '../../hooks/useStageWidth';
import { InstrumentRecordingsContext } from '../../providers/InstrumentsProvider';
import Header from './components/Header/Header';
import PanelComponent from './components/Panel/Panel';
import Timelines, {
    StyledEditorWrapper,
    StyledTimeline,
} from './components/Timelines/Timelines';

const Editor = () => {
    const {
        deleteAllRecordingsForInstrument,
        deleteOverlappingGroupById,
        deleteRecording,
        updateRecording,
    } = instrumentRecordingOperationsHook();

    const { overlapGroups, recordings } = useContext(
        InstrumentRecordingsContext
    );

    const { closePanel, focusedEvent, openPanel, panelState, setFocusedEvent } =
        usePanelStateHook();

    const { furthestEndTime, furthestEndTimes } = useStageWidthHook({
        recordings,
    });

    const {
        playbackStatus,
        replayAllRecordedSounds,
        replayInstrumentRecordings,
        setTrackerPosition,
        trackerPosition,
    } = useRecordingsPlayer({ furthestEndTime, furthestEndTimes });

    const { currentInstrument, isPlaying } = playbackStatus;

    const deleteNote = useCallback(
        (id) => {
            deleteRecording(id);
        },
        [deleteRecording]
    );

    return (
        <StyledEditorWrapper>
            <Header />

            <StyledTimeline>
                <button onClick={replayAllRecordedSounds}>
                    {isPlaying ? 'Pause' : 'Start'}
                </button>

                <Timelines
                    recordings={overlapGroups}
                    furthestEndTime={furthestEndTime}
                    isPlaying={isPlaying}
                    duration={threeMinuteMs}
                    openPanel={openPanel}
                    closePanel={closePanel}
                    updateStartTime={updateRecording}
                    trackerPosition={trackerPosition}
                    setTrackerPosition={setTrackerPosition}
                    panelFor={panelState?.overlapGroup?.id}
                    replayInstrumentRecordings={replayInstrumentRecordings}
                    focusedEvent={focusedEvent}
                    deleteAllRecordingsForInstrument={
                        deleteAllRecordingsForInstrument
                    }
                    furthestEndTimes={furthestEndTimes}
                    currentPlayingInstrument={currentInstrument}
                />

                {panelState.isOpen && (
                    <PanelComponent
                        onPressX={closePanel}
                        updateStartTime={updateRecording}
                        panelState={panelState}
                        onDelete={deleteNote}
                        onDeleteGroup={deleteOverlappingGroupById}
                        setFocusedEvent={setFocusedEvent}
                        focusedEvent={focusedEvent}
                    />
                )}
            </StyledTimeline>
        </StyledEditorWrapper>
    );
};

export default Editor;

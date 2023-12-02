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
    const { deleteRecording, updateRecording } =
        instrumentRecordingOperationsHook();
    const { overlapGroups, recordings } = useContext(
        InstrumentRecordingsContext
    );

    const {
        isPlaying,
        replayAllRecordedSounds,
        setTrackerPosition,
        stopPlayback,
        trackerPosition,
    } = useRecordingsPlayer();
    const { closePanel, openPanel, panelState } = usePanelStateHook();
    const { furthestEndTime } = useStageWidthHook({ recordings });

    const deleteNote = useCallback(
        (id) => {
            deleteRecording(id);

            if (panelState.isOpen) {
                // closePanel();
            }
        },
        [deleteRecording, panelState]
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
                    stopPlayback={stopPlayback}
                    openPanel={openPanel}
                    updateStartTime={updateRecording}
                    trackerPosition={trackerPosition}
                    setTrackerPosition={setTrackerPosition}
                    panelFor={panelState?.overlapGroup?.id}
                />

                {panelState.isOpen && (
                    <PanelComponent
                        onPressX={closePanel}
                        panelState={panelState}
                        onDelete={deleteNote}
                    />
                )}
            </StyledTimeline>
        </StyledEditorWrapper>
    );
};

export default Editor;

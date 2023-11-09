import React, { useCallback, useContext } from 'react';
import threeMinuteMs from '../../globalConstants/songLimit';
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
    const { recordings, removeEventInstance, updateStartTime } = useContext(
        InstrumentRecordingsContext
    );
    const { isPlaying, replayAllRecordedSounds } = useRecordingsPlayer();
    const { closePanel, openPanel, panelState } = usePanelStateHook();
    const { furthestEndTime } = useStageWidthHook({ recordings });

    const deleteNote = useCallback(() => {
        if (panelState) {
            removeEventInstance(
                panelState.recording.instrumentName,
                panelState.index
            );
            closePanel();
        }
    }, [closePanel, panelState, removeEventInstance]);

    return (
        <StyledEditorWrapper>
            <Header />
            <StyledTimeline>
                <button onClick={replayAllRecordedSounds}>
                    {isPlaying ? 'Pause' : 'Start'}
                </button>

                <Timelines
                    recordings={recordings}
                    furthestEndTime={furthestEndTime}
                    isPlaying={isPlaying}
                    duration={threeMinuteMs}
                    openPanel={openPanel}
                    updateStartTime={updateStartTime}
                />

                {panelState && (
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

import React, { useContext } from 'react';
import threeMinuteMs from '../../globalConstants/songLimit';
import instrumentRecordingOperationsHook from '../../hooks/useInstrumentRecordingsOperations';
import usePanelStateHook from '../../hooks/usePanelState';
import useStageWidthHook from '../../hooks/useStageWidth';
import { InstrumentRecordingsContext } from '../../providers/InstrumentsProvider';
import Header from './components/Header/Header';
import PanelComponent from './components/Panel/Panel';
import Timelines, {
    StyledEditorWrapper,
    StyledTimeline,
} from './components/Timelines/Timelines';

const Editor = () => {
    const { deleteAllRecordingsForInstrument, updateRecording } =
        instrumentRecordingOperationsHook();

    const { overlapGroups, recordings } = useContext(
        InstrumentRecordingsContext
    );

    const { closePanel, focusedEvent, openPanel, panelState, setFocusedEvent } =
        usePanelStateHook({ overlapGroups });

    const { furthestEndTime, furthestEndTimes } = useStageWidthHook({
        recordings,
    });

    return (
        <StyledEditorWrapper>
            <Header />

            <StyledTimeline>
                <Timelines
                    recordings={overlapGroups}
                    furthestEndTime={furthestEndTime}
                    duration={threeMinuteMs}
                    openPanel={openPanel}
                    closePanel={closePanel}
                    updateStartTime={updateRecording}
                    panelFor={panelState?.overlapGroup?.id}
                    focusedEvent={focusedEvent}
                    setFocusedEvent={setFocusedEvent}
                    deleteAllRecordingsForInstrument={
                        deleteAllRecordingsForInstrument
                    }
                    furthestEndTimes={furthestEndTimes}
                />

                {panelState.isOpen && (
                    <PanelComponent
                        onPressX={closePanel}
                        updateStartTime={updateRecording}
                        panelState={panelState}
                        setFocusedEvent={setFocusedEvent}
                        focusedEvent={focusedEvent}
                    />
                )}
            </StyledTimeline>
        </StyledEditorWrapper>
    );
};

export default Editor;

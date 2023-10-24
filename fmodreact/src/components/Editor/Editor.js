import React, { useCallback, useContext, useRef, useState } from 'react';
import styled from 'styled-components';
import { InstrumentRecordingsContext } from '../../providers/InstrumentsProvider';
import Header from './components/Header/Header';
import InstrumentTimeline from './components/InstrumentTimeline/InstrumentTimeline';
import PanelComponent from './components/Panel/Panel';

// Separate styles
const StyledEditorWrapper = styled.div`
    background-color: white;
    opacity: 0.7;
`;

const StyledTimeline = styled.div`
    flex-direction: column;
    overflow-x: scroll;
`;

const Editor = () => {
    const [panelState, setPanelState] = useState(null);
    const { recordings, updateStartTime } = useContext(
        InstrumentRecordingsContext
    );

    const openPanel = (recording) => {
        setPanelState({ isOpen: true, recording });
    };

    const closePanel = useCallback(() => {
        setPanelState(null);
    }, []);

    return (
        <StyledEditorWrapper>
            <div>Editor</div>
            <Header />

            <StyledTimeline key={recordings}>
                {Object.entries(recordings).map(
                    ([groupKey, instrumentGroup]) => (
                        <InstrumentTimeline
                            key={groupKey}
                            updateStartTime={updateStartTime}
                            instrumentGroup={instrumentGroup}
                            openPanel={openPanel}
                        />
                    )
                )}
            </StyledTimeline>

            {panelState && (
                <PanelComponent onPressX={closePanel} panelState={panelState} />
            )}
        </StyledEditorWrapper>
    );
};

export default Editor;

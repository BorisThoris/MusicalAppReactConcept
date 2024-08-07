import React, { useContext } from 'react';
import styled from 'styled-components';
import {
    INSTRUMENT_LAYER_PANEL_ID,
    INSTRUMENTS_PANEL_ID,
    LOAD_PANEL_ID,
    PanelContext,
    SAVE_PANEL_ID,
    SELECTIONS_PANEL_ID
} from '../../hooks/usePanelState';
import { InstrumentLayerPanel } from './components/InstrumentLayerPanel/InstrumentLayerPanel';
import { LoadPanel } from './components/LoadPanel/LoadPanel';
import { PlayInstrumentsPanel } from './components/PlayInstrumentsPanel/PlayInstrumentsPanel';
import { SavePanel } from './components/SavePanel/SavePanel';
import { SelectionsPanel } from './components/SelectionsPanel/SelectionsPanel';
import Timelines from './components/Timelines/Timelines';
import { TimelinesHeader } from './components/TimelinesHeader/TimelinesHeader';

const StyledEditorWrapper = styled.div`
    background-color: white;
`;

const StyledTimeline = styled.div`
    flex-direction: column;
    overflow-y: scroll;
`;

const Editor = () => {
    const { panelsArr } = useContext(PanelContext);

    const renderPanel = (panel) => {
        switch (panel.id) {
            case INSTRUMENTS_PANEL_ID:
                return <PlayInstrumentsPanel />;

            case SELECTIONS_PANEL_ID:
                return <SelectionsPanel />;

            case INSTRUMENT_LAYER_PANEL_ID:
                return <InstrumentLayerPanel />;

            case LOAD_PANEL_ID:
                return <LoadPanel />;
            case SAVE_PANEL_ID:
                return <SavePanel />;

            default:
                return null;
        }
    };

    return (
        <>
            <StyledEditorWrapper>
                <StyledTimeline>
                    <TimelinesHeader />
                    <Timelines />
                </StyledTimeline>
            </StyledEditorWrapper>

            {panelsArr.map(renderPanel)}
        </>
    );
};

export default Editor;

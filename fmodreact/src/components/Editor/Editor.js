import React, { useContext } from 'react';
import styled from 'styled-components';
import {
    INSTRUMENT_LAYER_PANEL_ID,
    INSTRUMENTS_PANEL_ID,
    PanelContext,
    PARAMS_PANEL_ID,
    SELECTIONS_PANEL_ID
} from '../../hooks/usePanelState';
import Header from './components/Header/Header';
import { InstrumentLayerPanel } from './components/InstrumentLayerPanel/InstrumentLayerPanel';
import { ParamsPanel } from './components/ParamsPanel/ParamsPanel';
import { PlayInstrumentsPanel } from './components/PlayInstrumentsPanel/PlayInstrumentsPanel';
import { SelectionsPanel } from './components/SelectionsPanel/SelectionsPanel';
import Timelines from './components/Timelines/Timelines';

const StyledEditorWrapper = styled.div`
    background-color: white;
    opacity: 0.7;
`;

const StyledTimeline = styled.div`
    flex-direction: column;
    overflow-y: scroll;
`;

const Editor = () => {
    const { panelsArr } = useContext(PanelContext);

    const renderPanel = (panel) => {
        switch (panel.id) {
            case PARAMS_PANEL_ID:
                return <ParamsPanel key={panel.id} />;

            case INSTRUMENTS_PANEL_ID:
                return <PlayInstrumentsPanel />;

            case SELECTIONS_PANEL_ID:
                return <SelectionsPanel />;

            case INSTRUMENT_LAYER_PANEL_ID:
                return <InstrumentLayerPanel />;
            default:
                return null;
        }
    };

    return (
        <>
            <StyledEditorWrapper>
                <Header />
                <StyledTimeline>
                    <Timelines />
                </StyledTimeline>
            </StyledEditorWrapper>

            {panelsArr.map(renderPanel)}
        </>
    );
};

export default Editor;

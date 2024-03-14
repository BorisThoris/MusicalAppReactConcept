import React, { useContext } from 'react';
import styled from 'styled-components';
import { INSTRUMENTS_PANEL_ID, PanelContext, PARAMS_PANEL_ID, SELECTIONS_PANEL_ID } from '../../hooks/usePanelState';
import Header from './components/Header/Header';
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
        // Example switch case based on panel.type
        switch (panel.id) {
            case PARAMS_PANEL_ID:
                return <ParamsPanel key={panel.id} />;

            case INSTRUMENTS_PANEL_ID:
                return <PlayInstrumentsPanel />;

            case SELECTIONS_PANEL_ID:
                return <SelectionsPanel />;
            default:
                return null;
        }
    };

    return (
        <StyledEditorWrapper>
            <Header />
            <StyledTimeline>
                <Timelines />
                {panelsArr.map(renderPanel)}
            </StyledTimeline>
        </StyledEditorWrapper>
    );
};

export default Editor;

import React, { useContext } from 'react';
import styled from 'styled-components';
import { BeatPlayer } from '../../hooks/beats/BeatPlayer';
import {
    INSTRUMENT_LAYER_PANEL_ID,
    INSTRUMENTS_PANEL_ID,
    LOAD_PANEL_ID,
    PanelContext,
    SAVE_PANEL_ID,
    SELECTIONS_PANEL_ID
} from '../../hooks/usePanelState';
import ActionsMenu from './components/ActionsMenu/ActionsMenu';
import FPSMonitor from './components/FpsMonitor/FpsMonitor';
import { InstrumentLayerPanel } from './components/InstrumentLayerPanel/InstrumentLayerPanel';
import { LoadPanel } from './components/LoadPanel/LoadPanel';
import { PlayInstrumentsPanel } from './components/PlayInstrumentsPanel/PlayInstrumentsPanel';
import { SavePanel } from './components/SavePanel/SavePanel';
import { SelectionsPanel } from './components/SelectionsPanel/SelectionsPanel';
import Timelines from './components/Timelines/Timelines';
import { TimelinesHeader } from './components/TimelinesHeader/TimelinesHeader';

const StyledEditorWrapper = styled.div`
    background: ${({ theme }) => theme.colors.glass.primary};
    backdrop-filter: blur(25px);
    -webkit-backdrop-filter: blur(25px);
    border-radius: ${({ theme }) => theme.borderRadius.xl};
    box-shadow: ${({ theme }) => theme.shadows.glassLg};
    margin: ${({ theme }) => theme.spacing[4]};
    overflow: hidden;
    border: 1px solid ${({ theme }) => theme.colors.glass.border};
    transition: all ${({ theme }) => theme.transitions.duration.fast} ${({ theme }) => theme.transitions.easing.ease};
    position: relative;

    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(
            135deg,
            rgba(255, 255, 255, 0.05) 0%,
            transparent 50%,
            rgba(255, 255, 255, 0.02) 100%
        );
        pointer-events: none;
        border-radius: inherit;
    }

    &:hover {
        box-shadow: ${({ theme }) => theme.shadows.glassXl};
        border-color: ${({ theme }) => theme.colors.primary[400]};
        transform: translateY(-2px);
    }
`;

const StyledTimeline = styled.div`
    flex-direction: column;
    overflow-y: scroll;
    background: ${({ theme }) => theme.colors.glass.secondary};
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    position: relative;

    &::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 1px;
        background: linear-gradient(90deg, transparent, ${({ theme }) => theme.colors.glass.border}, transparent);
    }
`;

const EditorContainer = styled.div`
    min-height: calc(100vh - 120px);
    background: ${({ theme }) => theme.colors.glass.tertiary};
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    position: relative;

    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: radial-gradient(circle at 20% 80%, rgba(59, 130, 246, 0.05) 0%, transparent 50%);
        pointer-events: none;
    }
`;

const renderPanel = (panel) => {
    switch (panel.id) {
        case INSTRUMENTS_PANEL_ID:
            return <PlayInstrumentsPanel key={panel.id} />;
        case SELECTIONS_PANEL_ID:
            return <SelectionsPanel key={panel.id} />;
        case INSTRUMENT_LAYER_PANEL_ID:
            return <InstrumentLayerPanel key={panel.id} />;
        case LOAD_PANEL_ID:
            return <LoadPanel key={panel.id} />;
        case SAVE_PANEL_ID:
            return <SavePanel key={panel.id} />;
        default:
            return null;
    }
};

const Editor = () => {
    const { actionsMenuState, panelsArr } = useContext(PanelContext);

    return (
        <EditorContainer>
            <FPSMonitor />

            <StyledEditorWrapper>
                <StyledTimeline>
                    <BeatPlayer />
                    <TimelinesHeader />
                    <Timelines />
                </StyledTimeline>
            </StyledEditorWrapper>

            {panelsArr.map(renderPanel)}

            {actionsMenuState && <ActionsMenu actionsMenuState={actionsMenuState} />}
        </EditorContainer>
    );
};

export default Editor;

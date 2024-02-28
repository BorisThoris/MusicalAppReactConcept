import React, { useContext } from 'react';
import styled from 'styled-components';
import { PanelContext } from '../../hooks/usePanelState';
import Header from './components/Header/Header';
import { Panel } from './components/Panel/Panel';
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
    const { panelState } = useContext(PanelContext);

    return (
        <StyledEditorWrapper>
            <Header />
            <StyledTimeline>
                <Timelines />
                {panelState.isOpen && <Panel y={panelState.y} />}
            </StyledTimeline>
        </StyledEditorWrapper>
    );
};

export default Editor;

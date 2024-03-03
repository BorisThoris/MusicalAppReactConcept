import React, { useContext } from 'react';
import { INSTRUMENTS_PANEL_ID, PanelContext } from '../../../../hooks/usePanelState';
import { TimelineContext } from '../../../../providers/TimelineProvider';
import Guitar from '../../../Guitar/Guitar';
import { TimelineHeight } from '../InstrumentTimeline/InstrumentTimeline';
import { PanelWrapper } from '../Panel/PanelWrapper';

export const PlayInstrumentsPanel = ({ onClose, ...panelProps }) => {
    const { timelineState } = useContext(TimelineContext);
    const { panels } = useContext(PanelContext);
    const { instrumentGroup, x, y } = panels[INSTRUMENTS_PANEL_ID];

    return (
        <PanelWrapper
            x={x}
            y={y}
            timelineState={timelineState}
            // eslint-disable-next-line react-perf/jsx-no-new-object-as-prop
            style={{ height: TimelineHeight }}
            isSpeechBubble
        >
            <Guitar />
        </PanelWrapper>
    );
};

export default PlayInstrumentsPanel;

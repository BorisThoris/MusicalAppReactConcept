import React, { useCallback, useContext } from 'react';
import { INSTRUMENTS_PANEL_ID, PanelContext } from '../../../../hooks/usePanelState';
import { TimelineContext } from '../../../../providers/TimelineProvider';
import Drums from '../../../Drums/Drums';
import Guitar from '../../../Guitar/Guitar';
import Piano from '../../../Piano/Piano';
import Tambourine from '../../../Tambourine/Tambourine';
import { TimelineHeight } from '../InstrumentTimeline/InstrumentTimeline';
import { PanelWrapper } from '../Panel/PanelWrapper';

export const PlayInstrumentsPanel = () => {
    const { timelineState } = useContext(TimelineContext);
    const { closePanel, panels } = useContext(PanelContext);
    const { targetGroup, x, y } = panels[INSTRUMENTS_PANEL_ID];

    const instrumentName = targetGroup.split(' ')[0];

    const renderInstrument = useCallback(() => {
        switch (instrumentName) {
            case 'Drum':
                return <Drums />;
            case 'Guitar':
                return <Guitar />;
            case 'Piano':
                return <Piano />;
            case 'Tambourine':
                return <Tambourine />;

            default:
                break;
        }
    }, [instrumentName]);

    const handleClose = useCallback(() => {
        closePanel(INSTRUMENTS_PANEL_ID);
    }, [closePanel]);

    return (
        <PanelWrapper
            x={x}
            y={y}
            timelineState={timelineState}
            // eslint-disable-next-line react-perf/jsx-no-new-object-as-prop
            style={{ height: TimelineHeight }}
            isSpeechBubble
            handleClose={handleClose}
        >
            <>Target: {targetGroup}</>
            {renderInstrument()}
        </PanelWrapper>
    );
};

export default PlayInstrumentsPanel;

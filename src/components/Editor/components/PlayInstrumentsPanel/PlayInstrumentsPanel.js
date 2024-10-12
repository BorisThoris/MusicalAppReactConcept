import React, { useCallback, useContext } from 'react';
import pixelToSecondRatio from '../../../../globalConstants/pixelToSeconds';
import { INSTRUMENTS_PANEL_ID, PanelContext } from '../../../../hooks/usePanelState';
import { CollisionsContext } from '../../../../providers/CollisionsProvider/CollisionsProvider';
import { TimelineContext, TimelineHeight } from '../../../../providers/TimelineProvider';
import Drums from '../../../Drums/Drums';
import Guitar from '../../../Guitar/Guitar';
import Piano from '../../../Piano/Piano';
import Tambourine from '../../../Tambourine/Tambourine';
import { PanelWrapper } from '../Panel/PanelWrapper';

export const PlayInstrumentsPanel = () => {
    const { timelineState } = useContext(TimelineContext);
    const { closePanel, panels } = useContext(PanelContext);
    const { instrumentLayer, x, y } = panels[INSTRUMENTS_PANEL_ID];
    const { insertRecording } = useContext(CollisionsContext);

    const instrumentName = instrumentLayer?.split(' ')[0];

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
                return null;
        }
    }, [instrumentName]);

    const handleClose = useCallback(() => {
        closePanel(INSTRUMENTS_PANEL_ID);
    }, [closePanel]);

    const handlePaste = useCallback(() => {
        if (instrumentName) {
            // sad
        }
    }, [instrumentName]);

    if (!instrumentName) {
        return null;
    }

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
            <div>
                <div>Target: {instrumentLayer}</div>
                <button onClick={handlePaste}>Paste</button>
                {renderInstrument()}
            </div>
        </PanelWrapper>
    );
};

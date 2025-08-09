import React, { useCallback, useContext, useMemo } from 'react';
import { INSTRUMENTS_PANEL_ID, PanelContext } from '../../../../hooks/usePanelState';
import { TimelineContext, TimelineHeight } from '../../../../providers/TimelineProvider';
import Drums from '../../../Drums/Drums';
import Guitar from '../../../Guitar/Guitar';
import Piano from '../../../Piano/Piano';
import Tambourine from '../../../Tambourine/Tambourine';
import { PanelWrapper } from '../Panel/PanelWrapper';

export const PlayInstrumentsPanel = () => {
    const { panelCompensationOffset } = useContext(TimelineContext);
    const { closePanel, panels } = useContext(PanelContext);
    const { instrumentLayer, x, y } = panels[INSTRUMENTS_PANEL_ID];

    const instrumentName = instrumentLayer?.split(' ')[0];

    const handleClose = useCallback(() => {
        closePanel(INSTRUMENTS_PANEL_ID);
    }, [closePanel]);

    const handlePaste = useCallback(() => {
        // Handle paste functionality
    }, []);

    const renderInstrument = useCallback(() => {
        switch (instrumentName) {
            case 'Guitar':
                return <Guitar />;
            case 'Piano':
                return <Piano />;
            case 'Drums':
                return <Drums />;
            case 'Tambourine':
                return <Tambourine />;
            default:
                return null;
        }
    }, [instrumentName]);

    // Memoize the panel style to avoid creating new objects on every render
    const panelStyle = useMemo(() => ({ height: TimelineHeight }), []);

    if (!instrumentName) {
        return null;
    }

    return (
        <PanelWrapper
            x={x}
            y={y}
            panelCompensationOffset={panelCompensationOffset}
            style={panelStyle}
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

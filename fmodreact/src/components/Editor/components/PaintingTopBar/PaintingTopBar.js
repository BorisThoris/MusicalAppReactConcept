/* eslint-disable react-perf/jsx-no-new-function-as-prop */
import React, { useCallback, useState } from 'react';
import styled from 'styled-components';
import { createAndPlayEventIntance } from '../../../../fmodLogic/eventInstanceHelpers';
import { usePaintings } from '../../../../providers/PaintingProvider';

const INSTRUMENT_NAMES = {
    Drum: '🥁',
    Guitar: '🎸',
    Piano: '🎹'
};

const submenuEvents = {
    Drum: ['CrashCymbal', 'FloorTom', 'RideCymbal', 'Snare', 'SnareDrum', 'Tom1'],
    Guitar: ['A', 'B', 'D', 'E', 'G'],
    Piano: [
        'pianoC',
        'pianoC#',
        'pianoD',
        'pianoD#',
        'pianoE',
        'pianoF',
        'pianoF#',
        'pianoG',
        'pianoG#',
        'pianoA',
        'pianoA#',
        'pianoB'
    ]
};

const TopBarWrapper = styled.div`
    display: flex;
    justify-content: flex-start;
    align-items: center;
    width: 100%;
    height: 60px;
    background-color: #333;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    padding: 0 20px;
    position: relative;
`;

const MenuWrapper = styled.div`
    display: flex;
    justify-content: flex-start;
    align-items: center;
    width: 100%;
    height: 60px;
    background-color: #333;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    padding: 0 20px;
    overflow: hidden;
    flex-wrap: wrap;
`;

const InstrumentButton = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    width: 40px;
    height: 40px;
    background-color: #444;
    border-radius: 5px;
    margin: 10px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    cursor: pointer;
    transition:
        transform 0.3s ease,
        box-shadow 0.3s ease;

    &:hover {
        transform: scale(1.1);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
        background-color: #555;
    }

    & > svg {
        fill: #ccc;
    }

    &:hover > svg {
        fill: #fff;
    }
`;

const BackButton = styled(InstrumentButton)`
    background-color: #555;

    &:hover {
        background-color: #666;
    }
`;

const StopPaintingButton = styled(InstrumentButton)`
    background-color: #d9534f;

    &:hover {
        background-color: #c9302c;
    }
`;

const EventButton = ({ event, selectedInstrument, setPaintingTarget }) => {
    const playEvent = useCallback(() => {
        createAndPlayEventIntance(`${selectedInstrument}/${event}`);
    }, [event, selectedInstrument]);

    const handleClick = useCallback(() => {
        setPaintingTarget({ event, instrument: selectedInstrument });
    }, [event, selectedInstrument, setPaintingTarget]);

    return (
        <InstrumentButton key={event} onDoubleClick={playEvent} onClick={handleClick}>
            {event}
        </InstrumentButton>
    );
};

const TopBar = () => {
    const { setPaintingTarget } = usePaintings();
    const [selectedInstrument, setSelectedInstrument] = useState(null);

    const handleStopPainting = useCallback(() => {
        setSelectedInstrument(null);
        setPaintingTarget(null);
    }, [setPaintingTarget]);

    return (
        <>
            <TopBarWrapper tabIndex={-1}>
                <StopPaintingButton onClick={handleStopPainting}>Stop Painting</StopPaintingButton>
                {!selectedInstrument ? (
                    <MenuWrapper>
                        {Object.keys(INSTRUMENT_NAMES).map((instrument) => (
                            <InstrumentButton key={instrument} onClick={() => setSelectedInstrument(instrument)}>
                                {INSTRUMENT_NAMES[instrument]}
                            </InstrumentButton>
                        ))}
                    </MenuWrapper>
                ) : (
                    <MenuWrapper>
                        <BackButton onClick={() => setSelectedInstrument(null)}>⬅</BackButton>
                        {submenuEvents[selectedInstrument].map((event) => (
                            <EventButton
                                key={event}
                                event={event}
                                selectedInstrument={selectedInstrument}
                                setPaintingTarget={setPaintingTarget}
                            />
                        ))}
                    </MenuWrapper>
                )}
            </TopBarWrapper>
        </>
    );
};

export default TopBar;

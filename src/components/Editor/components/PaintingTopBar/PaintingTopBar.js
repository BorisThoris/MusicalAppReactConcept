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
    background-color: ${({ theme }) => theme.colors.semantic.surface.inverse};
    box-shadow: ${({ theme }) => theme.shadows.lg};
    padding: 0 ${({ theme }) => theme.spacing[5]};
    position: relative;
`;

const MenuWrapper = styled.div`
    display: flex;
    justify-content: flex-start;
    align-items: center;
    width: 100%;
    height: 60px;
    background-color: ${({ theme }) => theme.colors.semantic.surface.inverse};
    box-shadow: ${({ theme }) => theme.shadows.lg};
    padding: 0 ${({ theme }) => theme.spacing[5]};
    overflow: hidden;
    flex-wrap: wrap;
`;

const InstrumentButton = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    width: 40px;
    height: 40px;
    background-color: ${({ theme }) => theme.colors.semantic.surface.secondary};
    border-radius: ${({ theme }) => theme.borderRadius.base};
    margin: ${({ theme }) => theme.spacing[2]};
    box-shadow: ${({ theme }) => theme.shadows.md};
    cursor: pointer;
    transition:
        transform ${({ theme }) => theme.transitions.duration.fast} ${({ theme }) => theme.transitions.easing.ease},
        box-shadow ${({ theme }) => theme.transitions.duration.fast} ${({ theme }) => theme.transitions.easing.ease};

    &:hover {
        transform: scale(1.1);
        box-shadow: ${({ theme }) => theme.shadows.lg};
        background-color: ${({ theme }) => theme.colors.semantic.surface.tertiary};
    }

    & > svg {
        fill: ${({ theme }) => theme.colors.semantic.text.secondary};
    }

    &:hover > svg {
        fill: ${({ theme }) => theme.colors.semantic.text.primary};
    }
`;

const BackButton = styled(InstrumentButton)`
    background-color: ${({ theme }) => theme.colors.semantic.surface.tertiary};

    &:hover {
        background-color: ${({ theme }) => theme.colors.semantic.surface.secondary};
    }
`;

const StopPaintingButton = styled(InstrumentButton)`
    background-color: ${({ theme }) => theme.colors.semantic.interactive.error};

    &:hover {
        background-color: ${({ theme }) => theme.colors.error[600]};
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

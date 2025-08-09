import React, { useCallback, useContext, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { useInstrumentRecordingsOperations } from '../../../../hooks/useInstrumentRecordingsOperations';
import { PanelContext } from '../../../../hooks/usePanelState';

const INSTRUMENT_NAMES = { Drum: '🥁', Guitar: '', Piano: '🎹', Tambourine: '🎵' };

const ParentWrapper = styled.div`
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
`;

const InstrumentLayerWrapper = styled.div`
    display: flex;
    justify-content: space-around;
    align-items: center;
    width: 80%;
    background-color: ${({ theme }) => theme.colors.semantic.surface.primary};
    box-shadow: ${({ theme }) => theme.shadows['2xl']};
    border-radius: ${({ theme }) => theme.borderRadius.xl};
    padding: ${({ theme }) => theme.spacing[8]};
    border: 1px solid ${({ theme }) => theme.colors.semantic.border.primary};

    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
`;

const InstrumentIcon = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100px;
    height: 100px;
    background-color: ${({ theme }) => theme.colors.semantic.surface.primary};
    border-radius: 50%;
    margin: 0 ${({ theme }) => theme.spacing[5]};
    box-shadow: ${({ theme }) => theme.shadows.lg};
    transition:
        transform ${({ theme }) => theme.transitions.duration.fast} ${({ theme }) => theme.transitions.easing.ease},
        box-shadow ${({ theme }) => theme.transitions.duration.fast} ${({ theme }) => theme.transitions.easing.ease};
    cursor: pointer;

    &:hover {
        transform: scale(1.1);
        box-shadow: ${({ theme }) => theme.shadows['2xl']};
    }
`;

export const InstrumentLayerPanel = () => {
    const { insertNewInstrument } = useInstrumentRecordingsOperations();
    const { closeInstrumentLayerPanel } = useContext(PanelContext);
    const wrapperRef = useRef(null);

    const onAddInstrument = useCallback(
        (instrumentName) => {
            insertNewInstrument(instrumentName);
        },
        [insertNewInstrument]
    );

    const handleBlur = useCallback(
        (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.relatedTarget)) {
                closeInstrumentLayerPanel();
            }
        },
        [closeInstrumentLayerPanel]
    );

    useEffect(() => {
        if (wrapperRef.current) {
            wrapperRef.current.focus();
        }
    }, []);

    return (
        <ParentWrapper tabIndex={-1} ref={wrapperRef} onBlur={handleBlur}>
            <InstrumentLayerWrapper>
                <h3>Instrument layers</h3>
                {Object.entries(INSTRUMENT_NAMES).map(([instrument, icon]) => (
                    // eslint-disable-next-line react-perf/jsx-no-new-function-as-prop
                    <InstrumentIcon key={instrument} onClick={() => onAddInstrument(instrument)}>
                        {icon}
                    </InstrumentIcon>
                ))}
            </InstrumentLayerWrapper>
        </ParentWrapper>
    );
};

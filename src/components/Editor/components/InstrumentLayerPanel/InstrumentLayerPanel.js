import React, { useCallback, useContext, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { useInstrumentRecordingsOperations } from '../../../../hooks/useInstrumentRecordingsOperations';
import { PanelContext } from '../../../../hooks/usePanelState';
import { INSTRUMENT_NAMES } from '../../../../providers/InstrumentsProvider';

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
    background-color: #f9f9f9;
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
    border-radius: 20px;
    padding: 30px;
    border: 1px solid #ddd;

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
    background-color: #ffffff;
    border-radius: 50%;
    margin: 0 20px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
    transition:
        transform 0.3s ease,
        box-shadow 0.3s ease;

    &:hover {
        transform: scale(1.1);
        box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);
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

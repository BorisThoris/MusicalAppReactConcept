/* eslint-disable react-perf/jsx-no-new-function-as-prop */
/* eslint-disable no-alert */
import React, { useCallback, useContext, useEffect, useState } from 'react';
import styled from 'styled-components';
import { recreateEvents } from '../../../../globalHelpers/createSound';
import { PanelContext } from '../../../../hooks/usePanelState';
import { InstrumentRecordingsContext } from '../../../../providers/InstrumentsProvider';
import { BeatFileRow } from './BeatRow';

const Backdrop = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
`;

const ModalWrapper = styled.div`
    display: flex;
    flex-direction: column;
    width: 80%;
    max-width: 600px;
    background-color: #f9f9f9;
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
    border-radius: 20px;
    padding: 30px;
    border: 1px solid #ddd;
    position: relative;
    z-index: 1001;
`;

const CloseIcon = styled.div`
    position: absolute;
    top: 10px;
    right: 10px;
    cursor: pointer;
    font-size: 18px;
    font-weight: bold;
`;

const FileSystem = styled.div`
    display: flex;
    flex-direction: column;
    margin-top: 20px;
`;

const FileRow = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 0;
    border-bottom: 1px solid #ddd;

    & > div {
        flex: 1;
        text-align: center;
    }
`;

const InputWrapper = styled.div`
    display: flex;
    margin-top: 20px;

    & > input {
        flex: 1;
        padding: 5px;
        margin-right: 10px;
    }
`;

const SaveButton = styled.button`
    background-color: green;
    color: white;
    border: none;
    cursor: pointer;
    padding: 5px 10px;
    border-radius: 3px;
`;

export const SavePanel = () => {
    const [beats, setBeats] = useState([]);
    const [beatName, setBeatName] = useState('');
    const { closeSavePanel } = useContext(PanelContext);
    const { overlapGroups, setOverlapGroups } = useContext(InstrumentRecordingsContext);

    useEffect(() => {
        const savedBeats = JSON.parse(localStorage.getItem('beats')) || [];
        setBeats(savedBeats);
    }, []);

    const handleSave = useCallback(() => {
        if (!beatName.trim()) {
            alert('Beat name cannot be empty.');
            return;
        }

        const newBeat = {
            data: overlapGroups,
            date: new Date().toLocaleString(),
            name: beatName.trim()
        };

        const existingBeats = JSON.parse(localStorage.getItem('beats')) || [];
        if (existingBeats.some((beat) => beat.name === newBeat.name)) {
            alert('A beat with this name already exists.');
            return;
        }

        const updatedBeats = [...existingBeats, newBeat];
        localStorage.setItem('beats', JSON.stringify(updatedBeats));
        setBeats(updatedBeats);
        setBeatName('');
        alert('Beat saved successfully.');
    }, [beatName, overlapGroups]);

    const handleDelete = useCallback(
        (name) => {
            const updatedBeats = beats.filter((beat) => beat.name !== name);
            localStorage.setItem('beats', JSON.stringify(updatedBeats));
            setBeats(updatedBeats);
        },
        [beats]
    );

    const handleLoad = useCallback(
        (name) => {
            const beatToLoad = beats.find((beat) => beat.name === name);
            if (beatToLoad) {
                let savedOverlapGroups = JSON.parse(JSON.stringify(beatToLoad.data));
                savedOverlapGroups = recreateEvents(savedOverlapGroups);
                setOverlapGroups(savedOverlapGroups);

                closeSavePanel();
            } else {
                alert('Beat not found.');
            }
        },
        [beats, setOverlapGroups, closeSavePanel]
    );

    const onBeatNameChange = useCallback((e) => {
        setBeatName(e.target.value);
    }, []);

    const handleBackdropClick = useCallback(
        (e) => {
            if (e.target === e.currentTarget) {
                closeSavePanel();
            }
        },
        [closeSavePanel]
    );

    return (
        <Backdrop onClick={handleBackdropClick}>
            <ModalWrapper>
                <CloseIcon onClick={closeSavePanel}>X</CloseIcon>

                <FileSystem>
                    {beats.map((beat, index) => (
                        <BeatFileRow key={index} beat={beat} onLoad={handleLoad} onDelete={handleDelete} />
                    ))}
                </FileSystem>
                <InputWrapper>
                    <input type="text" value={beatName} onChange={onBeatNameChange} placeholder="Enter beat name" />
                    <SaveButton onClick={handleSave}>Save Beat</SaveButton>
                </InputWrapper>
            </ModalWrapper>
        </Backdrop>
    );
};

export default SavePanel;

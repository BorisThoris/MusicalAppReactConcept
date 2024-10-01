import PropTypes from 'prop-types';
import React, { useCallback, useContext, useState } from 'react';
import styled from 'styled-components';
import { PanelContext } from '../../../../hooks/usePanelState';
import { CollisionsContext } from '../../../../providers/CollisionsProvider/CollisionsProvider';
import Modal from '../Modal/Modal';

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

export const SavePanel = ({ onClose }) => {
    const [beatName, setBeatName] = useState('');
    const { closeSavePanel } = useContext(PanelContext);
    const { overlapGroups } = useContext(CollisionsContext);

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

        const savedBeats = JSON.parse(localStorage.getItem('beats')) || [];
        savedBeats.push(newBeat);
        localStorage.setItem('beats', JSON.stringify(savedBeats));

        alert('Beat saved successfully.');
        onClose();
    }, [beatName, overlapGroups, onClose]);

    const handleSaveBeat = useCallback((e) => {
        setBeatName(e.target.value);
    }, []);

    return (
        <Modal onClose={closeSavePanel}>
            <InputWrapper>
                <input type="text" value={beatName} onChange={handleSaveBeat} placeholder="Enter beat name" />
                <SaveButton onClick={handleSave}>Save Beat</SaveButton>
            </InputWrapper>
        </Modal>
    );
};

SavePanel.propTypes = {
    onClose: PropTypes.func.isRequired
};

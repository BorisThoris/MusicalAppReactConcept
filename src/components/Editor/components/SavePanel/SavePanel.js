import React, { useCallback, useContext, useState } from 'react';
import styled from 'styled-components';
import { PanelContext } from '../../../../hooks/usePanelState';
import { CollisionsContext } from '../../../../providers/CollisionsProvider/CollisionsProvider';
import { useNotification } from '../../../../providers/NotificationProvider/NotificationProvider';
import Modal from '../Modal/Modal';

const InputWrapper = styled.div`
    display: flex;
    margin-top: 20px;
    gap: ${({ theme }) => theme.spacing[3]};

    & > input {
        flex: 1;
        padding: ${({ theme }) => theme.spacing[2]} ${({ theme }) => theme.spacing[3]};
        border-radius: ${({ theme }) => theme.borderRadius.base};
        border: 1px solid ${({ theme }) => theme.colors.glass.borderSecondary};
        background: ${({ theme }) => theme.colors.glass.secondary};
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        color: ${({ theme }) => theme.colors.semantic.text.primary};
        font-size: ${({ theme }) => theme.typography.fontSize.base};
        transition: all ${({ theme }) => theme.transitions.duration.fast}
            ${({ theme }) => theme.transitions.easing.ease};

        &::placeholder {
            color: ${({ theme }) => theme.colors.semantic.text.tertiary};
        }

        &:focus {
            outline: none;
            border-color: ${({ theme }) => theme.colors.semantic.border.focus};
            background: ${({ theme }) => theme.colors.glass.elevated};
            box-shadow: ${({ theme }) => theme.shadows.glass};
        }
    }
`;

const SaveButton = styled.button`
    background: ${({ theme }) => theme.colors.glass.elevated};
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    color: ${({ theme }) => theme.colors.semantic.text.primary};
    border: 1px solid ${({ theme }) => theme.colors.glass.border};
    cursor: pointer;
    padding: ${({ theme }) => theme.spacing[2]} ${({ theme }) => theme.spacing[4]};
    border-radius: ${({ theme }) => theme.borderRadius.base};
    font-size: ${({ theme }) => theme.typography.fontSize.base};
    font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
    transition: all ${({ theme }) => theme.transitions.duration.fast} ${({ theme }) => theme.transitions.easing.ease};
    box-shadow: ${({ theme }) => theme.shadows.glass};

    &:hover {
        background: ${({ theme }) => theme.colors.glass.primary};
        transform: translateY(-1px);
        box-shadow: ${({ theme }) => theme.shadows.glassLg};
    }

    &:active {
        transform: translateY(0);
    }
`;

export const SavePanel = () => {
    const [beatName, setBeatName] = useState('');
    const { closeSavePanel } = useContext(PanelContext);
    const { overlapGroups } = useContext(CollisionsContext);
    const { confirm, showError, showSuccess } = useNotification();

    const handleSave = useCallback(async () => {
        if (!beatName.trim()) {
            showError('Beat name cannot be empty.');
            return;
        }

        const newBeat = {
            data: overlapGroups,
            date: new Date().toLocaleString(),
            name: beatName.trim()
        };

        const savedBeats = JSON.parse(localStorage.getItem('beats')) || [];

        const existingIndex = savedBeats.findIndex((beat) => beat.name === newBeat.name);

        if (existingIndex !== -1) {
            // Prompt for confirmation if the beat name already exists
            const confirmOverwrite = await confirm(
                `A beat with the name "${newBeat.name}" already exists. Do you want to overwrite it?`
            );

            if (!confirmOverwrite) {
                return;
            }

            // Overwrite the existing beat
            savedBeats[existingIndex] = newBeat;
        } else {
            // Add the new beat
            savedBeats.push(newBeat);
        }

        localStorage.setItem('beats', JSON.stringify(savedBeats));
        showSuccess('Beat saved successfully!');
        closeSavePanel();
    }, [beatName, closeSavePanel, overlapGroups, showError, showSuccess, confirm]);

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

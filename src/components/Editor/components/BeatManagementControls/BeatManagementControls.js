import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { useAddInstrumentLayer } from '../../../../hooks/useAddInstrumentLayer';
import { PanelContext } from '../../../../hooks/usePanelState';
import { CollisionsContext } from '../../../../providers/CollisionsProvider/CollisionsProvider';

const Container = styled.div`
    display: flex;
    flex-direction: column;
`;

const ButtonGroup = styled.div`
    display: flex;
    gap: ${({ theme }) => theme.spacing[2]};
    margin-top: ${({ theme }) => theme.spacing[2]};
`;

const StyledButton = styled.button`
    padding: ${({ theme }) => theme.spacing[2]} ${({ theme }) => theme.spacing[3]};
    font-size: ${({ theme }) => theme.typography.fontSize.base};
    background-color: ${({ theme }) => theme.colors.semantic.interactive.primary};
    color: ${({ theme }) => theme.colors.semantic.text.inverse};
    border: none;
    border-radius: ${({ theme }) => theme.borderRadius.base};
    cursor: pointer;
    transition: background-color ${({ theme }) => theme.transitions.duration.fast}
        ${({ theme }) => theme.transitions.easing.ease};

    &:hover {
        background-color: ${({ theme }) => theme.colors.primary[600]};
    }
`;

const Title = styled.h2`
    margin-bottom: ${({ theme }) => theme.spacing[5]};
    cursor: pointer;
    color: ${({ theme }) => theme.colors.semantic.text.primary};
    font-size: ${({ theme }) => theme.typography.fontSize['2xl']};
    font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
`;

const EditableSpan = styled.span`
    border-bottom: 1px dashed ${({ theme }) => theme.colors.semantic.text.primary};
    cursor: pointer;
    color: ${({ theme }) => theme.colors.semantic.text.primary};
`;

const Input = styled.input`
    padding: ${({ theme }) => theme.spacing[2]};
    font-size: ${({ theme }) => theme.typography.fontSize.base};
    margin-bottom: ${({ theme }) => theme.spacing[2]};
    max-width: 200px;
    width: 100%;
    border: 1px solid ${({ theme }) => theme.colors.semantic.border.primary};
    border-radius: ${({ theme }) => theme.borderRadius.base};
    background-color: ${({ theme }) => theme.colors.semantic.surface.primary};
    color: ${({ theme }) => theme.colors.semantic.text.primary};

    &:focus {
        outline: none;
        border-color: ${({ theme }) => theme.colors.semantic.border.focus};
        box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.semantic.border.focus}20;
    }
`;

export const BeatManagementControls = () => {
    const { openLoadPanel, openSavePanel } = useContext(PanelContext);
    const { addTimeline, changeBeatName, hasChanged, selectedBeat, updateCurrentBeat } = useContext(CollisionsContext);

    const [isEditingName, setIsEditingName] = useState(false);
    const [newBeatName, setNewBeatName] = useState(selectedBeat?.name || '');
    const inputRef = useRef(null);

    const handleNameChange = useCallback(() => {
        if (newBeatName.trim() !== '') {
            changeBeatName(newBeatName.trim());
            setIsEditingName(false);
        }
    }, [newBeatName, changeBeatName]);

    const onSetNewBeatName = useCallback((e) => {
        setNewBeatName(e.target.value);
    }, []);

    const onSetIsEditingName = useCallback(() => {
        setIsEditingName(true);
    }, []);

    const handleKeyDown = useCallback(
        (e) => {
            if (e.key === 'Enter') {
                handleNameChange();
            }
        },
        [handleNameChange]
    );

    useEffect(() => {
        if (isEditingName && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isEditingName]);

    const onAddLayer = useCallback(() => {
        addTimeline();
    }, [addTimeline]);

    return (
        <Container>
            <Title>
                Current Beat:{' '}
                {isEditingName ? (
                    <Input
                        type="text"
                        placeholder="New Beat Name"
                        value={newBeatName}
                        defaultValue={selectedBeat?.name}
                        onChange={onSetNewBeatName}
                        onBlur={handleNameChange}
                        onKeyDown={handleKeyDown}
                        ref={inputRef}
                    />
                ) : (
                    <EditableSpan onClick={onSetIsEditingName}>{selectedBeat?.name || 'None'}</EditableSpan>
                )}
            </Title>

            <ButtonGroup>
                <StyledButton onClick={openLoadPanel}>💾 Load</StyledButton>
                {hasChanged && <StyledButton onClick={updateCurrentBeat}>🔄 Update</StyledButton>}
                <StyledButton onClick={onAddLayer}>➕ Add Layer</StyledButton>
                <StyledButton onClick={openSavePanel}>💾 Save</StyledButton>
            </ButtonGroup>
        </Container>
    );
};

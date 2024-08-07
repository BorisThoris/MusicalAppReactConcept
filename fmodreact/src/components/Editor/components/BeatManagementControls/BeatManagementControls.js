import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { useAddInstrumentLayer } from '../../../../hooks/useAddInstrumentLayer';
import { PanelContext } from '../../../../hooks/usePanelState';
import { InstrumentRecordingsContext } from '../../../../providers/InstrumentsProvider';

const Container = styled.div`
    display: flex;
    flex-direction: column;
`;

const ButtonGroup = styled.div`
    display: flex;
    gap: 10px;
    margin-top: 10px;
`;

const StyledButton = styled.button`
    padding: 10px 15px;
    font-size: 16px;
`;

const Title = styled.h2`
    margin-bottom: 20px;
    cursor: pointer;
`;

const EditableSpan = styled.span`
    border-bottom: 1px dashed #000;
    cursor: pointer;
`;

const Input = styled.input`
    padding: 10px;
    font-size: 16px;
    margin-bottom: 10px;
    max-width: 200px;
    width: 100%;
`;

export const BeatManagementControls = () => {
    const { onAddLayer } = useAddInstrumentLayer();
    const { openLoadPanel, openSavePanel } = useContext(PanelContext);
    const { changeBeatName, hasChanged, selectedBeat, updateCurrentBeat } = useContext(InstrumentRecordingsContext);

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

export default BeatManagementControls;

import PropTypes from 'prop-types';
import React, { useCallback, useContext } from 'react';
import styled from 'styled-components';
import { useBeatActions } from '../../../../hooks/useBeatActions';
import { PanelContext } from '../../../../hooks/usePanelState';
import { CollisionsContext } from '../../../../providers/CollisionsProvider/CollisionsProvider';
import Modal from '../Modal/Modal';
import { BeatFileRow } from './BeatRow';

const FileSystem = styled.div`
    display: flex;
    flex-direction: column;
    margin-top: 20px;
`;

export const LoadPanel = () => {
    const { closeLoadPanel } = useContext(PanelContext);
    const { beats, saveBeatsToLocalStorage } = useContext(CollisionsContext);

    const { handleDelete, handleDuplicate, handleLoad } = useBeatActions({
        beats,
        closeLoadPanel,
        saveBeatsToLocalStorage
    });

    const handleLoadCallback = useCallback((name) => () => handleLoad(name), [handleLoad]);
    const handleDeleteCallback = useCallback((name) => () => handleDelete(name), [handleDelete]);
    const handleDuplicateCallback = useCallback((name) => () => handleDuplicate(name), [handleDuplicate]);

    return (
        <Modal onClose={closeLoadPanel}>
            <FileSystem>
                {beats.map((beat) => (
                    <BeatFileRow
                        key={beat.name} // ← use a unique, stable key
                        beat={beat}
                        onLoad={handleLoadCallback(beat.name)}
                        onDelete={handleDeleteCallback(beat.name)}
                        onDuplicate={handleDuplicateCallback(beat.name)}
                    />
                ))}
            </FileSystem>
        </Modal>
    );
};

LoadPanel.propTypes = {
    // These props aren’t passed in directly—they come from context/hooks.
    // You can remove or adjust these PropTypes if you’d like.
    beatName: PropTypes.string,
    beats: PropTypes.array,
    closeLoadPanel: PropTypes.func,
    overlapGroups: PropTypes.array,
    saveBeatsToLocalStorage: PropTypes.func,
    selectedBeat: PropTypes.object,
    setBeatName: PropTypes.func,
    setOverlapGroups: PropTypes.func,
    setSelectedBeat: PropTypes.func
};

export default LoadPanel;

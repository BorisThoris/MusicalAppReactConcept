import PropTypes from 'prop-types';
import React, { useCallback } from 'react';
import styled from 'styled-components';

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

const LoadButton = styled.button`
    background-color: blue;
    color: white;
    border: none;
    cursor: pointer;
    padding: 5px 10px;
    border-radius: 3px;
`;

const DeleteButton = styled.button`
    background-color: red;
    color: white;
    border: none;
    cursor: pointer;
    padding: 5px 10px;
    border-radius: 3px;
`;

export const BeatFileRow = ({ beat, onDelete, onLoad }) => {
    const handleLoadBeat = useCallback(() => {
        onLoad(beat.name);
    }, [beat.name, onLoad]);

    const handleDeleteBeat = useCallback(() => {
        onDelete(beat.name);
    }, [beat.name, onDelete]);

    return (
        <FileRow>
            <div>{beat.name}</div>
            <div>{beat.date}</div>
            <LoadButton onClick={handleLoadBeat}>Load</LoadButton>
            <DeleteButton onClick={handleDeleteBeat}>Delete</DeleteButton>
        </FileRow>
    );
};

BeatFileRow.propTypes = {
    beat: PropTypes.shape({
        date: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired
    }).isRequired,
    onDelete: PropTypes.func.isRequired,
    onLoad: PropTypes.func.isRequired
};

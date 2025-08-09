import PropTypes from 'prop-types';
import React, { useCallback } from 'react';
import styled from 'styled-components';

const FileRow = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: ${({ theme }) => theme.spacing[2]} 0;
    border-bottom: 1px solid ${({ theme }) => theme.colors.semantic.border.primary};

    & > div {
        flex: 1;
        text-align: center;
        color: ${({ theme }) => theme.colors.semantic.text.primary};
        font-size: ${({ theme }) => theme.typography.fontSize.sm};
    }
`;

const LoadButton = styled.button`
    background-color: ${({ theme }) => theme.colors.semantic.interactive.primary};
    color: ${({ theme }) => theme.colors.semantic.text.inverse};
    border: none;
    cursor: pointer;
    padding: ${({ theme }) => theme.spacing[1]} ${({ theme }) => theme.spacing[2]};
    border-radius: ${({ theme }) => theme.borderRadius.base};
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
    transition: background-color ${({ theme }) => theme.transitions.duration.fast}
        ${({ theme }) => theme.transitions.easing.ease};

    &:hover {
        background-color: ${({ theme }) => theme.colors.primary[600]};
    }
`;

const DeleteButton = styled.button`
    background-color: ${({ theme }) => theme.colors.semantic.interactive.error};
    color: ${({ theme }) => theme.colors.semantic.text.inverse};
    border: none;
    cursor: pointer;
    padding: ${({ theme }) => theme.spacing[1]} ${({ theme }) => theme.spacing[2]};
    border-radius: ${({ theme }) => theme.borderRadius.base};
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
    transition: background-color ${({ theme }) => theme.transitions.duration.fast}
        ${({ theme }) => theme.transitions.easing.ease};

    &:hover {
        background-color: ${({ theme }) => theme.colors.error[600]};
    }
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

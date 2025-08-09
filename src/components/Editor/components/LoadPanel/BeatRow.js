import PropTypes from 'prop-types';
import React, { useCallback } from 'react';
import styled from 'styled-components';

const FileRow = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: ${({ theme }) => theme.spacing[3]} ${({ theme }) => theme.spacing[4]};
    border-bottom: 1px solid ${({ theme }) => theme.colors.glass.borderSecondary};
    background: ${({ theme }) => theme.colors.glass.secondary};
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border-radius: ${({ theme }) => theme.borderRadius.base};
    margin-bottom: ${({ theme }) => theme.spacing[2]};
    border: 1px solid ${({ theme }) => theme.colors.glass.borderSecondary};
    transition: all ${({ theme }) => theme.transitions.duration.fast} ${({ theme }) => theme.transitions.easing.ease};

    &:hover {
        background: ${({ theme }) => theme.colors.glass.elevated};
        border-color: ${({ theme }) => theme.colors.glass.border};
        box-shadow: ${({ theme }) => theme.shadows.glass};
        transform: translateY(-1px);
    }

    & > div {
        flex: 1;
        text-align: center;
        color: ${({ theme }) => theme.colors.semantic.text.primary};
        font-size: ${({ theme }) => theme.typography.fontSize.sm};
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
    }
`;

const LoadButton = styled.button`
    background: ${({ theme }) => theme.colors.glass.elevated};
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    color: ${({ theme }) => theme.colors.semantic.text.primary};
    border: 1px solid ${({ theme }) => theme.colors.glass.border};
    cursor: pointer;
    padding: ${({ theme }) => theme.spacing[2]} ${({ theme }) => theme.spacing[3]};
    border-radius: ${({ theme }) => theme.borderRadius.base};
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
    font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
    transition: all ${({ theme }) => theme.transitions.duration.fast} ${({ theme }) => theme.transitions.easing.ease};
    box-shadow: ${({ theme }) => theme.shadows.glass};
    margin-left: ${({ theme }) => theme.spacing[2]};

    &:hover {
        background: ${({ theme }) => theme.colors.glass.primary};
        transform: translateY(-1px);
        box-shadow: ${({ theme }) => theme.shadows.glassLg};
    }

    &:active {
        transform: translateY(0);
    }
`;

const DeleteButton = styled.button`
    background: ${({ theme }) => theme.colors.glass.inverse};
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    color: ${({ theme }) => theme.colors.semantic.text.primary};
    border: 1px solid ${({ theme }) => theme.colors.glass.borderSecondary};
    cursor: pointer;
    padding: ${({ theme }) => theme.spacing[2]} ${({ theme }) => theme.spacing[3]};
    border-radius: ${({ theme }) => theme.borderRadius.base};
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
    font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
    transition: all ${({ theme }) => theme.transitions.duration.fast} ${({ theme }) => theme.transitions.easing.ease};
    box-shadow: ${({ theme }) => theme.shadows.glass};
    margin-left: ${({ theme }) => theme.spacing[2]};

    &:hover {
        background: ${({ theme }) => theme.colors.glass.elevated};
        border-color: ${({ theme }) => theme.colors.glass.border};
        transform: translateY(-1px);
        box-shadow: ${({ theme }) => theme.shadows.glassLg};
    }

    &:active {
        transform: translateY(0);
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

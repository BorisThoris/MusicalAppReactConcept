import PropTypes from 'prop-types';
import React from 'react';
import { CopyIcon, Header, PlayIcon, TrashIcon } from './Panel.styles';

export const EventHeader = ({ onDelete, onDuplicate, onPlay }) => {
    return (
        <Header>
            <PlayIcon onClick={onPlay}>▶</PlayIcon>
            <CopyIcon onClick={onDuplicate}>Copy</CopyIcon>
            <TrashIcon onClick={onDelete}>🗑️</TrashIcon>
        </Header>
    );
};

EventHeader.propTypes = {
    onDelete: PropTypes.func.isRequired,
    onDuplicate: PropTypes.func.isRequired,
    onPlay: PropTypes.func.isRequired
};

export default EventHeader;

import PropTypes from 'prop-types';
import React from 'react';
import { CopyIcon, Header, PlayIcon, TrashIcon } from './Panel.styles';

export const EventHeader = ({ onCopy, onDelete, onPlay }) => (
    <Header>
        {onPlay && <PlayIcon onClick={onPlay}>▶</PlayIcon>}
        <CopyIcon onClick={onCopy}>Copy</CopyIcon>
        <TrashIcon onClick={onDelete}>🗑️</TrashIcon>
    </Header>
);

EventHeader.propTypes = {
    onCopy: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
    onPlay: PropTypes.func.isRequired
};

export default EventHeader;

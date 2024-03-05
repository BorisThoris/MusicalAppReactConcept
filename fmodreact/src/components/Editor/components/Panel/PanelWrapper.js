import React from 'react';
import { CloseIcon, PanelContainer, SpeechBubbleArrow } from './Panel.styles';

export const PanelWrapper = ({ children, handleClose, isSpeechBubble, onClose, style, timelineState, x, y }) => (
    <PanelContainer x={x} y={y} style={style} timelineState={timelineState} isSpeechBubble={isSpeechBubble}>
        {handleClose && <CloseIcon onClick={handleClose}>X</CloseIcon>}
        {isSpeechBubble && <SpeechBubbleArrow />}
        {onClose && <CloseIcon onClick={onClose}>X</CloseIcon>}
        {children}
    </PanelContainer>
);

export default PanelWrapper;

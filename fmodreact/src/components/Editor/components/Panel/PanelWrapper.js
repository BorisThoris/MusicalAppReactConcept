import React from 'react';
import { CloseIcon, PanelContainer, SpeechBubbleArrow } from './Panel.styles';

export const PanelWrapper = ({ children, isSpeechBubble, onClose, style, timelineState, x, y }) => (
    <PanelContainer x={x} y={y} style={style} timelineState={timelineState} isSpeechBubble={isSpeechBubble}>
        {isSpeechBubble && <SpeechBubbleArrow />}
        {onClose && <CloseIcon onClick={onClose}>X</CloseIcon>}
        {children}
    </PanelContainer>
);

export default PanelWrapper;

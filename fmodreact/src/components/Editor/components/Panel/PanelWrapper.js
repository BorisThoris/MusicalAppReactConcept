import PropTypes from 'prop-types';
import React from 'react';
import { CloseIcon, PanelContainer, SpeechBubbleArrow } from './Panel.styles';

export const PanelWrapper = ({ children, handleClose, isSpeechBubble, onClose, style, timelineState, x, y }) => (
    <PanelContainer x={x} y={y} style={style} timelinestate={timelineState} isspeechbubble={isSpeechBubble}>
        {handleClose && <CloseIcon onClick={handleClose}>X</CloseIcon>}
        {isSpeechBubble && <SpeechBubbleArrow />}
        {onClose && <CloseIcon onClick={onClose}>X</CloseIcon>}
        {children}
    </PanelContainer>
);

// Define PropTypes
PanelWrapper.propTypes = {
    children: PropTypes.node, // React node, because it can be any renderable React content
    handleClose: PropTypes.func, // Function type for event handling
    isSpeechBubble: PropTypes.bool, // Boolean to determine if the panel is a speech bubble
    onClose: PropTypes.func, // Function type for event handling
    style: PropTypes.object, // Object type for inline styles
    timelineState: PropTypes.any, // Any type, specify further if possible
    x: PropTypes.number.isRequired, // Number and is required
    y: PropTypes.number.isRequired // Number and is required
};

export default PanelWrapper;

import PropTypes from 'prop-types';
import React, { useMemo } from 'react';
import { CloseIcon, PanelContainer, SpeechBubbleArrow } from './Panel.styles';

export const PanelWrapper = ({
    children,
    handleClose,
    isSpeechBubble,
    onClose,
    panelCompensationOffset,
    style,
    x,
    y
}) => {
    // Memoize the timeline state object to avoid creating new objects on every render
    const timelineState = useMemo(() => ({ panelCompensationOffset }), [panelCompensationOffset]);

    // Memoize the panel container props to avoid creating new objects on every render
    const panelContainerProps = useMemo(
        () => ({
            isspeechbubble: isSpeechBubble,
            style,
            timelinestate: timelineState,
            x,
            y
        }),
        [x, y, style, timelineState, isSpeechBubble]
    );

    return (
        <PanelContainer {...panelContainerProps}>
            {handleClose && <CloseIcon onClick={handleClose}>X</CloseIcon>}
            {isSpeechBubble && <SpeechBubbleArrow />}
            {onClose && <CloseIcon onClick={onClose}>X</CloseIcon>}
            {children}
        </PanelContainer>
    );
};

// Define PropTypes
PanelWrapper.propTypes = {
    children: PropTypes.node, // React node, because it can be any renderable React content
    handleClose: PropTypes.func, // Function type for event handling
    isSpeechBubble: PropTypes.bool, // Boolean to determine if the panel is a speech bubble
    onClose: PropTypes.func, // Function type for event handling
    panelCompensationOffset: PropTypes.object, // Object containing panelCompensationOffset
    style: PropTypes.object, // Object type for inline styles
    x: PropTypes.number.isRequired, // Number and is required
    y: PropTypes.number.isRequired // Number and is required
};

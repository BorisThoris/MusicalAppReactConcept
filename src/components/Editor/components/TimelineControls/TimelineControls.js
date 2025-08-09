import React, { memo, useCallback } from 'react';
import styled from 'styled-components';
import { useTimeline } from '../../../../hooks/useTimeline';

const ControlsContainer = styled.div`
    position: absolute;
    top: 10px;
    right: 10px;
    display: flex;
    gap: 8px;
    align-items: center;
    z-index: 1000;
`;

const ControlButton = styled.button`
    background: ${({ theme }) => theme.colors.glass.primary};
    border: 1px solid ${({ theme }) => theme.colors.glass.border};
    border-radius: ${({ theme }) => theme.borderRadius.md};
    color: ${({ theme }) => theme.colors.semantic.text.primary};
    padding: 6px 12px;
    font-size: 12px;
    cursor: pointer;
    transition: all ${({ theme }) => theme.transitions.duration.fast} ${({ theme }) => theme.transitions.easing.ease};
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);

    &:hover {
        background: ${({ theme }) => theme.colors.glass.secondary};
        border-color: ${({ theme }) => theme.colors.glass.borderSecondary};
        transform: translateY(-1px);
    }

    &:active {
        transform: translateY(0);
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        transform: none;
    }
`;

const ZoomControls = styled.div`
    display: flex;
    gap: 4px;
    align-items: center;
    background: ${({ theme }) => theme.colors.glass.primary};
    border: 1px solid ${({ theme }) => theme.colors.glass.border};
    border-radius: ${({ theme }) => theme.borderRadius.md};
    padding: 4px;
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
`;

const ZoomButton = styled(ControlButton)`
    padding: 4px 8px;
    font-size: 14px;
    font-weight: bold;
    min-width: 32px;
`;

const ZoomLevel = styled.span`
    color: ${({ theme }) => theme.colors.semantic.text.primary};
    font-size: 12px;
    font-weight: 500;
    min-width: 40px;
    text-align: center;
    user-select: none;
`;

const NavigationControls = styled.div`
    display: flex;
    gap: 4px;
    align-items: center;
`;

const TimelineControls = memo(() => {
    const {
        centerOnTime,
        fitToView,
        getTimelineDurationMs,
        resetView,
        scrollPosition,
        updateScrollPosition,
        updateZoomLevel,
        zoomLevel
    } = useTimeline();

    const handleZoomIn = useCallback(() => {
        updateZoomLevel(zoomLevel * 1.2);
    }, [updateZoomLevel, zoomLevel]);

    const handleZoomOut = useCallback(() => {
        updateZoomLevel(zoomLevel / 1.2);
    }, [updateZoomLevel, zoomLevel]);

    const handleResetView = useCallback(() => {
        resetView();
    }, [resetView]);

    const handleFitToView = useCallback(() => {
        fitToView();
    }, [fitToView]);

    const handleGoToStart = useCallback(() => {
        updateScrollPosition(0);
    }, [updateScrollPosition]);

    const handleGoToEnd = useCallback(() => {
        const durationMs = getTimelineDurationMs();
        const endTimePixels = durationMs / (durationMs / 1000); // Convert to pixels
        updateScrollPosition(Math.max(0, endTimePixels - window.innerWidth));
    }, [getTimelineDurationMs, updateScrollPosition]);

    const handleGoToMiddle = useCallback(() => {
        const durationMs = getTimelineDurationMs();
        centerOnTime(durationMs / 2);
    }, [getTimelineDurationMs, centerOnTime]);

    const formatZoomLevel = (zoom) => {
        return `${Math.round(zoom * 100)}%`;
    };

    return (
        <ControlsContainer>
            <NavigationControls>
                <ControlButton onClick={handleGoToStart} title="Go to start">
                    ⏮
                </ControlButton>
                <ControlButton onClick={handleGoToMiddle} title="Go to middle">
                    ⏯
                </ControlButton>
                <ControlButton onClick={handleGoToEnd} title="Go to end">
                    ⏭
                </ControlButton>
            </NavigationControls>

            <ZoomControls>
                <ZoomButton onClick={handleZoomOut} title="Zoom out" disabled={zoomLevel <= 0.1}>
                    -
                </ZoomButton>
                <ZoomLevel>{formatZoomLevel(zoomLevel)}</ZoomLevel>
                <ZoomButton onClick={handleZoomIn} title="Zoom in" disabled={zoomLevel >= 5}>
                    +
                </ZoomButton>
            </ZoomControls>

            <ControlButton onClick={handleFitToView} title="Fit to view">
                🔍
            </ControlButton>
            <ControlButton onClick={handleResetView} title="Reset view">
                ↺
            </ControlButton>
        </ControlsContainer>
    );
});

export default TimelineControls;

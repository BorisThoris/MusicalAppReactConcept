import React, { memo } from 'react';
import styled from 'styled-components';
import { useTimeline } from '../../../../hooks/useTimeline';

const DemoContainer = styled.div`
    position: absolute;
    bottom: 10px;
    left: 10px;
    background: ${({ theme }) => theme.colors.glass.primary};
    border: 1px solid ${({ theme }) => theme.colors.glass.border};
    border-radius: ${({ theme }) => theme.borderRadius.md};
    padding: 12px;
    font-size: 12px;
    color: ${({ theme }) => theme.colors.semantic.text.primary};
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    z-index: 1000;
    min-width: 200px;
`;

const DemoSection = styled.div`
    margin-bottom: 8px;

    &:last-child {
        margin-bottom: 0;
    }
`;

const DemoLabel = styled.span`
    font-weight: 500;
    color: ${({ theme }) => theme.colors.semantic.text.secondary};
    margin-right: 8px;
`;

const DemoValue = styled.span`
    font-family: monospace;
    color: ${({ theme }) => theme.colors.semantic.text.primary};
`;

const DemoInstructions = styled.div`
    font-size: 11px;
    color: ${({ theme }) => theme.colors.semantic.text.secondary};
    margin-top: 8px;
    padding-top: 8px;
    border-top: 1px solid ${({ theme }) => theme.colors.glass.border};
`;

const TimelineDemo = memo(() => {
    const {
        calculatedStageWidth,
        effectiveStageWidth,
        isDragging,
        pixelsToTime,
        scrollPosition,
        timeToPixels,
        zoomLevel
    } = useTimeline();

    const formatTime = (ms) => {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    const formatPixels = (pixels) => {
        return `${Math.round(pixels)}px`;
    };

    return (
        <DemoContainer>
            <DemoSection>
                <DemoLabel>Zoom:</DemoLabel>
                <DemoValue>{Math.round(zoomLevel * 100)}%</DemoValue>
            </DemoSection>

            <DemoSection>
                <DemoLabel>Scroll:</DemoLabel>
                <DemoValue>{formatPixels(scrollPosition)}</DemoValue>
            </DemoSection>

            <DemoSection>
                <DemoLabel>Stage Width:</DemoLabel>
                <DemoValue>{formatPixels(calculatedStageWidth)}</DemoValue>
            </DemoSection>

            <DemoSection>
                <DemoLabel>Effective Width:</DemoLabel>
                <DemoValue>{formatPixels(effectiveStageWidth)}</DemoValue>
            </DemoSection>

            <DemoSection>
                <DemoLabel>Current Time:</DemoLabel>
                <DemoValue>{formatTime(pixelsToTime(scrollPosition))}</DemoValue>
            </DemoSection>

            <DemoSection>
                <DemoLabel>Status:</DemoLabel>
                <DemoValue>{isDragging ? 'Panning' : 'Ready'}</DemoValue>
            </DemoSection>

            <DemoInstructions>
                <div>🖱️ Mouse wheel: Zoom</div>
                <div>🖱️ Alt+Left drag: Pan</div>
                <div>⌨️ Ctrl+0: Reset zoom</div>
                <div>⌨️ Ctrl+/-: Zoom in/out</div>
                <div>⌨️ Home/End: Navigate</div>
            </DemoInstructions>
        </DemoContainer>
    );
});

export default TimelineDemo;

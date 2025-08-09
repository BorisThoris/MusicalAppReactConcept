import React, { createContext, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';
import { DEFAULT_TIMELINE_STATE, MARKERS_AND_TRACKER_OFFSET, TIMELINE_CONSTANTS } from '../constants/timeline';
import threeMinuteMs from '../globalConstants/songLimit';
import { usePixelRatio } from './PixelRatioProvider/PixelRatioProvider';

export const TimelineContext = createContext(DEFAULT_TIMELINE_STATE);

// Re-export constants for backward compatibility
export const { HEIGHT: TimelineHeight, MARKERS_HEIGHT: markersHeight, Y_OFFSET } = TIMELINE_CONSTANTS;
export const markersAndTrackerOffset = MARKERS_AND_TRACKER_OFFSET;

// Styled Timeline Container with enhanced glass morphism
const TimelineContainer = styled.div`
    background: ${({ theme }) => theme.colors.glass.tertiary};
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid ${({ theme }) => theme.colors.glass.borderSecondary};
    border-radius: ${({ theme }) => theme.borderRadius.xl};
    box-shadow: ${({ theme }) => theme.shadows.glass};
    transition: all ${({ theme }) => theme.transitions.duration.fast} ${({ theme }) => theme.transitions.easing.ease};
    position: relative;
    overflow: hidden;

    &:hover {
        box-shadow: ${({ theme }) => theme.shadows.glassLg};
        border-color: ${({ theme }) => theme.colors.glass.border};
    }
`;

// Extracted calculation function
const calculateStageWidth = (pixelToSecondRatio) => {
    const widthBasedOnLastSound = threeMinuteMs / pixelToSecondRatio;
    return window.innerWidth > widthBasedOnLastSound ? window.innerWidth : widthBasedOnLastSound;
};

export const TimelineProvider = ({ children }) => {
    const pixelToSecondRatio = usePixelRatio();
    const [timelineState, setTimelineState] = useState(DEFAULT_TIMELINE_STATE);
    const [scrollPosition, setScrollPosition] = useState(0);
    const [zoomLevel, setZoomLevel] = useState(1);
    const [isDragging, setIsDragging] = useState(false);
    const containerRef = useRef(null);

    // Timeline interaction refs
    const isPanning = useRef(false);
    const lastMousePos = useRef({ x: 0, y: 0 });

    // Function to update the timeline state
    const updateTimelineState = useCallback((updates) => {
        setTimelineState((prevState) => ({
            ...prevState,
            ...updates
        }));
    }, []);

    // Function to update scroll position
    const updateScrollPosition = useCallback((newPosition) => {
        setScrollPosition(Math.max(0, newPosition));
    }, []);

    // Function to update zoom level
    const updateZoomLevel = useCallback((newZoom) => {
        const clampedZoom = Math.max(0.1, Math.min(5, newZoom));
        setZoomLevel(clampedZoom);
    }, []);

    // Handle mouse wheel zoom
    const handleWheel = useCallback(
        (event) => {
            event.preventDefault();

            const delta = event.deltaY > 0 ? 0.9 : 1.1;
            const newZoom = zoomLevel * delta;

            // Zoom towards mouse position
            const rect = containerRef.current?.getBoundingClientRect();
            if (rect) {
                const mouseX = event.clientX - rect.left;
                const zoomRatio = newZoom / zoomLevel;
                const newScrollX = scrollPosition + mouseX - mouseX * zoomRatio;

                updateZoomLevel(newZoom);
                updateScrollPosition(newScrollX);
            }
        },
        [zoomLevel, scrollPosition, updateZoomLevel, updateScrollPosition]
    );

    // Handle mouse down for panning
    const handleMouseDown = useCallback((event) => {
        if (event.button === 1 || (event.button === 0 && event.altKey)) {
            // Middle mouse or Alt+Left
            event.preventDefault();
            isPanning.current = true;
            setIsDragging(true);
            lastMousePos.current = { x: event.clientX, y: event.clientY };
        }
    }, []);

    // Handle mouse move for panning
    const handleMouseMove = useCallback(
        (event) => {
            if (isPanning.current) {
                const deltaX = event.clientX - lastMousePos.current.x;
                const newScrollX = scrollPosition - deltaX;

                updateScrollPosition(newScrollX);
                lastMousePos.current = { x: event.clientX, y: event.clientY };
            }
        },
        [scrollPosition, updateScrollPosition]
    );

    // Handle mouse up to stop panning
    const handleMouseUp = useCallback(() => {
        if (isPanning.current) {
            isPanning.current = false;
            setIsDragging(false);
        }
    }, []);

    // Handle keyboard shortcuts
    const handleKeyDown = useCallback(
        (event) => {
            const { ctrlKey, key, shiftKey } = event;

            switch (key) {
                case '0':
                    if (ctrlKey) {
                        event.preventDefault();
                        // Reset zoom to 100%
                        updateZoomLevel(1);
                    }
                    break;
                case '=':
                case '+':
                    if (ctrlKey) {
                        event.preventDefault();
                        updateZoomLevel(zoomLevel * 1.2);
                    }
                    break;
                case '-':
                    if (ctrlKey) {
                        event.preventDefault();
                        updateZoomLevel(zoomLevel / 1.2);
                    }
                    break;
                case 'Home':
                    event.preventDefault();
                    updateScrollPosition(0);
                    break;
                case 'End':
                    event.preventDefault();
                    // Go to end of timeline
                    break;
                case ' ':
                    if (!ctrlKey && !shiftKey) {
                        event.preventDefault();
                        // Toggle play/pause if implemented
                    }
                    break;
                default:
                    break;
            }
        },
        [zoomLevel, updateZoomLevel, updateScrollPosition]
    );

    // Add event listeners for timeline interactions
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        container.addEventListener('wheel', handleWheel, { passive: false });
        container.addEventListener('mousedown', handleMouseDown);
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            container.removeEventListener('wheel', handleWheel);
            container.removeEventListener('mousedown', handleMouseDown);
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [handleWheel, handleMouseDown, handleMouseMove, handleMouseUp, handleKeyDown]);

    // Update cursor style based on interaction state
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        if (isPanning.current) {
            container.style.cursor = 'grabbing';
        } else {
            container.style.cursor = 'default';
        }
    }, []);

    // Function to reset zoom and scroll
    const resetView = useCallback(() => {
        setZoomLevel(1);
        setScrollPosition(0);
    }, []);

    // Function to fit timeline to view
    const fitToView = useCallback(() => {
        if (containerRef.current) {
            const containerWidth = containerRef.current.offsetWidth;
            const timelineWidth = calculateStageWidth(pixelToSecondRatio);
            const newZoom = containerWidth / timelineWidth;
            updateZoomLevel(newZoom);
            setScrollPosition(0);
        }
    }, [pixelToSecondRatio, updateZoomLevel]);

    // Function to center on specific time
    const centerOnTime = useCallback(
        (timeInMs) => {
            if (containerRef.current) {
                const containerWidth = containerRef.current.offsetWidth;
                const timeInPixels = timeInMs / pixelToSecondRatio;
                const newScrollPosition = timeInPixels - containerWidth / 2;
                updateScrollPosition(newScrollPosition);
            }
        },
        [pixelToSecondRatio, updateScrollPosition]
    );

    // Pre-calculate a width based on the maximum allowed sound duration
    const calculatedStageWidth = useMemo(() => {
        return calculateStageWidth(pixelToSecondRatio);
    }, [pixelToSecondRatio]);

    // Calculate effective stage width with zoom
    const effectiveStageWidth = useMemo(() => {
        return calculatedStageWidth * zoomLevel;
    }, [calculatedStageWidth, zoomLevel]);

    // Handle window resize
    useEffect(() => {
        const handleResize = () => {
            // Trigger recalculation of stage width
            setTimelineState((prev) => ({ ...prev }));
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Memoize the context value to avoid unnecessary re-renders
    const value = useMemo(
        () => ({
            ...timelineState,
            calculatedStageWidth,
            centerOnTime,
            effectiveStageWidth,
            fitToView,
            isDragging,
            resetView,
            scrollPosition,
            setIsDragging,
            updateScrollPosition,
            updateTimelineState,
            updateZoomLevel,
            zoomLevel
        }),
        [
            timelineState,
            calculatedStageWidth,
            effectiveStageWidth,
            scrollPosition,
            zoomLevel,
            isDragging,
            updateTimelineState,
            updateScrollPosition,
            updateZoomLevel,
            resetView,
            fitToView,
            centerOnTime,
            setIsDragging
        ]
    );

    return (
        <TimelineContainer ref={containerRef}>
            <TimelineContext.Provider value={value}>{children}</TimelineContext.Provider>
        </TimelineContainer>
    );
};

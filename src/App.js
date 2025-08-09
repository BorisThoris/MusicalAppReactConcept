/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState } from 'react';
import { BrowserRouter as Router, Link, Route, Routes } from 'react-router-dom';
import styled from 'styled-components';
import Drums from './components/Drums/Drums';
import Editor from './components/Editor/Editor';
import Guitar from './components/Guitar/Guitar';
import Home from './components/Home/Home';
import Piano from './components/Piano/Piano';
import Tambourine from './components/Tambourine/Tambourine';
import { PanelProvider } from './hooks/usePanelState';
import { CustomCursorProvider } from './providers/CursorProvider';
import { EditorStateProvider } from './providers/EditorStateProvider';
import { NotificationProvider } from './providers/NotificationProvider/NotificationProvider';
import { PixelRatioProvider } from './providers/PixelRatioProvider/PixelRatioProvider';
import { RecordingsPlayerProvider } from './providers/RecordingsPlayerProvider';
import { TimelineProvider } from './providers/TimelineProvider';
import { GlobalStyles, theme as appTheme, ThemeProvider } from './theme';
import { Box, Flex, Nav, NavContainer, NavItem, NavLink, NavList } from './theme/styledComponents';

// Enhanced navigation styling with better glass morphism
const StyledNavContainer = styled(Nav)`
    background: ${({ theme }) => theme.colors.glass.primary};
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border-bottom: 1px solid ${({ theme }) => theme.colors.glass.border};
    box-shadow: ${({ theme }) => theme.shadows.glassLg};
    position: sticky;
    top: 0;
    z-index: ${({ theme }) => theme.zIndex.sticky};
    transition: all ${({ theme }) => theme.transitions.duration.fast} ${({ theme }) => theme.transitions.easing.ease};
`;

const StyledNavContainerInner = styled(NavContainer)`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: ${({ theme }) => theme.spacing[4]} 0;
`;

const StyledNavList = styled(NavList)`
    display: flex;
    list-style: none;
    margin: 0;
    padding: 0;
    gap: ${({ theme }) => theme.spacing[4]};
`;

const StyledNavItem = styled(NavItem)`
    margin: 0;
`;

const StyledNavLink = styled(NavLink)`
    color: ${({ theme }) => theme.colors.semantic.text.primary};
    text-decoration: none;
    font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
    padding: ${({ theme }) => theme.spacing[3]} ${({ theme }) => theme.spacing[4]};
    border-radius: ${({ theme }) => theme.borderRadius.lg};
    transition: all ${({ theme }) => theme.transitions.duration.fast} ${({ theme }) => theme.transitions.easing.ease};
    font-size: ${({ theme }) => theme.typography.fontSize.lg};
    background: ${({ theme }) => theme.colors.glass.secondary};
    backdrop-filter: blur(15px);
    -webkit-backdrop-filter: blur(15px);
    border: 1px solid transparent;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
    position: relative;
    overflow: hidden;

    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
        transition: left 0.5s ease;
    }

    &:hover::before {
        left: 100%;
    }

    &:hover {
        color: ${({ theme }) => theme.colors.semantic.text.primary};
        background: ${({ theme }) => theme.colors.glass.elevated};
        border-color: ${({ theme }) => theme.colors.primary[400]};
        box-shadow: ${({ theme }) => theme.shadows.glassLg};
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        transform: translateY(-2px);
    }

    &.active {
        color: ${({ theme }) => theme.colors.semantic.interactive.primary};
        background: ${({ theme }) => theme.colors.glass.elevated};
        border-color: ${({ theme }) => theme.colors.primary[400]};
        box-shadow: ${({ theme }) => theme.shadows.glassLg};
        position: relative;

        &::after {
            content: '';
            position: absolute;
            bottom: -2px;
            left: 50%;
            transform: translateX(-50%);
            width: 20px;
            height: 3px;
            background: ${({ theme }) => theme.colors.primary[400]};
            border-radius: ${({ theme }) => theme.borderRadius.full};
        }
    }
`;

const ControlContainer = styled(Flex)`
    margin-left: auto;
    align-items: center;
    gap: ${({ theme }) => theme.spacing[4]};
    font-size: ${({ theme }) => theme.typography.fontSize.lg};
    background: ${({ theme }) => theme.colors.glass.secondary};
    backdrop-filter: blur(15px);
    -webkit-backdrop-filter: blur(15px);
    border: 1px solid ${({ theme }) => theme.colors.glass.borderSecondary};
    border-radius: ${({ theme }) => theme.borderRadius.xl};
    padding: ${({ theme }) => theme.spacing[3]} ${({ theme }) => theme.spacing[4]};
    transition: all ${({ theme }) => theme.transitions.duration.fast} ${({ theme }) => theme.transitions.easing.ease};

    &:hover {
        background: ${({ theme }) => theme.colors.glass.elevated};
        border-color: ${({ theme }) => theme.colors.glass.border};
        box-shadow: ${({ theme }) => theme.shadows.glass};
    }
`;

const Slider = styled.input`
    margin-left: ${({ theme }) => theme.spacing[3]};
    width: 200px;
    height: 8px;
    border-radius: ${({ theme }) => theme.borderRadius.full};
    background: ${({ theme }) => theme.colors.glass.secondary};
    outline: none;
    -webkit-appearance: none;
    border: 1px solid ${({ theme }) => theme.colors.glass.borderSecondary};
    transition: all ${({ theme }) => theme.transitions.duration.fast} ${({ theme }) => theme.transitions.easing.ease};

    &:hover {
        background: ${({ theme }) => theme.colors.glass.elevated};
        border-color: ${({ theme }) => theme.colors.glass.border};
    }

    &::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        background: ${({ theme }) => theme.colors.semantic.interactive.primary};
        cursor: pointer;
        box-shadow: ${({ theme }) => theme.shadows.glass};
        border: 2px solid ${({ theme }) => theme.colors.glass.border};
        transition: all ${({ theme }) => theme.transitions.duration.fast}
            ${({ theme }) => theme.transitions.easing.ease};
    }

    &::-webkit-slider-thumb:hover {
        transform: scale(1.1);
        box-shadow: ${({ theme }) => theme.shadows.glassLg};
        border-color: ${({ theme }) => theme.colors.primary[400]};
    }

    &::-moz-range-thumb {
        width: 24px;
        height: 24px;
        border-radius: 50%;
        background: ${({ theme }) => theme.colors.semantic.interactive.primary};
        cursor: pointer;
        border: 2px solid ${({ theme }) => theme.colors.glass.border};
        box-shadow: ${({ theme }) => theme.shadows.glass};
        transition: all ${({ theme }) => theme.transitions.duration.fast}
            ${({ theme }) => theme.transitions.easing.ease};
    }

    &::-moz-range-thumb:hover {
        transform: scale(1.1);
        box-shadow: ${({ theme }) => theme.shadows.glassLg};
        border-color: ${({ theme }) => theme.colors.primary[400]};
    }
`;

const DurationLabel = styled.label`
    color: ${({ theme }) => theme.colors.semantic.text.primary};
    font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
    white-space: nowrap;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
    transition: color ${({ theme }) => theme.transitions.duration.fast} ${({ theme }) => theme.transitions.easing.ease};

    &:hover {
        color: ${({ theme }) => theme.colors.primary[400]};
    }
`;

// Top navigation with duration slider
const TopNav = ({ duration, onDurationChange }) => {
    return (
        <StyledNavContainer>
            <StyledNavContainerInner>
                <StyledNavList>
                    <StyledNavItem>
                        <StyledNavLink as={Link} to="/">
                            Home
                        </StyledNavLink>
                    </StyledNavItem>
                    <StyledNavItem>
                        <StyledNavLink as={Link} to="/editor">
                            Editor
                        </StyledNavLink>
                    </StyledNavItem>
                    <StyledNavItem>
                        <StyledNavLink as={Link} to="/guitar">
                            Guitar
                        </StyledNavLink>
                    </StyledNavItem>
                    <StyledNavItem>
                        <StyledNavLink as={Link} to="/piano">
                            Piano
                        </StyledNavLink>
                    </StyledNavItem>
                    <StyledNavItem>
                        <StyledNavLink as={Link} to="/tambourine">
                            Tambourine
                        </StyledNavLink>
                    </StyledNavItem>
                    <StyledNavItem>
                        <StyledNavLink as={Link} to="/drums">
                            Drums
                        </StyledNavLink>
                    </StyledNavItem>
                </StyledNavList>
                <ControlContainer>
                    <DurationLabel htmlFor="duration-slider">Duration: {duration}s</DurationLabel>
                    <Slider
                        id="duration-slider"
                        type="range"
                        min="10"
                        max="300"
                        value={duration}
                        onChange={onDurationChange}
                    />
                </ControlContainer>
            </StyledNavContainerInner>
        </StyledNavContainer>
    );
};

function App() {
    // State to hold the timeline duration
    const [duration, setDuration] = useState(20);
    // eslint-disable-next-line react-perf/jsx-no-new-function-as-prop
    const handleDurationChange = (e) => setDuration(Number(e.target.value));

    return (
        <ThemeProvider theme={appTheme}>
            <GlobalStyles />
            {/* Core providers (most stable, least likely to change) */}
            <NotificationProvider>
                <PixelRatioProvider durationSec={duration}>
                    {/* UI state providers */}
                    <PanelProvider>
                        <CustomCursorProvider initialVisibility={false}>
                            {/* Timeline and playback providers */}
                            <TimelineProvider>
                                <RecordingsPlayerProvider>
                                    {/* Combined editor state providers */}
                                    <EditorStateProvider>
                                        <Router>
                                            {/* Pass slider props into navigation */}
                                            <TopNav duration={duration} onDurationChange={handleDurationChange} />

                                            <Routes>
                                                <Route path="/" element={<Home />} />
                                                <Route path="/guitar" element={<Guitar />} />
                                                <Route path="/piano" element={<Piano />} />
                                                <Route path="/tambourine" element={<Tambourine />} />
                                                <Route path="/drums" element={<Drums />} />
                                                <Route path="/editor" element={<Editor />} />
                                            </Routes>
                                        </Router>
                                    </EditorStateProvider>
                                </RecordingsPlayerProvider>
                            </TimelineProvider>
                        </CustomCursorProvider>
                    </PanelProvider>
                </PixelRatioProvider>
            </NotificationProvider>
        </ThemeProvider>
    );
}

export default App;

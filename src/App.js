/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState } from 'react';
import { BrowserRouter as Router, Link, Route, Routes } from 'react-router-dom';
import styled from 'styled-components';
import Drums from './components/Drums/Drums';
import Editor from './components/Editor/Editor';
import Guitar from './components/Guitar/Guitar';
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

// Styled components for navigation and controls using theme
const StyledNavContainer = styled(Nav)`
    background-color: ${({ theme }) => theme.colors.semantic.surface.primary};
    border-bottom: 1px solid ${({ theme }) => theme.colors.semantic.border.primary};
    box-shadow: ${({ theme }) => theme.shadows.sm};
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
    color: ${({ theme }) => theme.colors.semantic.text.secondary};
    text-decoration: none;
    font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
    padding: ${({ theme }) => theme.spacing[2]} ${({ theme }) => theme.spacing[3]};
    border-radius: ${({ theme }) => theme.borderRadius.base};
    transition: all ${({ theme }) => theme.transitions.duration.fast} ${({ theme }) => theme.transitions.easing.ease};
    font-size: ${({ theme }) => theme.typography.fontSize.lg};

    &:hover {
        color: ${({ theme }) => theme.colors.semantic.text.primary};
        background-color: ${({ theme }) => theme.colors.semantic.surface.secondary};
    }

    &.active {
        color: ${({ theme }) => theme.colors.semantic.interactive.primary};
        background-color: ${({ theme }) => theme.colors.primary[50]};
    }
`;

const ControlContainer = styled(Flex)`
    margin-left: auto;
    align-items: center;
    gap: ${({ theme }) => theme.spacing[3]};
    font-size: ${({ theme }) => theme.typography.fontSize.lg};
`;

const Slider = styled.input`
    margin-left: ${({ theme }) => theme.spacing[2]};
    width: 200px;
    height: 6px;
    border-radius: ${({ theme }) => theme.borderRadius.full};
    background: ${({ theme }) => theme.colors.semantic.border.primary};
    outline: none;
    -webkit-appearance: none;

    &::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: ${({ theme }) => theme.colors.semantic.interactive.primary};
        cursor: pointer;
        box-shadow: ${({ theme }) => theme.shadows.sm};
    }

    &::-moz-range-thumb {
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: ${({ theme }) => theme.colors.semantic.interactive.primary};
        cursor: pointer;
        border: none;
        box-shadow: ${({ theme }) => theme.shadows.sm};
    }
`;

const DurationLabel = styled.label`
    color: ${({ theme }) => theme.colors.semantic.text.secondary};
    font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
    white-space: nowrap;
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
                                                <Route path="/" element={<h1>Welcome to the App</h1>} />
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

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
import { CollisionsProvider } from './providers/CollisionsProvider/CollisionsProvider';
import { CustomCursorProvider } from './providers/CursorProvider';
import { PaintingProvider } from './providers/PaintingProvider';
import { PixelRatioProvider } from './providers/PixelRatioProvider/PixelRatioProvider';
import { RecordingsPlayerProvider } from './providers/RecordingsPlayerProvider';
import { SelectionProvider } from './providers/SelectionsProvider';
import { SoundEventDragProvider } from './providers/SoundEventDragProvider';
import { TimelineProvider } from './providers/TimelineProvider';

// Styled components for navigation and controls
const NavContainer = styled.nav`
    background-color: yellow;
    display: flex;
    flex-direction: row;
    align-items: center;
    font-size: 24px;
    padding: 0 16px;
`;

const NavList = styled.ul`
    display: flex;
    list-style: none;
    margin: 0;
    padding: 0;
`;

const NavItem = styled.li`
    margin-right: 16px;
`;

const ControlContainer = styled.div`
    margin-left: auto;
    display: flex;
    align-items: center;
    font-size: 18px;
`;

const Slider = styled.input`
    margin-left: 8px;
`;

// Top navigation with duration slider
const TopNav = ({ duration, onDurationChange }) => {
    return (
        <NavContainer>
            <NavList>
                <NavItem>
                    <Link to="/">Home</Link>
                </NavItem>
                <NavItem>
                    <Link to="/editor">Editor</Link>
                </NavItem>
                <NavItem>
                    <Link to="/guitar">Guitar</Link>
                </NavItem>
                <NavItem>
                    <Link to="/piano">Piano</Link>
                </NavItem>
                <NavItem>
                    <Link to="/tambourine">Tambourine</Link>
                </NavItem>
                <NavItem>
                    <Link to="/drums">Drums</Link>
                </NavItem>
            </NavList>
            <ControlContainer>
                <label htmlFor="duration-slider">Duration: {duration}s</label>
                <Slider
                    id="duration-slider"
                    type="range"
                    min="10"
                    max="300"
                    value={duration}
                    onChange={onDurationChange}
                />
            </ControlContainer>
        </NavContainer>
    );
};

function App() {
    // State to hold the timeline duration
    const [duration, setDuration] = useState(60);
    // eslint-disable-next-line react-perf/jsx-no-new-function-as-prop
    const handleDurationChange = (e) => setDuration(Number(e.target.value));

    return (
        <PixelRatioProvider durationSec={duration}>
            <PanelProvider>
                <CollisionsProvider>
                    <CustomCursorProvider initialVisibility={false}>
                        <PaintingProvider>
                            <TimelineProvider>
                                <RecordingsPlayerProvider>
                                    <SelectionProvider>
                                        <SoundEventDragProvider>
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
                                        </SoundEventDragProvider>
                                    </SelectionProvider>
                                </RecordingsPlayerProvider>
                            </TimelineProvider>
                        </PaintingProvider>
                    </CustomCursorProvider>
                </CollisionsProvider>
            </PanelProvider>
        </PixelRatioProvider>
    );
}

export default App;

/* eslint-disable jsx-a11y/anchor-is-valid */
import React from "react";
import { BrowserRouter as Router, Link, Route, Routes } from "react-router-dom";
import styled from "styled-components";
import Drums from "./components/Drums/Drums";
import Editor from "./components/Editor/Editor";
import Guitar from "./components/Guitar/Guitar";
import Piano from "./components/Piano/Piano";
import Tambourine from "./components/Tambourine/Tambourine";
import { gSystem } from "./fmodLogic";
import { InstrumentRecordingsProvider } from "./providers/InstrumentsProvider";
import { RecordingsPlayerProvider } from "./providers/RecordingsPlayerProvider";
import { TimelineProvider } from "./providers/TimelineProvider";

const NavContainer = styled.nav`
  background-color: yellow;
  display: flex;
  flex-direction: row;
  font-size: 40px;
`;

const TopNav = () => {
  return (
    <NavContainer>
      <li>
        <Link to="/">Starting Screen</Link>
      </li>
      <li>
        <Link to="/editor">Editor</Link>
      </li>
      <li>
        <Link to="/guitar">Guitar</Link>
      </li>
      <li>
        <Link to="/piano">Piano</Link>
      </li>
      <li>
        <Link to="/tambourine">Tambourine</Link>
      </li>
      <li>
        <Link to="/drums">Drums</Link>
      </li>
    </NavContainer>
  );
};

function App() {
  if (!gSystem) {
    return <div>lol</div>;
  }

  return (
    <TimelineProvider>
      <InstrumentRecordingsProvider>
        <RecordingsPlayerProvider>
          <Router>
            <TopNav />

            <Routes>
              <Route path="/" element={<h1>Welcome to the App</h1>} />
              <Route path="/guitar" element={<Guitar />} />
              <Route path="/piano" element={<Piano />} />
              <Route path="/tambourine" element={<Tambourine />} />
              <Route path="/drums" element={<Drums />} />
              <Route path="/editor" element={<Editor />} />
            </Routes>
          </Router>
        </RecordingsPlayerProvider>
      </InstrumentRecordingsProvider>
    </TimelineProvider>
  );
}

export default App;

/* eslint-disable jsx-a11y/anchor-is-valid */
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import { Guitar } from './components/Guitar';
import { Piano } from './components/Piano';
import { Tambourine } from './components/Tambourine';
import { Drums } from './components/Drums';

const TopNav = () => {
  return (
    <nav>
      <ul>
        <li>
          <Link to='/'>Starting Screen</Link>
        </li>
        <li>
          <Link to='/guitar'>Guitar</Link>
        </li>
        <li>
          <Link to='/piano'>Piano</Link>
        </li>
        <li>
          <Link to='/tambourine'>Tambourine</Link>
        </li>
        <li>
          <Link to='/drums'>Drums</Link>
        </li>
      </ul>
    </nav>
  );
};

function App() {
  return (
    <Router>
      <TopNav />

      <Routes>
        <Route path='/' element={<h1>Welcome to the App</h1>} />
        <Route path='/guitar' element={<Guitar />} />
        <Route path='/piano' element={<Piano />} />
        <Route path='/tambourine' element={<Tambourine />} />
        <Route path='/drums' element={<Drums />} />
      </Routes>
    </Router>
  );
}

export default App;

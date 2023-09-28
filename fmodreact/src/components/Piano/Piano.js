import React from 'react';
import styled from 'styled-components';
import { playEventInstance } from '../../fmodLogic';

const PianoContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const WhiteKey = styled.button`
  width: 40px;
  height: 200px;
  background-color: white;
  border: 1px solid #000;
  border-right: none;
`;

const BlackKey = styled.button`
  width: 30px;
  height: 130px;
  background-color: black;
  position: relative;
  margin: 0 -5px;
  z-index: 1;
`;

const pianoKeys = [
  'pianoC',
  'pianoC#',
  'pianoD',
  'pianoD#',
  'pianoE',
  'pianoF',
  'pianoF#',
  'pianoG',
  'pianoG#',
  'pianoA',
  'pianoA#',
  'pianoB',
];

const playSound = (event) => {
  playEventInstance(`Piano/${event}`);
};

const Piano = () => {
  return (
      <PianoContainer>
          {pianoKeys.map((key, index) => {
            const isSharp = key.includes('#');
            return isSharp ? (
                <BlackKey key={index} onClick={() => playSound(key)} />
            ) : (
                <WhiteKey key={index} onClick={() => playSound(key)} />
            );
          })}
      </PianoContainer>
  );
};

export default Piano;

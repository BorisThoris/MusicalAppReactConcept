import React from 'react';
import styled from 'styled-components';
import { playEventInstance } from '../../fmodLogic';

const DrumSetContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
`;

const DrumButton = styled.button`
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
  border: 2px solid #000;
  border-radius: 8px;
  background-color: #fff;
  transition: background-color 0.3s;

  &:hover {
    background-color: #f0f0f0;
  }
`;

const instruments = ['CrashCymbal', 'FloorTom', 'RideCymbal', 'Snare', 'SnareDrum', 'Tom1'];

const playSound = (instrument) => {
  playEventInstance(`Drum/${instrument}`);
};

export const Drums = () => {
  return (
    <DrumSetContainer>
      {instruments.map((instrument) => (
        <DrumButton key={instrument} onClick={() => playSound(instrument)}>
          {instrument}
        </DrumButton>
      ))}
    </DrumSetContainer>
  );
};

import PropTypes from 'prop-types';
import React, { useCallback } from 'react';
import styled from 'styled-components';

const NormalKey = styled.button`
  width: 40px;
  height: 200px;
  background-color: white;
  border: 1px solid #000;
  border-right: none;
`;

const SharpKey = styled.button`
  width: 30px;
  height: 130px;
  background-color: black;
  position: relative;
  margin: 0 -5px;
  z-index: 1;
`;

const PianoKey = ({ instrumentName, keyName, playEvent }) => {
  const isSharp = keyName.includes('#');
  const KeyComponent = isSharp ? SharpKey : NormalKey;

  const handleClick = useCallback(() => {
    playEvent(`${instrumentName}/${keyName}`);
  }, [instrumentName, keyName, playEvent]);

  return <KeyComponent onClick={handleClick} />;
};

PianoKey.propTypes = {
  instrumentName: PropTypes.string.isRequired,
  keyName: PropTypes.string.isRequired,
  playEvent: PropTypes.func.isRequired,
};

export default PianoKey;

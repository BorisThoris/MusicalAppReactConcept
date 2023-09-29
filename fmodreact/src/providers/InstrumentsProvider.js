import { node } from 'prop-types';
import React, {
  createContext, useContext, useState,
} from 'react';

export const RecordedInstrumentsContext = createContext();

export const useInstruments = () => {
  return useContext(RecordedInstrumentsContext);
};

export const RecordedInstrumentsProvider = ({ children }) => {
  const [instruments, setInstruments] = useState({});

  const addInstrument = (instrument) => {
    setInstruments((prevInstruments) => ({ ...prevInstruments, [instrument.name]: instrument }));
  };

  const value = {

    instruments,
    setInstruments,
  };

  return (
      <RecordedInstrumentsContext.Provider value={value}>
          {children}
      </RecordedInstrumentsContext.Provider>
  );
};

RecordedInstrumentsProvider.propTypes = { children: node.isRequired };

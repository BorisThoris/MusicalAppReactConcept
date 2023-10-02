import { node } from 'prop-types';
import React, {
  createContext, useContext, useEffect, useState,
} from 'react';

export const RecordedInstrumentsContext = createContext();

export const useInstruments = () => {
  return useContext(RecordedInstrumentsContext);
};

export const RecordedInstrumentsProvider = ({ children }) => {
  const [instruments, setInstruments] = useState({});

  useEffect(() => { console.log(instruments); }, [instruments]);

  const resetInstrumentStorageState = (instrumentName) => {
    const modifiedInstruments = {
      ...instruments,
      [instrumentName]: [],
    };
  };

  const resetAllInstrumentsStorageState = () => setInstruments({});

  const value = {
    instruments,
    resetAllInstrumentsStorageState,
    resetInstrumentStorageState,
    setInstruments,
  };

  return (
      <RecordedInstrumentsContext.Provider value={value}>
          {children}
      </RecordedInstrumentsContext.Provider>
  );
};

RecordedInstrumentsProvider.propTypes = { children: node.isRequired };

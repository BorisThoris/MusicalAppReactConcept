import { node } from 'prop-types';
import React, { createContext, useContext } from 'react'; // Import PropTypes

export const RecordedInstrumentsContext = createContext();

export const useInstruments = () => {
  return useContext(RecordedInstrumentsContext);
};

export const RecordedInstrumentsProvider = ({ children }) => {
  const instruments = [
    {
      name: 'guitar',
    },
  ];

  return <RecordedInstrumentsContext.Provider value={instruments}>{children}</RecordedInstrumentsContext.Provider>;
};

RecordedInstrumentsProvider.propTypes = {
  children: node.isRequired,
};

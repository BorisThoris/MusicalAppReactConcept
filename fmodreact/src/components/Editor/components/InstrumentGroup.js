import React from 'react';
import SoundEventElement from './SoundEventElement';

const InstrumentGroup = ({ instrumentGroup }) => {
    const instrumentName =
        instrumentGroup[0]?.instrumentName || 'Unknown Instrument';
    return (
        <div>
            <h2>{instrumentName}</h2>
            {instrumentGroup.map((eventInstance, index) => (
                <SoundEventElement key={index} eventInstance={eventInstance} />
            ))}
        </div>
    );
};

export default InstrumentGroup;

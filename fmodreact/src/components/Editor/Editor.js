import React, { useContext } from 'react';
import { InstrumentRecordingsContext } from '../../providers/InstrumentsProvider';
import InstrumentGroup from './components/InstrumentGroup';

const Editor = () => {
    const { recordings } = useContext(InstrumentRecordingsContext);

    return (
        <div>
            <div>Editor</div>
            {Object.entries(recordings).map(([groupKey, instrumentGroup]) => (
                <InstrumentGroup
                    key={groupKey}
                    instrumentGroup={instrumentGroup}
                />
            ))}
        </div>
    );
};

export default Editor;

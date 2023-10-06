import React, { useContext, useRef } from 'react';
import styled from 'styled-components';
import { InstrumentRecordingsContext } from '../../providers/InstrumentsProvider';
import InstrumentTimeline from './components/InstrumentTimeline';

const Timeline = styled.div`
    display: flex;
    flex-direction: column;
    overflow-x: scroll;
`;

const EditorWrapper = styled.div`
    background-color: white;
    opacity: 0.7;
`;

const Editor = () => {
    const { recordings, updateStartTime } = useContext(
        InstrumentRecordingsContext
    );

    const MasterTimelineReference = useRef();

    return (
        <EditorWrapper>
            <div>Editor</div>

            <Timeline ref={MasterTimelineReference}>
                {recordings.map(([groupKey, instrumentGroup]) => (
                    <InstrumentTimeline
                        key={groupKey}
                        updateStartTime={updateStartTime}
                        instrumentGroup={instrumentGroup}
                        masterTimelineReference={MasterTimelineReference}
                    />
                ))}
            </Timeline>
        </EditorWrapper>
    );
};

export default Editor;

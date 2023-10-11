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

const Header = styled.div`
    display: flex;
    flex-direction: row;
    background: linear-gradient(
        135deg,
        #2afadf,
        #4c83ff
    ); // Gradient background
    justify-content: space-around;
    padding: 10px 20px;
    border-radius: 15px;
    transform: perspective(500px) rotateX(5deg); // 3D effect
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.3); // Shadow for 3D appearance
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; // Modern font
    transition: transform 0.3s;

    &:hover {
        transform: perspective(500px) rotateX(0deg) scale(1.02);
    }
`;

const Actions = styled.div`
    display: flex;
    gap: 10px;

    div {
        display: flex;
        align-items: center;
        gap: 5px;
        transition: transform 0.3s;

        &:hover {
            transform: scale(1.1);
        }
    }
`;

const Description = styled.div`
    display: flex;
    gap: 15px;

    div {
        transition: transform 0.3s;

        &:hover {
            transform: scale(1.1);
        }
    }
`;

const Editor = () => {
    const { recordings, updateStartTime } = useContext(
        InstrumentRecordingsContext
    );

    const MasterTimelineReference = useRef();

    return (
        <EditorWrapper>
            <div>Editor</div>
            <Header>
                <Description>
                    <div>Name</div>
                    <div>Length</div>
                </Description>

                <Actions>
                    <div>Play</div>
                    <div>Save</div>
                    <div>Delete</div>
                    <div>Undo</div>
                </Actions>
            </Header>

            <Timeline ref={MasterTimelineReference}>
                {Object.entries(recordings).map(
                    ([groupKey, instrumentGroup]) => (
                        <InstrumentTimeline
                            key={groupKey}
                            updateStartTime={updateStartTime}
                            instrumentGroup={instrumentGroup}
                            masterTimelineReference={MasterTimelineReference}
                        />
                    )
                )}
            </Timeline>
        </EditorWrapper>
    );
};

export default Editor;

import React, { useContext } from 'react';
import styled from 'styled-components';
import { BeatManagementControls } from '../BeatManagementControls/BeatManagementControls';
import { HistoryControls } from '../HistoryControls/HistoryButtons';
import { PlaybackControls } from '../PlaybackControls/PlaybackControls';

const HeaderContainer = styled.div``;

export const TimelinesHeader = () => {
    return (
        <>
            <HeaderContainer>
                <BeatManagementControls />
                <PlaybackControls />
                <HistoryControls />
            </HeaderContainer>
        </>
    );
};

export default TimelinesHeader;

import React from 'react';
import styled from 'styled-components';
import { BeatManagementControls } from '../BeatManagementControls/BeatManagementControls';
import { HistoryControls } from '../HistoryControls/HistoryButtons';
import { PlaybackControls } from '../PlaybackControls/PlaybackControls';

const HeaderContainer = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: ${({ theme }) => theme.spacing[4]};
    background-color: ${({ theme }) => theme.colors.semantic.surface.secondary};
    border-bottom: 1px solid ${({ theme }) => theme.colors.semantic.border.primary};
    box-shadow: ${({ theme }) => theme.shadows.sm};
`;

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

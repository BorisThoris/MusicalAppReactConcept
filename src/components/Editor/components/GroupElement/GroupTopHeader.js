// @ts-nocheck
import React, { useMemo } from 'react';
import styled from 'styled-components';
import { KonvaHtml } from '../../../../globalHelpers/KonvaHtml';
import { TimelineHeight } from '../../../../providers/TimelineProvider';

const RADIUS = 10;
const HEADER_H = 28;

const Container = styled.div`
    align-items: center;
    background: ${({ isSelected }) => (isSelected ? '#eef4ff' : '#f7f7f9')};
    border-bottom: 1px solid #e5e7eb;
    border-top-left-radius: ${RADIUS}px;
    border-top-right-radius: ${RADIUS}px;
    box-sizing: border-box;
    display: flex;
    gap: 10px;
    height: ${HEADER_H}px;
    padding: 6px 10px 6px 12px;
    position: relative;
    user-select: none;
    width: 100%;
`;

const Title = styled.div`
    color: #111;
    font-size: 13px;
    font-weight: 700;
    overflow: hidden;
    pointer-events: none;
    text-overflow: ellipsis;
    white-space: nowrap;
`;

const Badge = styled.div`
    background: #e5e7eb;
    border: 1px solid #d1d5db;
    border-radius: 999px;
    color: #111;
    font-size: 11px;
    margin-left: 8px;
    padding: 2px 8px;
    pointer-events: none;
`;

const Spacer = styled.div`
    flex: 1;
`;

const LengthLabel = styled.div`
    color: #6b7280;
    font-size: 12px;
    pointer-events: none;
`;

const LockButton = styled.button`
    background: ${({ locked }) => (locked ? '#6b7280' : '#10b981')};
    border: none;
    border-radius: 6px;
    box-shadow: rgba(0, 0, 0, 0.2) 0 1px 2px;
    color: white;
    cursor: pointer;
    font-size: 12px;
    margin-left: 10px;
    padding: 6px 8px;
    pointer-events: auto;
`;

export const GroupTopHeader = React.memo(function GroupTopHeader({
    expanded,
    groupId,
    groupLength,
    isSelected,
    lenLabel,
    locked,
    onToggleExpand,
    onToggleLock,
    width
}) {
    const divProps = useMemo(
        () => ({
            style: {
                height: `${TimelineHeight}px`,
                pointerEvents: 'none',
                width: `${width}px`,
                zIndex: 50
            }
        }),
        [width]
    );

    return (
        <KonvaHtml transform divProps={divProps}>
            <Container isSelected={isSelected}>
                <Title title={`Group #${groupId}`}>Group #{groupId}</Title>
                <Badge>{groupLength} items</Badge>
                <Spacer />
                <LengthLabel>{lenLabel}</LengthLabel>
                <LockButton locked={locked} onClick={onToggleLock} title={locked ? 'Unlock group' : 'Lock group'}>
                    {locked ? 'Locked' : 'Lock'}
                </LockButton>
            </Container>
        </KonvaHtml>
    );
});

export default GroupTopHeader;

// @ts-nocheck
import React, { useMemo } from 'react';
import styled from 'styled-components';
import { KonvaHtml } from '../../../../globalHelpers/KonvaHtml';
import { TimelineHeight } from '../../../../providers/TimelineProvider';

const RADIUS = 10;
const HEADER_H = 28;

const Container = styled.div`
    align-items: center;
    background: ${({ isSelected, theme }) =>
        isSelected ? theme.colors.primary[50] : theme.colors.semantic.surface.secondary};
    border-bottom: 1px solid ${({ theme }) => theme.colors.semantic.border.primary};
    border-top-left-radius: ${RADIUS}px;
    border-top-right-radius: ${RADIUS}px;
    box-sizing: border-box;
    display: flex;
    gap: ${({ theme }) => theme.spacing[2]};
    height: ${HEADER_H}px;
    padding: ${({ theme }) => theme.spacing[1]} ${({ theme }) => theme.spacing[2]} ${({ theme }) => theme.spacing[1]}
        ${({ theme }) => theme.spacing[3]};
    position: relative;
    user-select: none;
    width: 100%;
`;

const Title = styled.div`
    color: ${({ theme }) => theme.colors.semantic.text.primary};
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
    font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
    overflow: hidden;
    pointer-events: none;
    text-overflow: ellipsis;
    white-space: nowrap;
`;

const Badge = styled.div`
    background: ${({ theme }) => theme.colors.semantic.surface.tertiary};
    border: 1px solid ${({ theme }) => theme.colors.semantic.border.secondary};
    border-radius: 999px;
    color: ${({ theme }) => theme.colors.semantic.text.primary};
    font-size: ${({ theme }) => theme.typography.fontSize.xs};
    margin-left: ${({ theme }) => theme.spacing[2]};
    padding: ${({ theme }) => theme.spacing[0]} ${({ theme }) => theme.spacing[2]};
    pointer-events: none;
`;

const Spacer = styled.div`
    flex: 1;
`;

const LengthLabel = styled.div`
    color: ${({ theme }) => theme.colors.semantic.text.secondary};
    font-size: ${({ theme }) => theme.typography.fontSize.xs};
    pointer-events: none;
`;

const LockButton = styled.button`
    background: ${({ locked, theme }) =>
        locked ? theme.colors.semantic.text.secondary : theme.colors.semantic.interactive.success};
    border: none;
    border-radius: ${({ theme }) => theme.borderRadius.md};
    box-shadow: ${({ theme }) => theme.shadows.sm};
    color: ${({ theme }) => theme.colors.semantic.text.inverse};
    cursor: pointer;
    font-size: ${({ theme }) => theme.typography.fontSize.xs};
    margin-left: ${({ theme }) => theme.spacing[2]};
    padding: ${({ theme }) => theme.spacing[1]} ${({ theme }) => theme.spacing[2]};
    pointer-events: auto;
    transition: background-color ${({ theme }) => theme.transitions.duration.fast}
        ${({ theme }) => theme.transitions.easing.ease};

    &:hover {
        background: ${({ locked, theme }) => (locked ? theme.colors.semantic.text.primary : theme.colors.success[600])};
    }
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

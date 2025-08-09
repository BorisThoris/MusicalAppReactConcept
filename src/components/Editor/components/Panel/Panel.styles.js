import styled, { css } from 'styled-components';

const flexCenter = css`
    display: inline-flex;
    align-items: center;
    justify-content: center;
`;

const hoverEffect = css`
    &:hover {
        transform: scale(1.1);
    }
`;

export const Header = styled.div`
    ${flexCenter};
    justify-content: space-between;
    padding: ${({ theme }) => theme.spacing[1]};
`;

const basePressableIcon = css`
    width: 30px;
    height: 20px;
    margin-right: ${({ theme }) => theme.spacing[2]};
    cursor: pointer;
    ${flexCenter};
    border-radius: ${({ theme }) => theme.borderRadius.base};
    transition: transform ${({ theme }) => theme.transitions.duration.fast}
        ${({ theme }) => theme.transitions.easing.ease};
`;

const PressableIcon = styled.button`
    ${basePressableIcon}
    ${hoverEffect};
`;

export const PlayIcon = styled(PressableIcon)`
    background-color: ${({ theme }) => theme.colors.semantic.interactive.success};
    color: ${({ theme }) => theme.colors.semantic.text.inverse};
    ${hoverEffect};
`;

export const CopyIcon = styled(PressableIcon)`
    background-color: ${({ theme }) => theme.colors.semantic.interactive.success};
    color: ${({ theme }) => theme.colors.semantic.text.inverse};
    ${hoverEffect};
`;

export const FlexContainer = styled.div`
    display: flex;
    flex-wrap: wrap;
`;

export const TrashIcon = styled(PressableIcon)`
    background-color: ${({ theme }) => theme.colors.semantic.surface.secondary};
    border: 1px solid ${({ theme }) => theme.colors.semantic.border.primary};
    color: ${({ theme }) => theme.colors.semantic.text.primary};

    &:hover {
        transform: scale(1.3);
        background-color: ${({ theme }) => theme.colors.semantic.interactive.error};
        color: ${({ theme }) => theme.colors.semantic.text.inverse};
    }
`;

export const CloseIcon = styled(PressableIcon)`
    background-color: ${({ theme }) => theme.colors.semantic.text.secondary};
    color: ${({ theme }) => theme.colors.semantic.text.inverse};
    position: absolute;
    top: ${({ theme }) => theme.spacing[1]};
    right: ${({ theme }) => theme.spacing[1]};
    z-index: ${({ theme }) => theme.zIndex.dropdown};

    &:hover {
        transform: scale(1.3);
        background-color: ${({ theme }) => theme.colors.semantic.interactive.error};
    }
`;

export const PanelContainer = styled.div`
    border: 1px solid ${({ theme }) => theme.colors.semantic.border.primary};
    background-color: ${({ theme }) => theme.colors.semantic.surface.primary};
    position: absolute !important;
    left: ${({ x }) => x}px;
    top: ${({ y }) => y}px;
    transform: ${({ timelinestate }) => `translate(${-timelinestate.panelCompensationOffset.x}px, 0)`};
    border-radius: ${({ isspeechbubble, theme }) => (isspeechbubble ? theme.borderRadius.lg : '0')};
    box-shadow: ${({ theme }) => theme.shadows.lg};
`;

export const SpeechBubbleArrow = styled.div`
    position: absolute;
    top: -20px;
    left: 0px;
    width: 0;
    height: 0;
    border-style: solid;
    border-width: 10px;
    border-color: transparent transparent ${({ theme }) => theme.colors.semantic.border.primary} transparent;
`;

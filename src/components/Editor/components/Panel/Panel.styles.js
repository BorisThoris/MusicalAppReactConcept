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
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border: 1px solid ${({ theme }) => theme.colors.glass.borderSecondary};
`;

const PressableIcon = styled.button`
    ${basePressableIcon}
    ${hoverEffect};
`;

export const PlayIcon = styled(PressableIcon)`
    background: ${({ theme }) => theme.colors.glass.elevated};
    color: ${({ theme }) => theme.colors.semantic.text.primary};
    ${hoverEffect};
    box-shadow: ${({ theme }) => theme.shadows.glass};
`;

export const CopyIcon = styled(PressableIcon)`
    background: ${({ theme }) => theme.colors.glass.elevated};
    color: ${({ theme }) => theme.colors.semantic.text.primary};
    ${hoverEffect};
    box-shadow: ${({ theme }) => theme.shadows.glass};
`;

export const FlexContainer = styled.div`
    display: flex;
    flex-wrap: wrap;
`;

export const TrashIcon = styled(PressableIcon)`
    background: ${({ theme }) => theme.colors.glass.secondary};
    border: 1px solid ${({ theme }) => theme.colors.glass.borderSecondary};
    color: ${({ theme }) => theme.colors.semantic.text.primary};

    &:hover {
        transform: scale(1.3);
        background: ${({ theme }) => theme.colors.glass.inverse};
        color: ${({ theme }) => theme.colors.semantic.text.primary};
        box-shadow: ${({ theme }) => theme.shadows.glass};
    }
`;

export const CloseIcon = styled(PressableIcon)`
    background: ${({ theme }) => theme.colors.glass.secondary};
    color: ${({ theme }) => theme.colors.semantic.text.primary};
    position: absolute;
    top: ${({ theme }) => theme.spacing[1]};
    right: ${({ theme }) => theme.spacing[1]};
    z-index: ${({ theme }) => theme.zIndex.dropdown};

    &:hover {
        transform: scale(1.3);
        background: ${({ theme }) => theme.colors.glass.inverse};
        box-shadow: ${({ theme }) => theme.shadows.glass};
    }
`;

export const PanelContainer = styled.div`
    background: ${({ theme }) => theme.colors.glass.primary};
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid ${({ theme }) => theme.colors.glass.border};
    position: absolute !important;
    left: ${({ x }) => x}px;
    top: ${({ y }) => y}px;
    transform: ${({ timelinestate }) => `translate(${-timelinestate.panelCompensationOffset.x}px, 0)`};
    border-radius: ${({ isspeechbubble, theme }) => (isspeechbubble ? theme.borderRadius.lg : '0')};
    box-shadow: ${({ theme }) => theme.shadows.glassLg};
    transition: all ${({ theme }) => theme.transitions.duration.fast} ${({ theme }) => theme.transitions.easing.ease};
    min-width: 300px;
    min-height: 200px;
    padding: ${({ theme }) => theme.spacing[4]};

    &:hover {
        box-shadow: ${({ theme }) => theme.shadows.glassXl};
        border-color: ${({ theme }) => theme.colors.primary[400]};
    }
`;

export const SpeechBubbleArrow = styled.div`
    position: absolute;
    top: -20px;
    left: 0px;
    width: 0;
    height: 0;
    border-style: solid;
    border-width: 10px;
    border-color: transparent transparent ${({ theme }) => theme.colors.glass.border} transparent;
`;

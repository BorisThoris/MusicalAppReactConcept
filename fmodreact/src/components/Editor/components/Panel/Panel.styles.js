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

export const TimelineContainer = styled.div`
    border: 1px solid black;
    margin: 20px;
    padding: 20px;
    background-color: green;
    position: absolute !important;
`;

export const Header = styled.div`
    ${flexCenter};
    justify-content: space-between;
    padding: 5px;
`;

const basePressableIcon = css`
    width: 30px;
    height: 20px;
    margin-right: 10px;
    cursor: pointer;
    ${flexCenter};
`;

export const PressableIcon = styled.button`
    ${basePressableIcon}
    transition: transform 0.3s ease;
    ${hoverEffect};
`;

export const PlayIcon = styled(PressableIcon)`
    background-color: green;
    ${hoverEffect};
`;

export const CopyIcon = styled(PressableIcon)`
    background-color: green;
    ${hoverEffect};
`;

export const FlexContainer = styled.div`
    display: flex;
`;

export const TrashIcon = styled(PressableIcon)`
    background-color: #f5f5f5;
    border: 1px solid black;

    &:hover {
        transform: scale(1.3); // Combines scaling and rotation
        transition: transform 0.5s ease;
        background-color: red;
    }
`;

export const DuplicateIcon = styled(PressableIcon)`
    background-color: #f5f5f5;
    border: 1px solid black;
    ${hoverEffect};
`;

export const CloseIcon = styled(PressableIcon)`
    background-color: gray;
    position: absolute;
    top: 5px; // Adjust as needed
    right: 5px; // Adjust as needed
    z-index: 10; // Ensure it's above other content

    &:hover {
        transform: scale(1.3); // Combines scaling and rotation
        transition: transform 0.5s ease;
        background-color: red;
    }
`;

export const Timeline = styled.div`
    ${flexCenter};
    flex-direction: column;
    gap: 10px;
    padding: 10px 0;
    background-color: yellow;
`;

export const TimeMarker = styled.div`
    ${flexCenter};
    justify-content: space-between;
    flex-direction: column;
    font-weight: bold;
    margin-bottom: 10px;
`;

export const PanelContainer = styled.div`
    border: 1px solid black;

    background-color: green;
    position: absolute !important;
    left: ${({ x }) => x}px; // Use passed props for dynamic positioning
    top: ${({ y }) => y}px; // Use passed props for dynamic positioning
    transform: ${({ timelineState }) => `translate(${-timelineState.panelCompensationOffset.x}px, 0)`};
    position: relative; // This allows absolute positioning of children like CloseIcon
`;

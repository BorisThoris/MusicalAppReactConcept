import styled from 'styled-components';

export const TimelineContainer = styled.div`
    border: 1px solid black;
    margin: 20px;
    padding: 20px;
    background-color: green;
    position: absolute !important;
`;

export const Header = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 5px;
`;

export const PressableIcon = styled.button`
    width: 30px;
    height: 20px;
    margin-right: 10px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
`;

export const PlayIcon = styled(PressableIcon)`
    background-color: green;

    &:hover {
        transform: scale(1.1);
    }
`;

export const CopyIcon = styled(PressableIcon)`
    background-color: green;

    &:hover {
        transform: scale(1.1);
    }
`;

export const FlexContainer = styled.div`
    display: flex;
`;

export const TrashIcon = styled(PressableIcon)`
    background-color: #f5f5f5;
    border: 1px solid black;

    &:hover {
        transform: scale(1.1);
    }
`;

export const CloseIcon = styled(PressableIcon)`
    background-color: gray;
`;

export const Timeline = styled.div`
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 10px 0;
    background-color: yellow;
`;

export const TimeMarker = styled.div`
    display: flex;
    justify-content: space-between;
    flex-direction: column;
    font-weight: bold;
    margin-bottom: 10px;
`;

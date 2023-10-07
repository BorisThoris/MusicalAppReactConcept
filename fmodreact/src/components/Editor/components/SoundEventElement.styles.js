/* eslint-disable import/prefer-default-export */
import styled from 'styled-components';

export const SoundElement = styled.button`
    padding: 10px;
    background-color: orangered;
    background-image: linear-gradient(to bottom right, #ff4500, #e62e00);
    opacity: 0.9;
    display: inline;
    margin: 5px;

    margin: 0;
    padding: 0;
    position: absolute;

    left: ${(props) => props.positionInTimeline}px;
    width: ${(props) => props.lengthBasedWidth || 10}px;

    transition: 1s;

    box-shadow:
        2px 2px 5px rgba(0, 0, 0, 0.5),
        inset 0px 0px 5px rgba(255, 255, 255, 0.5);

    border: 1px solid #b22a00;
    border-radius: 5px;

    transform: perspective(600px) rotateX(0deg) rotateY(0deg);

    &:hover {
        z-index: 2;
        box-shadow:
            4px 4px 8px rgba(0, 0, 0, 0.7),
            inset 1px 1px 3px rgba(255, 255, 255, 0.5);
        transform: translateY(-5px) translateX(-5px) perspective(600px)
            rotateX(5deg) rotateY(5deg);
    }
`;

/* eslint-disable import/prefer-default-export */
import styled from "styled-components";

export const SoundElement = styled.div`
  /* Positioning */
  position: absolute;

  transform: translateX(${(props) => props.positionInTimeline}px);

  /* Dimension and Spacing */
  width: ${(props) => props.lengthBasedWidth || 10}px;

  /* Flexbox Settings */
  flex-direction: column;
  flex-grow: 0;
  flex-shrink: 0;

  /* Color and Border */
  background-color: orangered;
  background-image: linear-gradient(to bottom right, #ff4500, #e62e00);
  border: 1px solid #b22a00;
  border-radius: 5px;

  /* Appearance */
  opacity: 0.9;
  box-shadow:
    2px 2px 5px rgba(0, 0, 0, 0.5),
    inset 0px 0px 5px rgba(255, 255, 255, 0.5);

  /* Transition and Transform */
  transition: 1s;
`;

import styled from "styled-components";

export const HeaderContainer = styled.div`
  display: flex;
  flex-direction: row;
  background: linear-gradient(135deg, #2afadf, #4c83ff);
  justify-content: space-around;
  padding: 10px 20px;
  border-radius: 15px;
  transform: perspective(500px) rotateX(5deg);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.3);
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
  transition: transform 0.3s;

  &:hover {
    transform: perspective(500px) rotateX(0deg) scale(1.02);
  }
`;

export const Description = styled.div`
  display: flex;
  gap: 15px;
`;

export const Actions = styled.div`
  display: flex;
  gap: 10px;
`;

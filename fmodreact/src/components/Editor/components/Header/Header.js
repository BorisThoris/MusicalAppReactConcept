import React from "react";
import { Actions, Description, HeaderContainer } from "./Header.styles"; // Importing styled components

const Header = () => (
  <HeaderContainer>
    <Description>
      <div>Name</div>
      <div>Length</div>
    </Description>

    <Actions>
      <div>Play</div>
      <div>Save</div>
      <div>Delete</div>
      <div>Undo</div>
    </Actions>
  </HeaderContainer>
);

export default Header;

export const getElementScreenPosition = (shape) => {
    // Get the bounding box of the shape relative to the Konva stage
    const shapeRect = shape.getClientRect();

    // Get the bounding box of the canvas in the browser window
    const stageContainer = shape.getStage().container();
    const canvasRect = stageContainer.getBoundingClientRect();

    // Calculate the screen position of the shape and add the page scroll offset
    const screenX = canvasRect.x + shapeRect.x + window.scrollX;
    const screenY = canvasRect.y + shapeRect.y + window.scrollY;

    return { x: screenX, y: screenY };
};

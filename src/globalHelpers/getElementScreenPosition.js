export const getElementScreenPosition = (shape) => {
    // Get the bounding box of the shape relative to the Konva stage
    const shapeRect = shape.getClientRect();

    // Get the bounding box of the canvas in the browser window
    const stageContainer = shape.getStage().container();
    const canvasRect = stageContainer.getBoundingClientRect();

    // Calculate the screen position of the shape
    const screenX = canvasRect.x + shapeRect.x;
    const screenY = canvasRect.y + shapeRect.y;

    return { x: screenX, y: screenY };
};

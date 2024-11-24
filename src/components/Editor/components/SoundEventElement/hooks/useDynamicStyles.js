// eslint-disable-next-line no-nested-ternary
const getDynamicStroke = ({ isFocused, isSelected }) => (isFocused ? 'green' : isSelected ? 'blue' : 'red');
const getDynamicShadowBlur = (isFocused) => (isFocused ? 5 : 5);
const getDynamicColorStops = (isOverlapping) => (isOverlapping ? [0, 'red', 1, 'yellow'] : [1, 'red']);

export const useDynamicStyles = (isFocused, isSelected, isOverlapping) => {
    const dynamicStroke = getDynamicStroke({ isFocused, isSelected });
    const dynamicShadowBlur = getDynamicShadowBlur(isFocused);
    const dynamicColorStops = getDynamicColorStops(isOverlapping);

    return { dynamicColorStops, dynamicShadowBlur, dynamicStroke };
};

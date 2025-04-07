// eslint-disable-next-line no-nested-ternary
const getDynamicStroke = ({ isFocused, isSelected, parentLocked }) =>
    // eslint-disable-next-line no-nested-ternary
    parentLocked ? '#ADD8E6' : isFocused ? 'green' : isSelected ? 'blue' : 'red';

const getDynamicShadowBlur = (isFocused) => (isFocused ? 5 : 5);

export const useDynamicStyles = (isFocused, isSelected, parentLocked) => {
    const dynamicStroke = getDynamicStroke({ isFocused, isSelected, parentLocked });
    const dynamicShadowBlur = getDynamicShadowBlur(isFocused);
    const dynamicColorStops = [0, 'red', 1, 'yellow'];

    return { dynamicColorStops, dynamicShadowBlur, dynamicStroke };
};

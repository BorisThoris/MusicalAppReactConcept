import styled from 'styled-components';

export const ControlWrapper = styled.div`
    display: flex;
    flex-direction: column;
    margin-bottom: ${({ theme }) => theme.spacing[4]};
`;

export const ParamName = styled.span`
    font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
    color: ${({ theme }) => theme.colors.semantic.text.primary};
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
`;

export const ParamValue = styled.span`
    margin-left: ${({ theme }) => theme.spacing[2]};
    color: ${({ theme }) => theme.colors.semantic.text.secondary};
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
`;

export const SliderInput = styled.input`
    width: 100%;
    margin-top: ${({ theme }) => theme.spacing[1]};
    height: 6px;
    border-radius: ${({ theme }) => theme.borderRadius.full};
    background: ${({ theme }) => theme.colors.semantic.border.primary};
    outline: none;
    -webkit-appearance: none;

    &::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: ${({ theme }) => theme.colors.semantic.interactive.primary};
        cursor: pointer;
        box-shadow: ${({ theme }) => theme.shadows.sm};
    }

    &::-moz-range-thumb {
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: ${({ theme }) => theme.colors.semantic.interactive.primary};
        cursor: pointer;
        border: none;
        box-shadow: ${({ theme }) => theme.shadows.sm};
    }
`;

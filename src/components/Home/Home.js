import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import {
    Badge,
    BodyText,
    Box,
    Button,
    Card,
    CardBody,
    CardHeader,
    Divider,
    Flex,
    Heading1,
    Heading2,
    Heading3
} from '../../theme/styledComponents';

const HomeContainer = styled.div`
    min-height: calc(100vh - 80px);
    padding: ${({ theme }) => theme.spacing[8]} ${({ theme }) => theme.spacing[4]};
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    animation: fadeIn 0.8s ease-out;
`;

const HeroSection = styled.div`
    text-align: center;
    margin-bottom: ${({ theme }) => theme.spacing[16]};
    max-width: 800px;
    animation: slideUp 1s ease-out 0.2s both;
`;

const FeatureGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: ${({ theme }) => theme.spacing[6]};
    width: 100%;
    max-width: 1200px;
    margin-bottom: ${({ theme }) => theme.spacing[12]};
    animation: slideUp 1s ease-out 0.4s both;
`;

const FeatureCard = styled(Card)`
    background: ${({ theme }) => theme.colors.glass.primary};
    backdrop-filter: blur(25px);
    -webkit-backdrop-filter: blur(25px);
    border: 1px solid ${({ theme }) => theme.colors.glass.border};
    box-shadow: ${({ theme }) => theme.shadows.glassLg};
    transition: all ${({ theme }) => theme.transitions.duration.fast} ${({ theme }) => theme.transitions.easing.ease};
    cursor: pointer;
    position: relative;
    overflow: hidden;

    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
        transition: left 0.6s ease;
    }

    &:hover::before {
        left: 100%;
    }

    &:hover {
        transform: translateY(-8px) scale(1.02);
        box-shadow: ${({ theme }) => theme.shadows.glassXl};
        border-color: ${({ theme }) => theme.colors.primary[400]};
    }

    &:nth-child(1) {
        animation: scaleIn 0.6s ease-out 0.6s both;
    }
    &:nth-child(2) {
        animation: scaleIn 0.6s ease-out 0.7s both;
    }
    &:nth-child(3) {
        animation: scaleIn 0.6s ease-out 0.8s both;
    }
    &:nth-child(4) {
        animation: scaleIn 0.6s ease-out 0.9s both;
    }
    &:nth-child(5) {
        animation: scaleIn 0.6s ease-out 1s both;
    }
`;

const StyledCardHeader = styled(CardHeader)`
    background: ${({ theme }) => theme.colors.glass.elevated};
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border-bottom: 1px solid ${({ theme }) => theme.colors.glass.borderSecondary};
    border-top-left-radius: ${({ theme }) => theme.borderRadius.lg};
    border-top-right-radius: ${({ theme }) => theme.borderRadius.lg};
    transition: all ${({ theme }) => theme.transitions.duration.fast} ${({ theme }) => theme.transitions.easing.ease};
`;

const StyledCardBody = styled(CardBody)`
    background: transparent;
    transition: all ${({ theme }) => theme.transitions.duration.fast} ${({ theme }) => theme.transitions.easing.ease};
`;

const InstrumentIcon = styled.div`
    width: 56px;
    height: 56px;
    border-radius: ${({ theme }) => theme.borderRadius.xl};
    background: ${({ theme, variant }) => {
        switch (variant) {
            case 'piano':
                return `linear-gradient(135deg, ${theme.colors.primary[400]}, ${theme.colors.primary[600]})`;
            case 'guitar':
                return `linear-gradient(135deg, ${theme.colors.success[400]}, ${theme.colors.success[600]})`;
            case 'drums':
                return `linear-gradient(135deg, ${theme.colors.warning[400]}, ${theme.colors.warning[600]})`;
            case 'tambourine':
                return `linear-gradient(135deg, ${theme.colors.accent[400]}, ${theme.colors.accent[600]})`;
            case 'editor':
                return `linear-gradient(135deg, ${theme.colors.secondary[400]}, ${theme.colors.secondary[600]})`;
            default:
                return `linear-gradient(135deg, ${theme.colors.neutral[400]}, ${theme.colors.neutral[600]})`;
        }
    }};
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: ${({ theme }) => theme.spacing[3]};
    box-shadow: ${({ theme }) => theme.shadows.glassLg};
    font-size: ${({ theme }) => theme.typography.fontSize['2xl']};
    color: white;
    font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
    transition: all ${({ theme }) => theme.transitions.duration.fast} ${({ theme }) => theme.transitions.easing.ease};
    position: relative;
    overflow: hidden;

    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.2), transparent);
        transform: translateX(-100%);
        transition: transform 0.6s ease;
    }

    &:hover::before {
        transform: translateX(100%);
    }

    &:hover {
        transform: scale(1.1) rotate(5deg);
        box-shadow: ${({ theme }) => theme.shadows.glassXl};
    }
`;

const CTAButton = styled(Button)`
    background: ${({ theme }) => theme.colors.glass.elevated};
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid ${({ theme }) => theme.colors.glass.border};
    color: ${({ theme }) => theme.colors.semantic.text.primary};
    font-size: ${({ theme }) => theme.typography.fontSize.lg};
    padding: ${({ theme }) => theme.spacing[4]} ${({ theme }) => theme.spacing[8]};
    border-radius: ${({ theme }) => theme.borderRadius.xl};
    transition: all ${({ theme }) => theme.transitions.duration.fast} ${({ theme }) => theme.transitions.easing.ease};
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    gap: ${({ theme }) => theme.spacing[2]};
    position: relative;
    overflow: hidden;

    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
        transition: left 0.6s ease;
    }

    &:hover::before {
        left: 100%;
    }

    &:hover {
        background: ${({ theme }) => theme.colors.glass.primary};
        border-color: ${({ theme }) => theme.colors.primary[400]};
        transform: translateY(-4px) scale(1.05);
        box-shadow: ${({ theme }) => theme.shadows.glassXl};
    }

    &:nth-child(1) {
        animation: scaleIn 0.6s ease-out 1.1s both;
    }
    &:nth-child(2) {
        animation: scaleIn 0.6s ease-out 1.2s both;
    }
`;

const StatsContainer = styled.div`
    display: flex;
    gap: ${({ theme }) => theme.spacing[8]};
    margin-bottom: ${({ theme }) => theme.spacing[12]};
    flex-wrap: wrap;
    justify-content: center;
    animation: slideUp 1s ease-out 0.6s both;
`;

const StatItem = styled.div`
    text-align: center;
    background: ${({ theme }) => theme.colors.glass.secondary};
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid ${({ theme }) => theme.colors.glass.borderSecondary};
    border-radius: ${({ theme }) => theme.borderRadius.xl};
    padding: ${({ theme }) => theme.spacing[6]};
    min-width: 140px;
    transition: all ${({ theme }) => theme.transitions.duration.fast} ${({ theme }) => theme.transitions.easing.ease};
    position: relative;
    overflow: hidden;

    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.05), transparent);
        transform: translateX(-100%);
        transition: transform 0.6s ease;
    }

    &:hover::before {
        transform: translateX(100%);
    }

    &:hover {
        background: ${({ theme }) => theme.colors.glass.elevated};
        border-color: ${({ theme }) => theme.colors.glass.border};
        transform: translateY(-4px);
        box-shadow: ${({ theme }) => theme.shadows.glassLg};
    }

    &:nth-child(1) {
        animation: scaleIn 0.6s ease-out 0.8s both;
    }
    &:nth-child(2) {
        animation: scaleIn 0.6s ease-out 0.9s both;
    }
    &:nth-child(3) {
        animation: scaleIn 0.6s ease-out 1s both;
    }
`;

const StatNumber = styled.div`
    font-size: ${({ theme }) => theme.typography.fontSize['5xl']};
    font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
    color: ${({ theme }) => theme.colors.primary[400]};
    margin-bottom: ${({ theme }) => theme.spacing[2]};
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    transition: all ${({ theme }) => theme.transitions.duration.fast} ${({ theme }) => theme.transitions.easing.ease};
`;

const StatLabel = styled.div`
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
    color: ${({ theme }) => theme.colors.semantic.text.secondary};
    font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
`;

const features = [
    {
        badge: 'Melodic',
        description:
            'Play beautiful piano melodies with our virtual piano interface. Record and replay your performances.',
        icon: '🎹',
        id: 'piano',
        path: '/piano',
        title: 'Piano'
    },
    {
        badge: 'Strings',
        description: 'Strum virtual guitar strings and create amazing riffs. Perfect for learning and experimenting.',
        icon: '🎸',
        id: 'guitar',
        path: '/guitar',
        title: 'Guitar'
    },
    {
        badge: 'Rhythm',
        description: 'Beat the rhythm with our virtual drum kit. Multiple percussion instruments to choose from.',
        icon: '🥁',
        id: 'drums',
        path: '/drums',
        title: 'Drums'
    },
    {
        badge: 'Percussion',
        description: 'Add some jingle to your music with our virtual tambourine. Perfect for adding texture.',
        icon: '🪘',
        id: 'tambourine',
        path: '/tambourine',
        title: 'Tambourine'
    },
    {
        badge: 'Pro',
        description: 'Professional music composition tool with timeline editing and multi-track recording.',
        icon: '🎼',
        id: 'editor',
        path: '/editor',
        title: 'Music Editor'
    }
];

const Home = () => {
    return (
        <HomeContainer>
            <HeroSection>
                <Heading1>Welcome to Musical App</Heading1>
                <BodyText>
                    Create, compose, and explore music with our suite of virtual instruments and professional editing
                    tools. Experience the future of digital music creation with glass morphism design and intuitive
                    controls.
                </BodyText>

                <Flex gap={4} justifyContent="center" marginTop={6}>
                    <CTAButton as={Link} to="/editor">
                        🎵 Start Composing
                    </CTAButton>
                    <CTAButton as={Link} to="/piano">
                        🎹 Try Piano
                    </CTAButton>
                </Flex>
            </HeroSection>

            <StatsContainer>
                <StatItem>
                    <StatNumber>5</StatNumber>
                    <StatLabel>Instruments</StatLabel>
                </StatItem>
                <StatItem>
                    <StatNumber>∞</StatNumber>
                    <StatLabel>Possibilities</StatLabel>
                </StatItem>
                <StatItem>
                    <StatNumber>100%</StatNumber>
                    <StatLabel>Free</StatLabel>
                </StatItem>
            </StatsContainer>

            <FeatureGrid>
                {features.map((feature) => (
                    <FeatureCard key={feature.id} as={Link} to={feature.path}>
                        <StyledCardHeader>
                            <Flex alignItems="center" gap={3}>
                                <InstrumentIcon variant={feature.id}>{feature.icon}</InstrumentIcon>
                                <div>
                                    <Heading3>{feature.title}</Heading3>
                                    <Badge variant="primary">{feature.badge}</Badge>
                                </div>
                            </Flex>
                        </StyledCardHeader>
                        <StyledCardBody>
                            <BodyText>{feature.description}</BodyText>
                        </StyledCardBody>
                    </FeatureCard>
                ))}
            </FeatureGrid>

            <Box textAlign="center" marginTop={8}>
                <BodyText>
                    Built with React, FMOD, and modern web technologies. Experience music creation like never before.
                </BodyText>
            </Box>
        </HomeContainer>
    );
};

export default Home;

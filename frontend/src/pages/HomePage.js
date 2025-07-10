
import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import Header from '../components/layout/Header';
import Target from '../components/common/Target';
import Button from '../components/common/Button';

/** @format */

import React from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import Header from "../components/layout/Header";
import Target from "../components/common/Target";
import Button from "../components/common/Button";


const HomePage = () => {
  const navigate = useNavigate();

  return (
    <HomePageWrapper>
      <GridOverlay />
      <Header />
      <GlowTitle>LASER STRIKE</GlowTitle>
      <TargetWrapper>
        <Target showAnimations={true} />
      </TargetWrapper>
      <StatsWrapper>
        <StatCard>
          <h3>5K+</h3>
          <p>Shots Fired</p>
        </StatCard>
        <StatCard>
          <h3>2K+</h3>
          <p>Players Joined</p>
        </StatCard>
        <StatCard>
          <h3>99%</h3>
          <p>Accuracy Leader</p>
        </StatCard>
      </StatsWrapper>
      <PlayButtonWrapper>
        <StyledButton
          variant='primary'
          size='large'
          onClick={() => navigate("/register")}
        >
          PLAY NOW
        </StyledButton>
      </PlayButtonWrapper>
    </HomePageWrapper>
  );
};

const fadeInUp = keyframes`
  0% {
    opacity: 0;
    transform: translateY(40px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
`;

const HomePageWrapper = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(145deg,rgb(76, 92, 92),rgb(14, 15, 15));
  color: white;
  overflow: hidden;
`;

const GridOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url('/images/grid-pattern.png');
  opacity: 0.05;
  pointer-events: none;
`;

const GlowTitle = styled.h1`
  font-size: 3.5rem;
  text-align: center;
  margin-bottom: 30px;
  color: #c0392b; /* Darker laser red */
  text-shadow: 0 0 8px rgba(192, 57, 43, 0.4), 0 0 20px rgba(231, 76, 60, 0.2);
  animation: ${fadeInUp} 1.2s ease-out;
`;

const TargetWrapper = styled.div`
  margin-bottom: 30px;
  animation: ${fadeInUp} 1.4s ease-out;
`;

const StatsWrapper = styled.div`
  display: flex;
  gap: 1.5rem;
  margin: 20px 0 40px;
  flex-wrap: wrap;
  justify-content: center;
  animation: ${fadeInUp} 1.6s ease-out;
`;

const StatCard = styled.div`
  background: rgba(255, 255, 255, 0.07);
  padding: 1.5rem 2rem;
  border-radius: 16px;
  text-align: center;
  min-width: 150px;
  backdrop-filter: blur(8px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);

  h3 {
    font-size: 2rem;
    color: #f39c12;
    margin-bottom: 5px;
  }

  p {
    font-size: 0.95rem;
    color: #ecf0f1;
    opacity: 0.8;
  }
`;

const PlayButtonWrapper = styled.div`
  margin-bottom: 60px;
  animation: ${fadeInUp} 1.8s ease-out;
`;

const StyledButton = styled(Button)`
  width: 250px;
  height: 60px;
  font-size: 24px;
  border-radius: 30px;

  transition: all 0.3s ease;
  background-color: #b71c1c !important;
  color: white !important;
  border: none;

  transition: transform 0.3s;


  &:hover {
    transform: scale(1.05);
    background-color: #7f0000 !important;
  }
`;

export default HomePage;

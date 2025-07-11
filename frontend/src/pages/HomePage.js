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
      <MilitaryOverlay />
      <MainContent>
        <HeaderWrapper>
          <Header />
        </HeaderWrapper>

        <TargetWrapper>
          <TargetBox>
            <Target />
          </TargetBox>
        </TargetWrapper>

        <PlayButtonWrapper>
          <StyledButton
            variant='primary'
            size='large'
            onClick={() => navigate("/register")}
          >
            BEGIN MISSION
          </StyledButton>
        </PlayButtonWrapper>

        <Stats>
          <Stat><strong>847</strong><span>OPERATIVES ACTIVE</span></Stat>
          <Stat><strong>98.2%</strong><span>MISSION SUCCESS</span></Stat>
          <Stat><strong>15,673</strong><span>TARGETS ELIMINATED</span></Stat>
        </Stats>

        <SystemStatus>SYSTEM STATUS: OPERATIONAL</SystemStatus>
      </MainContent>
    </HomePageWrapper>
  );
};

const HomePageWrapper = styled.div`
  position: relative;
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1a1a 0%, #2d3436 25%, #1e2124 50%, #36454f 75%, #2c3e50 100%);
  font-family: 'Courier New', monospace;
  overflow-x: hidden;
`;

const MilitaryOverlay = styled.div`
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(76, 175, 80, 0.2) 1px, transparent 1px),
    linear-gradient(90deg, rgba(76, 175, 80, 0.2) 1px, transparent 1px);
  background-size: 40px 40px;
  opacity: 0.15;
  pointer-events: none;
  z-index: 0;
`;

const MainContent = styled.div`
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 40px;
  padding-bottom: 100px;
`;

const HeaderWrapper = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
`;

const TargetWrapper = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  margin: 30px 0 40px;
`;

const TargetBox = styled.div`
  position: relative;
  z-index: 1;
  padding: 20px;
  /* Debugging: See actual box area */
  /* outline: 1px solid red; */
`;

const PlayButtonWrapper = styled.div`
  margin-bottom: 60px;
`;

const StyledButton = styled(Button)`
  width: 260px;
  height: 60px;
  font-size: 22px;
  font-weight: bold;
  border-radius: 30px;
  transition: transform 0.3s;
  background: linear-gradient(135deg, #4CAF50, #2E7D32);
  color: #C8E6C9;
  border: 2px solid #1B5E20;
  box-shadow: 0 10px 20px rgba(76, 175, 80, 0.2);

  &:hover {
    transform: scale(1.05);
    background: linear-gradient(135deg, #66BB6A, #4CAF50);
  }
`;

const Stats = styled.div`
  display: flex;
  justify-content: center;
  gap: 60px;
  margin-top: 20px;
  flex-wrap: wrap;
`;

const Stat = styled.div`
  text-align: center;
  color: #A5D6A7;

  strong {
    display: block;
    font-size: 32px;
    color: #4CAF50;
  }

  span {
    display: block;
    font-size: 12px;
    margin-top: 5px;
    text-transform: uppercase;
    letter-spacing: 1px;
  }
`;

const SystemStatus = styled.div`
  margin-top: 40px;
  padding: 10px 20px;
  border-radius: 12px;
  border: 1px solid rgba(76, 175, 80, 0.3);
  background-color: rgba(76, 175, 80, 0.05);
  color: #C8E6C9;
  font-family: monospace;
  font-size: 14px;
`;

export default HomePage;

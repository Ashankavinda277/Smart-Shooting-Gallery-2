import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import Loader from '../components/common/Loader';

const FinalPage = ({ onStart }) => {
  const navigate = useNavigate();

  return (
    <FinalPageWrapper>
      <Header>🎯 SMART SHOOTING GALLERY 🎯</Header>
      <ContentWrapper>
        <Overlay>
          <GameLogo>
            <img src="/logo192.png" alt="Game Logo" />
          </GameLogo>
          <WelcomeText>Welcome, Sharpshooter!</WelcomeText>
          <SubText>Test your aim, climb the leaderboard, and become a legend.</SubText>
          <ButtonContainer>
            <StartButton onClick={onStart}>Start Game</StartButton>
            <MenuButton onClick={() => navigate('/leaderboard')}>Leaderboard</MenuButton>
            <MenuButton onClick={() => navigate('/progress')}>Player Progress</MenuButton>
          </ButtonContainer>
        </Overlay>
        <LoaderWrapper>
          <StyledLoader />
        </LoaderWrapper>
      </ContentWrapper>
      <Footer>© {new Date().getFullYear()} Smart Shooting Gallery</Footer>
    </FinalPageWrapper>
  );
};

const FinalPageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100vw;
  height: 100vh;
  background: linear-gradient(135deg, #232526 0%, #414345 100%);
  text-align: center;
  color: #fff;
  position: relative;
`;

const Header = styled.h1`
  font-size: 3.5rem;
  margin-top: 2rem;
  margin-bottom: 1.5rem;
  color: #ffd700;
  letter-spacing: 2px;
  text-shadow: 0 2px 8px #000a;
`;

const GameLogo = styled.div`
  margin-bottom: 1.5rem;
  img {
    width: 90px;
    height: 90px;
    border-radius: 50%;
    box-shadow: 0 4px 24px #0006;
    background: #fff;
    object-fit: cover;
  }
`;

const WelcomeText = styled.div`
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: #27ae60;
`;

const SubText = styled.div`
  font-size: 1.2rem;
  margin-bottom: 2rem;
  color: #eee;
`;

const ContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Overlay = styled.div`
  background: rgba(44, 62, 80, 0.92);
  padding: 2.5rem 2rem 2rem 2rem;
  border-radius: 18px;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 8px 32px #0005;
  min-width: 340px;
`;

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 18px;
  margin-top: 1.5rem;
`;

const StartButton = styled.button`
  width: 250px;
  padding: 18px;
  font-size: 1.4rem;
  border: none;
  border-radius: 10px;
  background: linear-gradient(90deg, #27ae60 0%, #219a52 100%);
  color: #fff;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 2px 8px #0003;
  transition: transform 0.18s, box-shadow 0.18s;
  &:hover {
    transform: scale(1.06);
    box-shadow: 0 4px 16px #27ae6077;
  }
`;

const MenuButton = styled(StartButton)`
  background: linear-gradient(90deg, #34495e 0%, #2c3e50 100%);
  color: #ffd700;
  font-weight: 600;
  &:hover {
    background: linear-gradient(90deg, #2c3e50 0%, #34495e 100%);
    color: #fff;
  }
`;

const LoaderWrapper = styled.div`
  margin-top: 28px;
`;

const StyledLoader = styled(Loader)`
  transform: scale(0.5);
`;

const Footer = styled.footer`
  position: absolute;
  bottom: 18px;
  left: 0;
  width: 100vw;
  text-align: center;
  color: #aaa;
  font-size: 1rem;
  letter-spacing: 1px;
  opacity: 0.8;
`;

export default FinalPage;
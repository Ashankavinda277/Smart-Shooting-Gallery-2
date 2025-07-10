const PauseButton = styled.button`
  position: absolute;
  top: 30px;
  right: 30px;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.2);
  cursor: pointer;
  z-index: 15;
  font-size: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
  
  &:hover {
    background: rgba(0, 0, 0, 0.9);
    transform: scale(1.1);
    border-color: rgba(255, 255, 255, 0.4);
  }
`;

const GameResultOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(0, 0, 0, 0.9);
  backdrop-filter: blur(20px);
  z-index: 25;
`;

const ResultContent = styled.div`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 3rem;
  text-align: center;
  border: 2px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
  max-width: 500px;
  
  h2 {
    font-size: 2.5rem;
    margin-bottom: 2rem;
    color: #00d4ff;
    font-weight: 900;
    text-shadow: 0 0 20px rgba(0, 212, 255, 0.5);
  }
`;

const StatsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
`;

const StatItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  
  span {
    color: #bdc3c7;
    font-size: 1.1rem;
  }
  
  strong {
    color: #ffffff;
    font-size: 1.2rem;
  }
`;

const ScoreValue = styled.strong`
  color: #00d4ff !important;
  font-size: 2rem !important;
  text-shadow: 0 0 15px rgba(0, 212, 255, 0.5);
`;

const ButtonsContainer = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
`;

const Button = styled.button`
  padding: 1rem 2rem;
  font-size: 1.1rem;
  font-weight: bold;
  border: none;
  border-radius: 25px;
  cursor: pointer;
  transition: all 0.3s;
  
  ${props => props.primary ? `
    background: linear-gradient(45deg, #27ae60, #2ecc71);
    color: white;
    box-shadow: 0 4px 15px rgba(39, 174, 96, 0.4);
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(39, 174, 96, 0.6);
    }
  ` : `
    background: rgba(255, 255, 255, 0.1);
    color: white;
    border: 2px solid rgba(255, 255, 255, 0.2);
    
    &:hover {
      background: rgba(255, 255, 255, 0.2);
      transform: translateY(-2px);
    }
  `}
`;

const LoadingOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: rgba(0, 0, 0, 0.9);
  backdrop-filter: blur(20px);
  z-index: 30;
`;

const LoadingText = styled.p`
  margin-top: 1rem;
  font-size: 1.2rem;
  color: #00d4ff;
  font-weight: 500;
`;

export default PlayPage;
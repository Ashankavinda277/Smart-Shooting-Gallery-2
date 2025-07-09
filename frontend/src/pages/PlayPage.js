import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useGameContext } from '../contexts/GameContext';
import Target from '../components/common/Target';
import { submitScore } from '../services/api';
import Loader from '../components/Loader';

const PlayPage = () => {
  // Game state management
  const [gameState, setGameState] = useState('ready'); // ready, playing, paused, finished
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [targetPosition, setTargetPosition] = useState({ left: 50, top: 50 });
  const [targets, setTargets] = useState([]);
  const [hitPositions, setHitPositions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [gameStats, setGameStats] = useState({
    accuracy: 0,
    hitsPerSecond: 0,
    totalClicks: 0,
    totalHits: 0,
  });

  // References
  const gameAreaRef = useRef(null);
  const intervalRef = useRef(null);
  const totalClicks = useRef(0);
  const wsRef = useRef(null);
  
  // Navigation and context
  const navigate = useNavigate();
  const { user, gameMode, gameSettings } = useGameContext();
  
  // Settings based on game mode
  const settings = useRef({
    gameDuration: 60, // default - will be updated based on game mode
    targetSpeed: 1500,
    targetSize: 80,
    targetCount: 1,
    targetColors: ['#27ae60']
  });
  
  // Initialize game settings based on game mode
  useEffect(() => {
    if (!gameMode) {
      // Default to easy if no mode is set
      setModeDifficulty('easy');
    } else {
      setModeDifficulty(gameMode);
    }
  }, [gameMode]);
  
  // Set game difficulty based on mode
  const setModeDifficulty = (mode) => {
    switch(mode) {
      case 'hard':
        settings.current = {
          gameDuration: 45,
          targetSpeed: 800,
          targetSize: 60,
          targetCount: 3,
          targetColors: ['#e74c3c', '#3498db', '#e67e22']
        };
        break;
      case 'medium':
        settings.current = {
          gameDuration: 60,
          targetSpeed: 1200,
          targetSize: 70,
          targetCount: 2,
          targetColors: ['#2ecc71', '#e67e22']
        };
        break;
      default: // 'easy'
        settings.current = {
          gameDuration: 90,
          targetSpeed: 1500,
          targetSize: 80,
          targetCount: 1,
          targetColors: ['#27ae60']
        };
    }
    
    setTimeLeft(settings.current.gameDuration);
  };
  
  // Generate random targets
  const generateTargets = () => {
    if (!gameAreaRef.current) return;
    
    const { width, height } = gameAreaRef.current.getBoundingClientRect();
    const { targetCount, targetSize, targetColors } = settings.current;
    
    const newTargets = [];
    for (let i = 0; i < targetCount; i++) {
      const left = Math.random() * (width - targetSize);
      const top = Math.random() * (height - targetSize);
      
      newTargets.push({
        id: `target-${Date.now()}-${i}`,
        left,
        top,
        color: targetColors[i % targetColors.length],
        size: targetSize
      });
    }
    
    setTargets(newTargets);
  };
  
  // WebSocket connection setup
  const setupWebSocket = () => {
    try {
      // Replace with your WebSocket URL
      const wsUrl = process.env.REACT_APP_WS_URL || 'ws://localhost:8080';
      wsRef.current = new WebSocket(wsUrl);
      
      wsRef.current.onopen = () => {
        console.log('WebSocket connected');
      };
      
      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('Received data from WebSocket:', data);
          
          // Update score based on count data from WebSocket
          if (data.type === 'count' && data.count !== undefined) {
            setScore(data.count);
          }
          
          // Handle hit messages from NodeMCU
          if (data.type === 'hit' && data.value === 'HIT') {
            console.log('Hit detected from NodeMCU');
            setScore(prev => prev + 1);
            
            // Add hit animation at center of game area
            if (gameAreaRef.current) {
              const rect = gameAreaRef.current.getBoundingClientRect();
              const centerX = rect.width / 2;
              const centerY = rect.height / 2;
              
              setHitPositions(prev => [...prev, { 
                x: centerX, 
                y: centerY, 
                id: Date.now() 
              }]);
              
              // Generate new targets after hit
              setTimeout(() => {
                generateTargets();
              }, 100);
            }
          }
          
          // Handle other WebSocket messages if needed
          if (data.type === 'hit' && data.position) {
            setHitPositions(prev => [...prev, { 
              x: data.position.x, 
              y: data.position.y, 
              id: Date.now() 
            }]);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
      
      wsRef.current.onclose = () => {
        console.log('WebSocket disconnected');
      };
      
      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    } catch (error) {
      console.error('Failed to setup WebSocket:', error);
    }
  };
  
  // Close WebSocket connection
  const closeWebSocket = () => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  };
  
  // Start the game
  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setTimeLeft(settings.current.gameDuration);
    totalClicks.current = 0;
    setHitPositions([]);
    generateTargets();
    
    // Setup WebSocket connection
    setupWebSocket();
    
    // Start the timer
    intervalRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          endGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };
  
  // Pause the game
  const pauseGame = () => {
    if (gameState === 'playing') {
      clearInterval(intervalRef.current);
      setGameState('paused');
    } else if (gameState === 'paused') {
      // Resume game
      setGameState('playing');
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            endGame();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  };
  
  // End the game
  const endGame = () => {
    clearInterval(intervalRef.current);
    setGameState('finished');
    
    // Close WebSocket connection
    closeWebSocket();
    
    // Calculate final stats
    const accuracy = totalClicks.current > 0 
      ? (score / totalClicks.current) * 100 
      : 0;
      
    const hitsPerSecond = (settings.current.gameDuration - timeLeft > 0)
      ? score / (settings.current.gameDuration - timeLeft)
      : 0;
      
    setGameStats({
      accuracy,
      hitsPerSecond,
      totalClicks: totalClicks.current,
      totalHits: score
    });
    
    // Submit score if user is authenticated
    if (user?.id) {
      submitGameScore(score);
    }
  };
  
  // Submit score to server
  const submitGameScore = async (finalScore) => {
    setIsLoading(true);
    
    try {
      const response = await submitScore({
        userId: user.id,
        username: user.username,
        score: finalScore,
        mode: gameMode || 'easy',
        accuracy: gameStats.accuracy,
        duration: settings.current.gameDuration
      });
      
      if (!response.ok) {
        console.error('Failed to submit score:', response.error);
      }
    } catch (err) {
      console.error('Score submission error:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle clicks on the game area
  const handleGameAreaClick = (e) => {
    if (gameState !== 'playing') return;
    
    const rect = gameAreaRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Track total clicks for accuracy calculation
    totalClicks.current += 1;
    
    // Send click data to WebSocket if connected
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'click',
        position: { x, y },
        timestamp: Date.now()
      }));
    }
    
    // Check if click hit any target
    let hit = false;
    targets.forEach(target => {
      const targetCenterX = target.left + (target.size / 2);
      const targetCenterY = target.top + (target.size / 2);
      const distance = Math.sqrt(
        Math.pow(x - targetCenterX, 2) + Math.pow(y - targetCenterY, 2)
      );
      
      // If distance is less than target radius, it's a hit
      if (distance <= target.size / 2) {
        hit = true;
        
        // Send hit data to WebSocket
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({
            type: 'hit',
            position: { x, y },
            targetId: target.id,
            timestamp: Date.now()
          }));
        }
        
        // Add hit animation
        setHitPositions(prev => [...prev, { x, y, id: Date.now() }]);
        // Note: Score is now updated from WebSocket, not locally
      }
    });
    
    // Generate new targets on hit or every few seconds
    if (hit) {
      setTimeout(() => {
        generateTargets();
      }, 100);
    }
  };
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      closeWebSocket();
    };
  }, []);
  
  // Move targets randomly every few seconds if not hit
  useEffect(() => {
    if (gameState !== 'playing') return;
    
    const moveInterval = setInterval(() => {
      generateTargets();
    }, settings.current.targetSpeed);
    
    return () => clearInterval(moveInterval);
  }, [gameState]);
  
  // Game result display
  const renderGameResult = () => {
    return (
      <GameResultOverlay>
        <ResultContent>
          <h2>Game Over!</h2>
          <StatsList>
            <StatItem>
              <span>Score:</span>
              <strong>{score} points</strong>
            </StatItem>
            <StatItem>
              <span>Accuracy:</span>
              <strong>{gameStats.accuracy.toFixed(1)}%</strong>
            </StatItem>
            <StatItem>
              <span>Hits per second:</span>
              <strong>{gameStats.hitsPerSecond.toFixed(2)}</strong>
            </StatItem>
          </StatsList>
          <ButtonsContainer>
            <Button primary onClick={() => startGame()}>Play Again</Button>
            <Button onClick={() => navigate('/leaderboard')}>View Leaderboard</Button>
            <Button onClick={() => navigate('/final-page')}>Main Menu</Button>
          </ButtonsContainer>
        </ResultContent>
      </GameResultOverlay>
    );
  };
  
  return (
    <PlayPageWrapper>
      {/* Game Header */}
      <GameHeader>
        <div>Mode: <strong>{gameMode || 'Easy'}</strong></div>
        <ScoreDisplay>Score: {score}</ScoreDisplay>
        <TimeDisplay>{timeLeft} seconds</TimeDisplay>
      </GameHeader>
      
      {/* Game Container */}
      <GameContainer>
        {/* Start Screen */}
        {gameState === 'ready' && (
          <StartScreen>
            <h2>Ready to Play?</h2>
            <p>Click targets as quickly as you can!</p>
            <Button primary onClick={startGame}>Start Game</Button>
          </StartScreen>
        )}
        
        {/* Game Area */}
        <GameArea 
          ref={gameAreaRef} 
          onClick={handleGameAreaClick}
          active={gameState === 'playing'}
        >
          {/* Targets */}
          {targets.map(target => (
            <TargetWrapper 
              key={target.id}
              style={{
                left: `${target.left}px`,
                top: `${target.top}px`,
                width: `${target.size}px`,
                height: `${target.size}px`,
              }}
            >
              <Target color={target.color} />
            </TargetWrapper>
          ))}
          
          {/* Hit Animations */}
          {hitPositions.map(hit => (
            <HitAnimation 
              key={hit.id} 
              style={{ left: `${hit.x}px`, top: `${hit.y}px` }}
            />
          ))}
        </GameArea>
        
        {/* Pause Button */}
        {(gameState === 'playing' || gameState === 'paused') && (
          <PauseButton onClick={pauseGame}>
            {gameState === 'paused' ? 'Resume' : 'Pause'}
          </PauseButton>
        )}
        
        {/* Game Over Overlay */}
        {gameState === 'finished' && renderGameResult()}
        
        {/* Loading Overlay */}
        {isLoading && (
          <LoadingOverlay>
            <Loader />
            <p>Submitting score...</p>
          </LoadingOverlay>
        )}
      </GameContainer>
    </PlayPageWrapper>
  );
};

const PlayPageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100vw;
  height: 100vh;
  background: #1a1a2e;
  overflow: hidden;
`;

const GameHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background: rgba(0, 0, 0, 0.3);
  color: white;
`;

const ScoreDisplay = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  color: #2ecc71;
`;

const TimeDisplay = styled.div`
  font-size: 1.2rem;
  color: #e67e22;
`;

const GameContainer = styled.div`
  position: relative;
  flex: 1;
  width: 100%;
  overflow: hidden;
`;

const GameArea = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  cursor: ${props => props.active ? 'crosshair' : 'default'};
  background: #2c3e50;
`;

const TargetWrapper = styled.div`
  position: absolute;
  transition: all 0.1s ease-out;
`;

const HitAnimation = styled.div`
  position: absolute;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: rgba(255, 255, 0, 0.7);
  transform: translate(-50%, -50%);
  animation: hitAnim 0.5s forwards;
  
  @keyframes hitAnim {
    0% {
      transform: translate(-50%, -50%) scale(0.5);
      opacity: 1;
    }
    100% {
      transform: translate(-50%, -50%) scale(2);
      opacity: 0;
    }
  }
`;

const StartScreen = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: rgba(0, 0, 0, 0.7);
  z-index: 10;
  color: white;
  text-align: center;
  
  h2 {
    font-size: 3rem;
    margin-bottom: 1rem;
    color: #3498db;
  }
  
  p {
    font-size: 1.5rem;
    margin-bottom: 2rem;
  }
`;

const PauseButton = styled.button`
  position: absolute;
  top: 20px;
  right: 20px;
  padding: 10px 20px;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  z-index: 5;
  
  &:hover {
    background: rgba(0, 0, 0, 0.7);
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
  background: rgba(0, 0, 0, 0.85);
  z-index: 20;
`;

const ResultContent = styled.div`
  background: rgba(44, 62, 80, 0.9);
  padding: 2rem;
  border-radius: 10px;
  text-align: center;
  color: white;
  max-width: 500px;
  
  h2 {
    font-size: 2.5rem;
    margin-bottom: 1.5rem;
    color: #f39c12;
  }
`;

const StatsList = styled.div`
  margin-bottom: 2rem;
`;

const StatItem = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 0.8rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  
  span {
    color: #bdc3c7;
  }
  
  strong {
    color: #3498db;
  }
`;

const ButtonsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Button = styled.button`
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: 5px;
  background: ${props => props.primary ? '#27ae60' : '#34495e'};
  color: white;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    transform: translateY(-2px);
    background: ${props => props.primary ? '#219a52' : '#2c3e50'};
  }
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
  background: rgba(0, 0, 0, 0.7);
  z-index: 30;
  color: white;
  
  p {
    margin-top: 1rem;
    font-size: 1.2rem;
  }
`;

export default PlayPage;

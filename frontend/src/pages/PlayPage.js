import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useGameContext } from '../contexts/GameContext';
import Target from '../components/common/Target';
import { submitScore } from '../services/api';
import Loader from '../components/Loader';

// Constants
const GAME_CONSTANTS = {
  HIT_ANIMATION_DELAY: 100,
  TARGET_SPAWN_DELAY: 100,
  TIMER_INTERVAL: 1000,
  RED_TIME_THRESHOLD: 10,
  BLINK_TIME_THRESHOLD: 5
};

const DIFFICULTY_SETTINGS = {
  easy: {
    gameDuration: 90,
    targetSpeed: 1500,
    targetSize: 80,
    targetCount: 1,
    targetColors: ['#27ae60']
  },
  medium: {
    gameDuration: 60,
    targetSpeed: 1200,
    targetSize: 70,
    targetCount: 2,
    targetColors: ['#2ecc71', '#e67e22']
  },
  hard: {
    gameDuration: 45,
    targetSpeed: 800,
    targetSize: 60,
    targetCount: 3,
    targetColors: ['#e74c3c', '#3498db', '#e67e22']
  }
};

const PlayPage = () => {
  // Game state management
  const [gameState, setGameState] = useState('ready'); // ready, playing, paused, finished
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [targets, setTargets] = useState([]);
  const [hitPositions, setHitPositions] = useState([]);
  const [missPositions, setMissPositions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState(DIFFICULTY_SETTINGS.easy);
  const [gameStats, setGameStats] = useState({
    accuracy: 0,
    hitsPerSecond: 0,
    totalClicks: 0,
    totalHits: 0,
  });

  // References
  const gameAreaRef = useRef(null);
  const timerIntervalRef = useRef(null);
  const targetMoveIntervalRef = useRef(null);
  const totalClicks = useRef(0);
  const isMounted = useRef(true);
  const gameStartTime = useRef(null);
  
  // Navigation and context
  const navigate = useNavigate();
  const { user, gameMode, gameSettings } = useGameContext();

  // Memoized game area dimensions
  const gameAreaDimensions = useMemo(() => {
    if (!gameAreaRef.current) return { width: 0, height: 0 };
    return gameAreaRef.current.getBoundingClientRect();
  }, [gameState]);

  // Initialize game settings based on game mode
  useEffect(() => {
    const mode = gameMode || 'easy';
    const newSettings = DIFFICULTY_SETTINGS[mode] || DIFFICULTY_SETTINGS.easy;
    setSettings(newSettings);
    setTimeLeft(newSettings.gameDuration);
  }, [gameMode]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMounted.current = false;
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
      if (targetMoveIntervalRef.current) {
        clearInterval(targetMoveIntervalRef.current);
      }
    };
  }, []);

  // Generate random targets with collision detection
  const generateTargets = useCallback(() => {
    if (!gameAreaRef.current || !isMounted.current) return;
    
    const rect = gameAreaRef.current.getBoundingClientRect();
    const { targetCount, targetSize, targetColors } = settings;
    
    const newTargets = [];
    const minDistance = targetSize + 10; // Minimum distance between targets
    
    for (let i = 0; i < targetCount; i++) {
      let attempts = 0;
      let validPosition = false;
      let left, top;
      
      // Try to find a valid position (avoid overlapping)
      while (!validPosition && attempts < 20) {
        left = Math.random() * (rect.width - targetSize);
        top = Math.random() * (rect.height - targetSize);
        
        // Check distance from existing targets
        validPosition = newTargets.every(target => {
          const distance = Math.sqrt(
            Math.pow(left - target.left, 2) + Math.pow(top - target.top, 2)
          );
          return distance >= minDistance;
        });
        
        attempts++;
      }
      
      newTargets.push({
        id: `target-${Date.now()}-${i}`,
        left: left || Math.random() * (rect.width - targetSize),
        top: top || Math.random() * (rect.height - targetSize),
        color: targetColors[i % targetColors.length],
        size: targetSize,
        createdAt: Date.now()
      });
    }
    
    if (isMounted.current) {
      setTargets(newTargets);
    }
  }, [settings]);

  // Start the game
  const startGame = useCallback(() => {
    if (!isMounted.current) return;
    
    setGameState('playing');
    setScore(0);
    setTimeLeft(settings.gameDuration);
    totalClicks.current = 0;
    setHitPositions([]);
    setMissPositions([]);
    gameStartTime.current = Date.now();
    
    // Generate initial targets
    generateTargets();
    
    // Start the timer
    timerIntervalRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerIntervalRef.current);
          if (isMounted.current) {
            endGame();
          }
          return 0;
        }
        return prev - 1;
      });
    }, GAME_CONSTANTS.TIMER_INTERVAL);
    
    // Start target movement
    targetMoveIntervalRef.current = setInterval(() => {
      if (isMounted.current) {
        generateTargets();
      }
    }, settings.targetSpeed);
  }, [settings, generateTargets]);

  // Pause/Resume the game
  const pauseGame = useCallback(() => {
    if (gameState === 'playing') {
      clearInterval(timerIntervalRef.current);
      clearInterval(targetMoveIntervalRef.current);
      setGameState('paused');
    } else if (gameState === 'paused') {
      setGameState('playing');
      
      // Resume timer
      timerIntervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerIntervalRef.current);
            if (isMounted.current) {
              endGame();
            }
            return 0;
          }
          return prev - 1;
        });
      }, GAME_CONSTANTS.TIMER_INTERVAL);
      
      // Resume target movement
      targetMoveIntervalRef.current = setInterval(() => {
        if (isMounted.current) {
          generateTargets();
        }
      }, settings.targetSpeed);
    }
  }, [gameState, settings.targetSpeed, generateTargets]);

  // Calculate game statistics
  const calculateGameStats = useCallback((finalScore, totalClicksCount, gameDuration) => {
    const accuracy = totalClicksCount > 0 ? (finalScore / totalClicksCount) * 100 : 0;
    const timeElapsed = gameDuration - timeLeft;
    const hitsPerSecond = timeElapsed > 0 ? finalScore / timeElapsed : 0;
    
    return {
      accuracy,
      hitsPerSecond,
      totalClicks: totalClicksCount,
      totalHits: finalScore
    };
  }, [timeLeft]);

  // End the game
  const endGame = useCallback(() => {
    if (!isMounted.current) return;
    
    // Clear all intervals
    clearInterval(timerIntervalRef.current);
    clearInterval(targetMoveIntervalRef.current);
    
    setGameState('finished');
    
    // Calculate final stats
    const finalStats = calculateGameStats(score, totalClicks.current, settings.gameDuration);
    setGameStats(finalStats);
    
    // Submit score if user is authenticated
    if (user?.id) {
      submitGameScore(score, finalStats);
    }
  }, [score, settings.gameDuration, calculateGameStats, user]);

  // Submit score to server
  const submitGameScore = useCallback(async (finalScore, stats) => {
    if (!isMounted.current) return;
    
    setIsLoading(true);
    
    try {
      const response = await submitScore({
        userId: user.id,
        username: user.username,
        score: finalScore,
        mode: gameMode || 'easy',
        accuracy: stats.accuracy,
        duration: settings.gameDuration
      });
      
      if (!response.ok) {
        console.error('Failed to submit score:', response.error);
      }
    } catch (err) {
      console.error('Score submission error:', err);
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  }, [user, gameMode, settings.gameDuration]);

  // Handle clicks on the game area with improved hit detection
  const handleGameAreaClick = useCallback((e) => {
    if (gameState !== 'playing' || !gameAreaRef.current) return;
    
    const rect = gameAreaRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Track total clicks for accuracy calculation
    totalClicks.current += 1;
    
    // Check if click hit any target using squared distance (more efficient)
    let hit = false;
    targets.forEach(target => {
      const targetCenterX = target.left + (target.size / 2);
      const targetCenterY = target.top + (target.size / 2);
      const radius = target.size / 2;
      
      // Use squared distance to avoid Math.sqrt
      const distanceSquared = Math.pow(x - targetCenterX, 2) + Math.pow(y - targetCenterY, 2);
      const radiusSquared = radius * radius;
      
      if (distanceSquared <= radiusSquared) {
        hit = true;
        // Add hit animation
        setHitPositions(prev => [...prev, { x, y, id: Date.now() }]);
        // Increase score
        setScore(prev => prev + 1);
      }
    });
    
    // Add miss animation if no hit
    if (!hit) {
      setMissPositions(prev => [...prev, { x, y, id: Date.now() }]);
    }
    
    // Generate new targets on hit
    if (hit) {
      setTimeout(() => {
        if (isMounted.current) {
          generateTargets();
        }
      }, GAME_CONSTANTS.TARGET_SPAWN_DELAY);
    }
  }, [gameState, targets, generateTargets]);

  // Clean up old animation positions
  useEffect(() => {
    const cleanupAnimations = () => {
      const now = Date.now();
      setHitPositions(prev => prev.filter(pos => now - pos.id < 500));
      setMissPositions(prev => prev.filter(pos => now - pos.id < 500));
    };
    
    const cleanup = setInterval(cleanupAnimations, 1000);
    return () => clearInterval(cleanup);
  }, []);

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
            <StatItem>
              <span>Total clicks:</span>
              <strong>{gameStats.totalClicks}</strong>
            </StatItem>
          </StatsList>
          <ButtonsContainer>
            <Button primary onClick={startGame}>Play Again</Button>
            <Button onClick={() => navigate('/leaderboard')}>View Leaderboard</Button>
            <Button onClick={() => navigate('/final-page')}>Main Menu</Button>
          </ButtonsContainer>
        </ResultContent>
      </GameResultOverlay>
    );
  };
  
  return (
    <PlayPageWrapper>
      <GameContainer>
        {/* Start Screen */}
        {gameState === 'ready' && (
          <StartScreen>
            <h2>Ready to Play?</h2>
            <p>Click targets as quickly as you can!</p>
            <p>Mode: <strong>{gameMode || 'Easy'}</strong></p>
            <p>Duration: <strong>{settings.gameDuration}s</strong></p>
            <Button primary onClick={startGame}>Start Game</Button>
          </StartScreen>
        )}

        {/* Centered Game Info */}
        {(gameState === 'playing' || gameState === 'paused') && (
          <CenteredGameInfo>
            <ScoreDisplay>Score: {score}</ScoreDisplay>
            <ModeDisplay>Mode: {gameMode || 'Easy'}</ModeDisplay>
            <TimeDisplay 
              $isRed={timeLeft <= GAME_CONSTANTS.RED_TIME_THRESHOLD}
              $shouldBlink={timeLeft <= GAME_CONSTANTS.BLINK_TIME_THRESHOLD}
            >
              Time Left: {timeLeft}s
            </TimeDisplay>
          </CenteredGameInfo>
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
          
          {/* Miss Animations */}
          {missPositions.map(miss => (
            <MissAnimation 
              key={miss.id} 
              style={{ left: `${miss.x}px`, top: `${miss.y}px` }}
            />
          ))}
        </GameArea>
        
        {/* Pause Button */}
        {(gameState === 'playing' || gameState === 'paused') && (
          <PauseButton onClick={pauseGame}>
            {gameState === 'paused' ? 'Resume' : 'Pause'}
          </PauseButton>
        )}
        
        {/* Paused Overlay */}
        {gameState === 'paused' && (
          <PausedOverlay>
            <h2>Game Paused</h2>
            <Button primary onClick={pauseGame}>Resume Game</Button>
          </PausedOverlay>
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

// Styled Components
const PlayPageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100vw;
  height: 100vh;
  background: #1a1a2e;
  overflow: hidden;
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
  transition: all 0.3s ease-out;
  z-index: 1;
`;

const HitAnimation = styled.div`
  position: absolute;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: rgba(46, 204, 113, 0.8);
  transform: translate(-50%, -50%);
  animation: hitAnim 0.5s forwards;
  z-index: 10;
  
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

const MissAnimation = styled.div`
  position: absolute;
  width: 15px;
  height: 15px;
  border-radius: 50%;
  background: rgba(231, 76, 60, 0.6);
  transform: translate(-50%, -50%);
  animation: missAnim 0.3s forwards;
  z-index: 10;
  
  @keyframes missAnim {
    0% {
      transform: translate(-50%, -50%) scale(0.3);
      opacity: 1;
    }
    100% {
      transform: translate(-50%, -50%) scale(1.5);
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
    font-size: 1.2rem;
    margin-bottom: 1rem;
    
    strong {
      color: #e74c3c;
    }
  }
`;

const PausedOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: rgba(0, 0, 0, 0.8);
  z-index: 20;
  color: white;
  text-align: center;
  
  h2 {
    font-size: 2.5rem;
    margin-bottom: 2rem;
    color: #f39c12;
  }
`;

const PauseButton = styled.button`
  position: absolute;
  top: 20px;
  right: 20px;
  padding: 10px 20px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  z-index: 5;
  font-size: 1rem;
  
  &:hover {
    background: rgba(0, 0, 0, 0.9);
  }
`;

// New Centered Game Info Styles
const CenteredGameInfo = styled.div`
  position: absolute;
  top: 15%;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.6);
  padding: 2rem 3rem;
  border-radius: 15px;
  text-align: center;
  color: white;
  z-index: 5;
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
`;

const ScoreDisplay = styled.div`
  font-size: 2.5rem;
  font-weight: bold;
  color: #3498db;
  margin-bottom: 1rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
`;

const ModeDisplay = styled.div`
  font-size: 1.8rem;
  font-weight: 600;
  color: #e67e22;
  margin-bottom: 1rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
`;

const TimeDisplay = styled.div`
  font-size: 3rem;
  font-weight: bold;
  color: ${props => props.$isRed ? '#ff3333' : '#2ecc71'};
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
  animation: ${props => props.$shouldBlink ? 'blink 0.5s infinite' : 'none'};
  
  @keyframes blink {
    0%, 50% {
      opacity: 1;
    }
    51%, 100% {
      opacity: 0.3;
    }
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
  font-size: 1rem;
  
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
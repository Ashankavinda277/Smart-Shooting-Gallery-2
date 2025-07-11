// 🕹️ PlayPage.jsx

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useGameContext } from '../contexts/GameContext';
import Target from '../components/common/Target';
import { submitScore } from '../services/api';
import Loader from '../components/common/Loader';

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

// Styled Components for Game UI (must be defined before use)
const GameWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #232526 0%, #414345 100%);
`;

const TopBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100vw;
  max-width: 900px;
  padding: 32px 32px 0 32px;
`;

const Score = styled.div`
  font-size: 2rem;
  color: #ffd700;
  font-weight: 700;
`;

const Timer = styled.div`
  font-size: 2rem;
  color: ${props => props.$low ? '#e74c3c' : '#27ae60'};
  font-weight: 700;
`;

const GameArea = styled.div`
  position: relative;
  width: 800px;
  height: 500px;
  background: #222c;
  border-radius: 18px;
  margin-top: 32px;
  overflow: hidden;
  box-shadow: 0 8px 32px #0005;
  cursor: crosshair;
`;

const HitDot = styled.div`
  position: absolute;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: rgba(46, 204, 113, 0.8);
  transform: translate(-50%, -50%);
  pointer-events: none;
`;

const MissDot = styled.div`
  position: absolute;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: rgba(231, 76, 60, 0.7);
  transform: translate(-50%, -50%);
  pointer-events: none;
`;

const PlayPage = () => {
  const { user, gameMode, gameSettings, setNeedsRefresh, loading } = useGameContext();
  // ...existing code...
  const [gameState, setGameState] = useState('ready');
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

  const gameAreaRef = useRef(null);
  const timerIntervalRef = useRef(null);
  const targetMoveIntervalRef = useRef(null);
  const totalClicks = useRef(0);
  const isMounted = useRef(true);
  const gameStartTime = useRef(null);
  const wsRef = useRef(null);

  const navigate = useNavigate();
<<<<<<< HEAD
  const { user, gameMode, gameSettings } = useGameContext();
=======
  // ...existing code...


  // Only redirect if user is explicitly null/false, not undefined (undefined = still loading)
  React.useEffect(() => {
    if (!loading && (user === null || user === false)) {
      alert('You must be logged in to play!');
      navigate('/register');
    }
  }, [user, loading, navigate]);

  // If context is still loading, show loader
  if (loading) return <Loader />;
>>>>>>> Ashan-2


  // Memoized game area dimensions
  const gameAreaDimensions = useMemo(() => {
    if (!gameAreaRef.current) return { width: 0, height: 0 };
    return gameAreaRef.current.getBoundingClientRect();
  }, [gameState]);


  
  // Settings based on game mode
  const settings = useRef({
    gameDuration: 60, // default - will be updated based on game mode
    targetSpeed: 1500,
    targetSize: 40, // reduced size
    targetCount: 1,
    targetColors: ['#27ae60']
  });

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
      clearInterval(timerIntervalRef.current);
      clearInterval(targetMoveIntervalRef.current);
      closeWebSocket();
    };
  }, []);

  // Generate random targets with collision detection
  const generateTargets = useCallback(() => {
    if (!gameAreaRef.current || !isMounted.current) return;

  // Set game difficulty based on mode
  const setModeDifficulty = (mode) => {
    switch(mode) {
      case 'hard':
        settings.current = {
          gameDuration: 45,
          targetSpeed: 800,
          targetSize: 30, // reduced size
          targetCount: 3,
          targetColors: ['#e74c3c', '#3498db', '#e67e22']
        };
        break;
      case 'medium':
        settings.current = {
          gameDuration: 60,
          targetSpeed: 1200,
          targetSize: 35, // reduced size
          targetCount: 2,
          targetColors: ['#2ecc71', '#e67e22']
        };
        break;
      default: // 'easy'
        settings.current = {
          gameDuration: 90,
          targetSpeed: 1500,
          targetSize: 40, // reduced size
          targetCount: 1,
          targetColors: ['#27ae60']
        };
    }

    
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


    setTargets(newTargets);
  };
  
  // WebSocket connection setup with handshake
  const setupWebSocket = () => {
    try {
      // Replace with your WebSocket URL
      const wsUrl = process.env.REACT_APP_WS_URL || 'ws://localhost:5000';
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log('✅ WebSocket connected');

        // 🔐 IDENTIFY to backend (handshake)
        const handshakeMessage = {
          type: "identify",
          clientType: "web",
          sessionId: user?.id || "guest_" + Date.now(),
          playerName: user?.username || "Guest"
        };

        wsRef.current.send(JSON.stringify(handshakeMessage));
        console.log("📤 Sent handshake message:", handshakeMessage);
      };

      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('📥 WebSocket message received:', data);

          // Score sync (from NodeMCU)
          if (data.type === 'count' && data.count !== undefined) {
            setScore(data.count);
          }

          // NodeMCU hit event
          if (data.type === 'hit' && data.value === 'HIT') {
            console.log('🎯 HIT detected from NodeMCU');
            setScore(prev => prev + 1);

            // Show hit animation at center
            if (gameAreaRef.current) {
              const rect = gameAreaRef.current.getBoundingClientRect();
              const centerX = rect.width / 2;
              const centerY = rect.height / 2;

              setHitPositions(prev => [...prev, { x: centerX, y: centerY, id: Date.now() }]);
              setTimeout(generateTargets, 100);
            }
          }

          // Optional: hit from frontend (with coordinates)
          if (data.type === 'hit' && data.position) {
            setHitPositions(prev => [...prev, { 
              x: data.position.x, 
              y: data.position.y, 
              id: Date.now() 
            }]);
          }

        } catch (error) {
          console.error('❌ Error parsing WebSocket message:', error);
        }
      };

      wsRef.current.onclose = () => {
        console.log('⚠️ WebSocket disconnected');
      };

      wsRef.current.onerror = (error) => {
        console.error('🚫 WebSocket error:', error);
      };

    } catch (error) {
      console.error('❌ Failed to setup WebSocket:', error);
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
    
    // Setup WebSocket connection
    setupWebSocket();
    
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

<<<<<<< HEAD
  // End the game
  const endGame = useCallback(() => {
    if (!isMounted.current) return;
    
    // Clear all intervals
    clearInterval(timerIntervalRef.current);
    clearInterval(targetMoveIntervalRef.current);
    
    setGameState('finished');
    
    // Close WebSocket connection
    closeWebSocket();
    
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
=======
  const submitGameScore = useCallback(async (finalScore, stats, timePlayedOverride) => {
>>>>>>> Ashan-2
    if (!isMounted.current) return;
    
    setIsLoading(true);
    
    try {
      // Defensive: handle missing user gracefully
      const userId = user && (user.id || user._id) ? (user.id || user._id) : null;
      const username = user && user.username ? user.username : 'Guest';
      const response = await submitScore({
        user: userId,
        username: username,
        score: finalScore,
        accuracy: stats.accuracy,
        gameMode: gameMode || 'easy',
        timePlayed: typeof timePlayedOverride === 'number' ? timePlayedOverride : settings.gameDuration
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

<<<<<<< HEAD
  // Handle clicks on the game area with improved hit detection
=======
  const endGame = useCallback(() => {
    if (!isMounted.current) return;
    clearInterval(timerIntervalRef.current);
    clearInterval(targetMoveIntervalRef.current);
    closeWebSocket();
    setGameState('finished');
    // Calculate actual time played if quitting early
    const timePlayed = settings.gameDuration - timeLeft;
    const finalStats = calculateGameStats(score, totalClicks.current, timePlayed);
    setGameStats(finalStats);
    if (!user || !(user.id || user._id)) {
      alert('You must be logged in to save your score!');
      localStorage.setItem('leaderboardRefresh', Date.now().toString());
      return;
    }
    submitGameScore(score, finalStats, timePlayed).then(() => {
      if (setNeedsRefresh) setNeedsRefresh(true);
      localStorage.setItem('leaderboardRefresh', Date.now().toString());
    });
  }, [score, settings.gameDuration, timeLeft, calculateGameStats, user, setNeedsRefresh, submitGameScore]);

>>>>>>> Ashan-2
  const handleGameAreaClick = useCallback((e) => {
    if (gameState !== 'playing' || !gameAreaRef.current) return;
    
    const rect = gameAreaRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Track total clicks for accuracy calculation
    totalClicks.current += 1;
    

    // Check if click hit any target using squared distance (more efficient)

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
      const radius = target.size / 2;
      
      // Use squared distance to avoid Math.sqrt
      const distanceSquared = Math.pow(x - targetCenterX, 2) + Math.pow(y - targetCenterY, 2);
      const radiusSquared = radius * radius;
      
      if (distanceSquared <= radiusSquared) {
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

<<<<<<< HEAD
  // Clean up old animation positions
  useEffect(() => {

    const cleanupAnimations = () => {
      const now = Date.now();
      setHitPositions(prev => prev.filter(pos => now - pos.id < 500));
      setMissPositions(prev => prev.filter(pos => now - pos.id < 500));

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      closeWebSocket();

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

      {/* Removed GameHeader */}
      {/* Game Container */}

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

        {/* Centered Game Info when playing */}
        {gameState === 'playing' && (
          <CenteredGameInfo>
            <InfoItem>
              <span>Score :</span>
              <strong>{score}</strong>
            </InfoItem>
            <InfoItem>
              <span>Mode :</span>
              <strong>{gameMode || 'Easy'}</strong>
            </InfoItem>
            <InfoItem>
              <span>Time Left :</span>
              <strong>{timeLeft} s</strong>
            </InfoItem>

          </CenteredGameInfo>
        )}
        
        {/* Game Area */}
        <GameArea 
          ref={gameAreaRef} 
          onClick={handleGameAreaClick}
          $active={gameState === 'playing'}
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
                filter: 'blur(2px)' // add blur effect
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
=======
  // Show FinalPage after game mode selection, and navigate to PlayPage on Start
  const [showFinal, setShowFinal] = useState(true);
  const [finalPageStart, setFinalPageStart] = useState(false);
  const FinalPage = React.useMemo(() => React.lazy(() => import('./FinalPage')), []);

  // Main render block
  return (
    <>
      {showFinal && !finalPageStart ? (
        <React.Suspense fallback={<div style={{color:'red',fontSize:24}}>Loading game page...</div>}>
          <FinalPage
            onStart={() => {
              setShowFinal(false);
              setFinalPageStart(true);
              setTimeout(() => {
                startGame();
              }, 0);
            }}
            score={score}
            timeLeft={timeLeft}
          />
        </React.Suspense>
      ) : gameState === 'playing' ? (
        <GameWrapper>
          <TopBar>
            <Score>Score: {score}</Score>
            <Timer $low={timeLeft <= GAME_CONSTANTS.RED_TIME_THRESHOLD}>{timeLeft}s</Timer>
            <div style={{ display: 'flex', gap: 16 }}>
              <button
                style={{
                  fontSize: 16,
                  padding: '8px 18px',
                  borderRadius: 8,
                  border: 'none',
                  background: '#f39c12',
                  color: '#fff',
                  cursor: 'pointer',
                  marginRight: 8
                }}
                onClick={pauseGame}
              >
                Pause
              </button>
              <button
                style={{
                  fontSize: 16,
                  padding: '8px 18px',
                  borderRadius: 8,
                  border: 'none',
                  background: '#e74c3c',
                  color: '#fff',
                  cursor: 'pointer'
                }}
                onClick={() => {
                  // End game and show results
                  endGame();
                }}
              >
                Quit
              </button>
            </div>
          </TopBar>
          <GameArea ref={gameAreaRef} onClick={handleGameAreaClick}>
            {targets.map(target => (
              <Target
                key={target.id}
                color={target.color}
                style={{
                  position: 'absolute',
                  left: target.left,
                  top: target.top,
                  width: target.size,
                  height: target.size
                }}
              />
            ))}
            {hitPositions.map(hit => (
              <HitDot key={hit.id} style={{ left: hit.x, top: hit.y }} />
            ))}
            {missPositions.map(miss => (
              <MissDot key={miss.id} style={{ left: miss.x, top: miss.y }} />
            ))}
          </GameArea>
        </GameWrapper>
      ) : gameState === 'paused' ? (
        <GameWrapper>
          <TopBar>
            <Score>Score: {score}</Score>
            <Timer $low={timeLeft <= GAME_CONSTANTS.RED_TIME_THRESHOLD}>{timeLeft}s</Timer>
          </TopBar>
          <div style={{ color: '#fff', marginTop: 64, fontSize: 32, textAlign: 'center' }}>
            <div>Game Paused</div>
            <button
              style={{ marginTop: 32, fontSize: 20, padding: '12px 32px', borderRadius: 8, border: 'none', background: '#27ae60', color: '#fff', cursor: 'pointer' }}
              onClick={pauseGame}
            >
              Resume
            </button>
            <button
              style={{ marginTop: 24, marginLeft: 16, fontSize: 18, padding: '10px 24px', borderRadius: 8, border: 'none', background: '#e74c3c', color: '#fff', cursor: 'pointer' }}
              onClick={endGame}
            >
              Quit
            </button>
          </div>
        </GameWrapper>
      ) : gameState === 'finished' ? (
        <GameWrapper>
          <TopBar>
            <Score>Final Score: {score}</Score>
          </TopBar>
          <div style={{ color: '#fff', marginTop: 32, fontSize: 24, textAlign: 'center' }}>
            <div>Game Over!</div>
            <div style={{ margin: '16px 0', fontSize: 22 }}>
              <b>Player:</b> {user?.username || 'Guest'}<br />
              <b>Game Mode:</b> {gameMode || 'easy'}<br />
              <b>Score:</b> {score}
            </div>
            <div>Accuracy: {gameStats.accuracy.toFixed(1)}%</div>
            <div>Hits per Second: {gameStats.hitsPerSecond.toFixed(2)}</div>
            <div>Total Hits: {gameStats.totalHits}</div>
            <button
              style={{ marginTop: 24, fontSize: 18, padding: '10px 24px', borderRadius: 8, border: 'none', background: '#27ae60', color: '#fff', cursor: 'pointer' }}
              onClick={() => {
                setShowFinal(true);
                setFinalPageStart(false);
                setGameState('ready');
              }}
            >
              Play Again
            </button>
          </div>
        </GameWrapper>
      ) : null}
    </>
>>>>>>> Ashan-2
  );
}

// Styled Components
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
  min-height: 60px;
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
  cursor: ${props => props.$active ? 'crosshair' : 'default'};
  background: #2c3e50;
`;

const TargetWrapper = styled.div`
  position: absolute;

  transition: all 0.3s ease-out;
  z-index: 1;

  transition: all 0.1s ease-out;
  /* filter: blur(2px); // moved to inline style for dynamic blur */

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

const CenteredGameInfo = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(44, 62, 80, 0.85);
  padding: 2rem 3rem;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 15;
  min-width: 300px;
  gap: 1.5rem;
  box-shadow: 0 8px 32px rgba(0,0,0,0.25);
`;

const InfoItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 1.5rem;
  color: #fff;

  span {
    font-size: 1.1rem;
    color: #bdc3c7;
    margin-bottom: 0.2rem;
  }
  strong {
    font-size: 2.2rem;
    color: #f39c12;
  }
`;

export default PlayPage;
  strong {
    font-size: 2.2rem;
    color: #f39c12;
  }
`;

export default PlayPage;

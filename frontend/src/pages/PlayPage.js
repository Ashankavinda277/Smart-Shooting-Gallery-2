
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
      // Defensive: handle missing user gracefully
      const userId = user && user.id ? user.id : null;
      const username = user && user.username ? user.username : 'Guest';
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
    if (!user || !user.id) {
      alert('You must be logged in to save your score!');
      localStorage.setItem('leaderboardRefresh', Date.now().toString());
      return;
    }
    submitGameScore(score, finalStats, timePlayed).then(() => {
      if (setNeedsRefresh) setNeedsRefresh(true);
      localStorage.setItem('leaderboardRefresh', Date.now().toString());
    });
  }, [score, settings.gameDuration, timeLeft, calculateGameStats, user, setNeedsRefresh, submitGameScore]);

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

  // Show FinalPage after game mode selection, and navigate to PlayPage on Start
  const [showFinal, setShowFinal] = useState(true);
  const [finalPageStart, setFinalPageStart] = useState(false);

  if (showFinal && !finalPageStart) {
    const FinalPage = React.lazy(() => import('./FinalPage'));
    return (
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
    );
  }

  // Show the actual PlayPage game UI (not the placeholder)
  if (gameState === 'playing') {
    return (
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
    );
  }

  // Show paused UI
  if (gameState === 'paused') {
    return (
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
    );
  }

  // Show results after game ends
  if (gameState === 'finished') {
    return (
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
          <div>Total Clicks: {gameStats.totalClicks}</div>
          <div>Total Hits: {gameStats.totalHits}</div>
          <button style={{ marginTop: 24, fontSize: 18, padding: '10px 24px', borderRadius: 8, border: 'none', background: '#27ae60', color: '#fff', cursor: 'pointer' }} onClick={() => window.location.reload()}>Play Again</button>
        </div>

      </GameWrapper>
    );
  }


  // Optionally, handle other states (paused, etc.)
  return null;
}

export default PlayPage;
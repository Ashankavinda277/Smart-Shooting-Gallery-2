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

const PlayPage = () => {
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
  const { user, gameMode, gameSettings } = useGameContext();

  const gameAreaDimensions = useMemo(() => {
    if (!gameAreaRef.current) return { width: 0, height: 0 };
    return gameAreaRef.current.getBoundingClientRect();
  }, [gameState]);

  useEffect(() => {
    const mode = gameMode || 'easy';
    const newSettings = DIFFICULTY_SETTINGS[mode] || DIFFICULTY_SETTINGS.easy;
    setSettings(newSettings);
    setTimeLeft(newSettings.gameDuration);
  }, [gameMode]);

  useEffect(() => {
    return () => {
      isMounted.current = false;
      clearInterval(timerIntervalRef.current);
      clearInterval(targetMoveIntervalRef.current);
      closeWebSocket();
    };
  }, []);

  const setupWebSocket = () => {
    try {
      const wsUrl = process.env.REACT_APP_WS_URL || 'ws://localhost:5000';
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        const handshakeMessage = {
          type: "identify",
          clientType: "web",
          sessionId: user?.id || "guest_" + Date.now(),
          playerName: user?.username || "Guest"
        };
        wsRef.current.send(JSON.stringify(handshakeMessage));
      };

      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.type === 'count' && data.count !== undefined) {
            setScore(data.count);
          }

          if (data.type === 'hit' && data.value === 'HIT') {
            setScore(prev => prev + 1);
            const rect = gameAreaRef.current?.getBoundingClientRect();
            if (rect) {
              const centerX = rect.width / 2;
              const centerY = rect.height / 2;
              setHitPositions(prev => [...prev, { x: centerX, y: centerY, id: Date.now() }]);
              setTimeout(generateTargets, 100);
            }
          }

          if (data.type === 'hit' && data.position) {
            setHitPositions(prev => [...prev, { 
              x: data.position.x, 
              y: data.position.y, 
              id: Date.now() 
            }]);
          }
        } catch (error) {
          console.error('WebSocket JSON error:', error);
        }
      };

      wsRef.current.onclose = () => console.log('WebSocket closed');
      wsRef.current.onerror = (error) => console.error('WebSocket error:', error);

    } catch (error) {
      console.error('WebSocket setup failed:', error);
    }
  };

  const closeWebSocket = () => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  };

  const generateTargets = useCallback(() => {
    if (!gameAreaRef.current || !isMounted.current) return;
    const rect = gameAreaRef.current.getBoundingClientRect();
    const { targetCount, targetSize, targetColors } = settings;
    const newTargets = [];
    const minDistance = targetSize + 10;

    for (let i = 0; i < targetCount; i++) {
      let attempts = 0;
      let validPosition = false;
      let left, top;

      while (!validPosition && attempts < 20) {
        left = Math.random() * (rect.width - targetSize);
        top = Math.random() * (rect.height - targetSize);
        validPosition = newTargets.every(target => {
          const distance = Math.hypot(left - target.left, top - target.top);
          return distance >= minDistance;
        });
        attempts++;
      }

      newTargets.push({
        id: `target-${Date.now()}-${i}`,
        left,
        top,
        color: targetColors[i % targetColors.length],
        size: targetSize,
        createdAt: Date.now()
      });
    }

    if (isMounted.current) setTargets(newTargets);
  }, [settings]);

  const startGame = useCallback(() => {
    if (!isMounted.current) return;
    setGameState('playing');
    setScore(0);
    setTimeLeft(settings.gameDuration);
    totalClicks.current = 0;
    setHitPositions([]);
    setMissPositions([]);
    gameStartTime.current = Date.now();
    generateTargets();
    setupWebSocket();

    timerIntervalRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerIntervalRef.current);
          endGame();
          return 0;
        }
        return prev - 1;
      });
    }, GAME_CONSTANTS.TIMER_INTERVAL);

    targetMoveIntervalRef.current = setInterval(() => {
      if (isMounted.current) generateTargets();
    }, settings.targetSpeed);
  }, [settings, generateTargets]);

  const pauseGame = useCallback(() => {
    if (gameState === 'playing') {
      clearInterval(timerIntervalRef.current);
      clearInterval(targetMoveIntervalRef.current);
      setGameState('paused');
    } else if (gameState === 'paused') {
      setGameState('playing');
      timerIntervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerIntervalRef.current);
            endGame();
            return 0;
          }
          return prev - 1;
        });
      }, GAME_CONSTANTS.TIMER_INTERVAL);
      targetMoveIntervalRef.current = setInterval(() => {
        if (isMounted.current) generateTargets();
      }, settings.targetSpeed);
    }
  }, [gameState, settings.targetSpeed, generateTargets]);

  const calculateGameStats = useCallback((finalScore, totalClicksCount, gameDuration) => {
    const accuracy = totalClicksCount > 0 ? (finalScore / totalClicksCount) * 100 : 0;
    const timeElapsed = gameDuration - timeLeft;
    const hitsPerSecond = timeElapsed > 0 ? finalScore / timeElapsed : 0;
    return { accuracy, hitsPerSecond, totalClicks: totalClicksCount, totalHits: finalScore };
  }, [timeLeft]);

  const endGame = useCallback(() => {
    if (!isMounted.current) return;
    clearInterval(timerIntervalRef.current);
    clearInterval(targetMoveIntervalRef.current);
    setGameState('finished');
    const finalStats = calculateGameStats(score, totalClicks.current, settings.gameDuration);
    setGameStats(finalStats);
    if (user?.id) submitGameScore(score, finalStats);
  }, [score, settings.gameDuration, calculateGameStats, user]);

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
      if (!response.ok) console.error('Submit failed:', response.error);
    } catch (err) {
      console.error('Submit error:', err);
    } finally {
      if (isMounted.current) setIsLoading(false);
    }
  }, [user, gameMode, settings.gameDuration]);

  const handleGameAreaClick = useCallback((e) => {
    if (gameState !== 'playing' || !gameAreaRef.current) return;
    const rect = gameAreaRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    totalClicks.current += 1;
    let hit = false;

    targets.forEach(target => {
      const dx = x - (target.left + target.size / 2);
      const dy = y - (target.top + target.size / 2);
      if (dx * dx + dy * dy <= (target.size / 2) ** 2) {
        hit = true;
        setHitPositions(prev => [...prev, { x, y, id: Date.now() }]);
        setScore(prev => prev + 1);
      }
    });

    if (!hit) {
      setMissPositions(prev => [...prev, { x, y, id: Date.now() }]);
    }

    if (hit) {
      setTimeout(() => {
        if (isMounted.current) generateTargets();
      }, GAME_CONSTANTS.TARGET_SPAWN_DELAY);
    }
  }, [gameState, targets, generateTargets]);

  // ... UI rendering and styled components as in your original code

  return (
    <div>/* Return full JSX content here as you already have it. Keep styling and layout same */</div>
  );
};

export default PlayPage;




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
  const [gameStats, setGameStats] = useState({
    accuracy: 0,
    hitsPerSecond: 0,
    totalClicks: 0,
    totalHits: 0
  });

  const gameAreaRef = useRef(null);
  const timerIntervalRef = useRef(null);
  const targetMoveIntervalRef = useRef(null);
  const totalClicks = useRef(0);
  const isMounted = useRef(true);
  const gameStartTime = useRef(null);
  const wsRef = useRef(null);

  const navigate = useNavigate();
  const { user, gameMode } = useGameContext();

  const settings = useMemo(() => DIFFICULTY_SETTINGS[gameMode] || DIFFICULTY_SETTINGS.easy, [gameMode]);

  useEffect(() => {
    setTimeLeft(settings.gameDuration);
  }, [settings]);

  useEffect(() => {
    return () => {
      isMounted.current = false;
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (targetMoveIntervalRef.current) clearInterval(targetMoveIntervalRef.current);
    };
  }, []);

  const generateTargets = useCallback(() => {
    if (!gameAreaRef.current || !isMounted.current) return;
    const rect = gameAreaRef.current.getBoundingClientRect();
    const newTargets = [];
    const minDistance = settings.targetSize + 10;

    for (let i = 0; i < settings.targetCount; i++) {
      let attempts = 0, validPosition = false, left, top;
      while (!validPosition && attempts < 20) {
        left = Math.random() * (rect.width - settings.targetSize);
        top = Math.random() * (rect.height - settings.targetSize);
        validPosition = newTargets.every(t => {
          const d = Math.sqrt(Math.pow(left - t.left, 2) + Math.pow(top - t.top, 2));
          return d >= minDistance;
        });
        attempts++;
      }
      newTargets.push({
        id: `target-${Date.now()}-${i}`,
        left: left || Math.random() * (rect.width - settings.targetSize),
        top: top || Math.random() * (rect.height - settings.targetSize),
        color: settings.targetColors[i % settings.targetColors.length],
        size: settings.targetSize,
        createdAt: Date.now()
      });
    }
    setTargets(newTargets);
  }, [settings]);

  const setupWebSocket = () => {
    try {
      const wsUrl = process.env.REACT_APP_WS_URL || 'ws://localhost:5000';
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log('✅ WebSocket connected');
        wsRef.current.send(JSON.stringify({
          type: 'identify',
          clientType: 'web',
          sessionId: user?.id || 'guest_' + Date.now(),
          playerName: user?.username || 'Guest'
        }));
      };

      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'count' && typeof data.count === 'number') {
            setScore(data.count);
          } else if (data.type === 'hit' && data.value === 'HIT') {
            setScore(prev => prev + 1);
            if (gameAreaRef.current) {
              const rect = gameAreaRef.current.getBoundingClientRect();
              setHitPositions(prev => [...prev, { x: rect.width / 2, y: rect.height / 2, id: Date.now() }]);
              setTimeout(generateTargets, 100);
            }
          } else if (data.type === 'target_hit' && data.scoreIncrement) {
            setScore(prev => prev + data.scoreIncrement);
            if (gameAreaRef.current) {
              const rect = gameAreaRef.current.getBoundingClientRect();
              setHitPositions(prev => [...prev, { x: rect.width / 2, y: rect.height / 2, id: Date.now() }]);
              setTimeout(generateTargets, 100);
            }
          }
          if ((data.type === 'hit' || data.type === 'target_hit') && data.position) {
            setHitPositions(prev => [...prev, { x: data.position.x, y: data.position.y, id: Date.now() }]);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      wsRef.current.onclose = () => console.log('WebSocket disconnected');
      wsRef.current.onerror = (error) => console.error('WebSocket error:', error);
    } catch (error) {
      console.error('Failed to setup WebSocket:', error);
    }
  };

  const closeWebSocket = () => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  };

  // ...rest of component code unchanged...

  return null; // Replace this with your existing JSX return if needed
};

export default PlayPage;
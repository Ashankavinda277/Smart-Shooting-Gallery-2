import React, { createContext, useState, useContext } from 'react';

// Create context
const GameContext = createContext();

// Context Provider component
export const GameProvider = ({ children }) => {
  // User state
  const [user, setUser] = useState(null);
  
  // Game mode state
  const [gameMode, setGameMode] = useState(null);
  
  // Game settings state based on mode
  const [gameSettings, setGameSettings] = useState(null);

  // Game scores
  const [scores, setScores] = useState([]);
  
  // Context value
  const value = {
    // User information
    user,
    setUser,
    
    // Game mode
    gameMode,
    setGameMode,
    
    // Game settings
    gameSettings, 
    setGameSettings,
    
    // Scores
    scores,
    setScores
  };
  
  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};

// Custom hook for using the game context
export const useGameContext = () => {
  const context = useContext(GameContext);
  
  if (context === undefined) {
    throw new Error('useGameContext must be used within a GameProvider');
  }
  
  return context;
};

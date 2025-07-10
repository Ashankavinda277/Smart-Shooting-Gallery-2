import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate, useParams } from 'react-router-dom';
import Target from '../components/common/Target';
import Button from '../components/common/Button';
import { registerUser } from '../services/api';
import { useGameContext } from '../contexts/GameContext';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { mode } = useParams();
  const { setUser, setGameMode } = useGameContext();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const response = await registerUser(name, parseInt(age), mode);
      if (response.ok) {
        // Save user data and game mode to context
        setUser(response.user);
        setGameMode(mode);
        navigate('/final-page');
      } else {
        setError(response.error || 'Registration failed');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError('Server connection error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <RegisterWrapper>
      <Overlay>
        <h2>REGISTRATION</h2>
        <h3>Selected Mode: {mode}</h3>
        {error && <ErrorMessage>{error}</ErrorMessage>}
        <form onSubmit={handleSubmit}>
          <label>
            Username:
            <input 
              type="text" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              required 
              disabled={isLoading}
            />
          </label>
          <label>
            Age:
            <input 
              type="number" 
              value={age} 
              onChange={(e) => setAge(e.target.value)} 
              required 
              min="1"
              disabled={isLoading}
            />
          </label>          <Button
            $variant="primary"
            $fullWidth
            type="submit" 
            disabled={isLoading} 
          >
            {isLoading ? 'Submitting...' : 'Submit'}
          </Button>
          <Button 
            variant="secondary"
            type="button" 
            onClick={() => navigate('/game-modes')} 
            disabled={isLoading}
            fullWidth
          >
            Back
          </Button>
        </form>
      </Overlay>
      <TargetWrapper>
        <Target showAnimations={false} />
      </TargetWrapper>
    </RegisterWrapper>
  );
};

const RegisterWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: #3d5e53;
`;

const Overlay = styled.div`
  background: rgba(0, 0, 0, 0.7);
  padding: 3rem;
  text-align: center;
  color: white;
  border-radius: 10px;
  margin-right: 20px;
  width: 400px;

  h2 {
    font-size: 2rem;
    margin-bottom: 1rem;
  }
  
  h3 {
    font-size: 1.2rem;
    margin-bottom: 1.5rem;
    text-transform: capitalize;
  }

  form {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  label {
    font-size: 1.5rem;
    font-weight: bold;
    display: flex;
    justify-content: space-between;
  }

  input {
    padding: 0.5rem;
    font-size: 1.2rem;
    width: 100%;
  }

  button {
    padding: 0.5rem 1rem;
    font-size: 1.2rem;
    background: #27ae60;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    margin-top: 10px;

    &:hover {
      background: #219a52;
    }
    
    &:disabled {
      background: #aaaaaa;
      cursor: not-allowed;
    }
  }
`;

const TargetWrapper = styled.div`
  margin-left: 20px;
`;

const ErrorMessage = styled.div`
  color: #ff6b6b;
  background: rgba(255, 0, 0, 0.1);
  padding: 10px;
  border-radius: 5px;
  margin-bottom: 15px;
  font-weight: bold;
`;

export default RegisterPage;
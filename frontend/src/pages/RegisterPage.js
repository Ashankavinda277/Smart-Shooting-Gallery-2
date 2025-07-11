/** @format */

import React, { useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import Target from "../components/common/Target";
import Button from "../components/common/Button";
import SignInForm from "./SignInForm";
import SignUpForm from "./SignUpForm";
import { registerUser, loginUser } from "../services/api";
import { useGameContext } from "../contexts/GameContext";

const RegisterPage = () => {
  const [isSignUp, setIsSignUp] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { setUser } = useGameContext();

  const handleSignUp = async ({ username, age, password }) => {
    setIsLoading(true);
    setError("");
    try {
      const response = await registerUser(
        username,
        parseInt(age),
        "easy",
        password
      );
      if (response.ok) {
        setUser(response.user);
        navigate("/game-modes");
      } else {
        if (response.error && response.error.includes("already exists")) {
          setError(`${response.error} Would you like to sign in instead?`);
          setTimeout(() => {
            setIsSignUp(false);
            setError("");
          }, 3000);
        } else {
          setError(response.error || "Registration failed");
        }
      }
    } catch (err) {
      console.error("Sign Up error:", err);
      setError("Server connection error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async ({ username, password }) => {
    setIsLoading(true);
    setError("");
    try {
      const response = await loginUser(username, password);
      if (response.ok) {
        setUser(response.user);
        navigate("/game-modes");
      } else {
        setError(response.error || "Login failed");
      }
    } catch (err) {
      console.error("Sign In error:", err);
      setError("Server connection error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <RegisterWrapper>
      <Overlay>
        <h2>{isSignUp ? "Sign Up" : "Sign In"}</h2>
        <h3>Welcome to Smart Shooting Gallery!</h3>

        <ToggleButtonWrapper>
          <ToggleButton
            active={isSignUp}
            onClick={() => {
              setIsSignUp(true);
              setError("");
            }}
            disabled={isLoading}
          >
            Sign Up
          </ToggleButton>
          <ToggleButton
            active={!isSignUp}
            onClick={() => {
              setIsSignUp(false);
              setError("");
            }}
            disabled={isLoading}
          >
            Sign In
          </ToggleButton>
        </ToggleButtonWrapper>

        {isSignUp ? (
          <SignUpForm
            onSubmit={handleSignUp}
            isLoading={isLoading}
            error={error}
          />
        ) : (
          <>
            {error && <ErrorMessage>{error}</ErrorMessage>}
            <SignInForm onSubmit={handleSignIn} isLoading={isLoading} />
          </>
        )}

        <Button
          variant="outline"
          type="button"
          onClick={() => navigate("/")}
          disabled={isLoading}
          fullWidth
        >
          Back to Home
        </Button>
      </Overlay>

      <TargetWrapper>
        <Target showAnimations={false} />
      </TargetWrapper>
    </RegisterWrapper>
  );
};

// Styled components
const RegisterWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: linear-gradient(135deg, #0d0d0d, #1a1a2e);
`;

const Overlay = styled.div`
  background: rgba(10, 10, 20, 0.85);
  backdrop-filter: blur(12px);
  padding: 3rem;
  text-align: center;
  color: #cce7ff;
  border-radius: 16px;
  margin-right: 20px;
  width: 420px;
  border: 2px solid #00ffe7;

  h2 {
    font-size: 2.2rem;
    margin-bottom: 1rem;
    color: #00ffe7;
  }

  h3 {
    font-size: 1.1rem;
    margin-bottom: 1.5rem;
    text-transform: capitalize;
    color: #cce7ff;
  }

  form {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }
`;

const TargetWrapper = styled.div`
  margin-left: 5px;
`;

const ErrorMessage = styled.div`
  color: #ff6b6b;
  background: rgba(255, 0, 0, 0.1);
  padding: 10px;
  border-radius: 5px;
  margin-bottom: 15px;
  font-weight: bold;
`;

const ToggleButtonWrapper = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const ToggleButton = styled.button`
  padding: 0.5rem 1.2rem;
  font-size: 1rem;
  border: 2px solid #00ffe7;
  border-radius: 30px;
  background: ${({ active }) => (active ? "#00ffe7" : "transparent")};
  color: ${({ active }) => (active ? "#0d0d0d" : "#00ffe7")};
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: ${({ active }) =>
    active ? "0 0 10px #00ffe7, 0 0 20px #00ffe7" : "none"};

  &:hover {
    background: #00ffe740;
    box-shadow: 0 0 10px #00ffe7, 0 0 20px #00ffe7;
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }
`;

export default RegisterPage;

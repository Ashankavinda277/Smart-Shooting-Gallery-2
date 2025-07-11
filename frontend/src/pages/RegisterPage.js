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
      // Always use user from response.data
      const userObj = response.data && response.data.user;
      if (response.ok && userObj && userObj.id) {
        setError(""); // Clear any lingering errors
        setUser(userObj);
        console.log("Navigating to /game-modes after sign up");
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
      // Always use user from response.data
      const userObj = response.data && response.data.user;
      if (response.ok && userObj && userObj.id) {
        setError(""); // Clear any lingering errors
        setUser(userObj);
        console.log("Navigating to /game-modes after sign in");
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
            $active={isSignUp}
            onClick={() => {
              setIsSignUp(true);
              setError("");
            }}
            disabled={isLoading}
          >
            Sign Up
          </ToggleButton>
          <ToggleButton
            $active={!isSignUp}
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
  background: linear-gradient(135deg, #4a148c, #880e4f);
`;

const Overlay = styled.div`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(12px);
  padding: 3rem;
  text-align: center;
  color: white;
  border-radius: 16px;
  margin-right: 20px;
  width: 420px;

  h2 {
    font-size: 2.2rem;
    margin-bottom: 1rem;
  }

  h3 {
    font-size: 1.1rem;
    margin-bottom: 1.5rem;
    text-transform: capitalize;
  }

  form {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
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

const ToggleButtonWrapper = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const ToggleButton = styled.button`
  padding: 0.5rem 1.2rem;
  font-size: 1rem;
  border: 2px solid white;
  border-radius: 30px;
  background: ${({ $active }) => ($active ? "white" : "transparent")};
  color: ${({ $active }) => ($active ? "#4a148c" : "white")};
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: ${({ $active }) => ($active ? "white" : "rgba(255,255,255,0.2)")};
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }
`;

export default RegisterPage;

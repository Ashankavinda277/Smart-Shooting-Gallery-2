import React from 'react';
import styled from 'styled-components';

const Loader = () => {
  return (
    <StyledWrapper>
      <div className="honeycomb">
        <div />
        <div />
        <div />
        <div />
        <div />
        <div />
        <div />
      </div>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  @-webkit-keyframes honeycomb {
    0%,
    20%,
    80%,
    100% {
      opacity: 0;
      -webkit-transform: scale(0);
      transform: scale(0);
    }

    30%,
    70% {
      opacity: 1;
      -webkit-transform: scale(1);
      transform: scale(1);
    }
  }

  @keyframes honeycomb {
    0%,
    20%,
    80%,
    100% {
      opacity: 0;
      -webkit-transform: scale(0);
      transform: scale(0);
    }

    30%,
    70% {
      opacity: 1;
      -webkit-transform: scale(1);
      transform: scale(1);
    }
  }

  .honeycomb {
    height: 24px; /* Reduce the height by half */
    position: relative;
    width: 24px; /* Reduce the width by half */
  }

  .honeycomb div {
    -webkit-animation: honeycomb 2.1s infinite backwards;
    animation: honeycomb 2.1s infinite backwards;
    background: #f5f5dc; /* Change color to light cream */
    height: 12px; /* Reduce the height by half */
    margin-top: 6px; /* Adjust margin */
    position: absolute;
    width: 24px; /* Reduce the width by half */
  }

  .honeycomb div:after, .honeycomb div:before {
    content: '';
    border-left: 12px solid transparent; /* Adjust border */
    border-right: 12px solid transparent; /* Adjust border */
    position: absolute;
    left: 0;
    right: 0;
  }

  .honeycomb div:after {
    top: -6px; /* Adjust position */
    border-bottom: 6px solid #f5f5dc; /* Adjust border */
  }

  .honeycomb div:before {
    bottom: -6px; /* Adjust position */
    border-top: 6px solid #f5f5dc; /* Adjust border */
  }

  .honeycomb div:nth-child(1) {
    -webkit-animation-delay: 0s;
    animation-delay: 0s;
    left: -28px; /* Adjust position */
    top: 0;
  }

  .honeycomb div:nth-child(2) {
    -webkit-animation-delay: 0.1s;
    animation-delay: 0.1s;
    left: -14px; /* Adjust position */
    top: 22px; /* Adjust position */
  }

  .honeycomb div:nth-child(3) {
    -webkit-animation-delay: 0.2s;
    animation-delay: 0.2s;
    left: 14px; /* Adjust position */
    top: 22px; /* Adjust position */
  }

  .honeycomb div:nth-child(4) {
    -webkit-animation-delay: 0.3s;
    animation-delay: 0.3s;
    left: 28px; /* Adjust position */
    top: 0;
  }

  .honeycomb div:nth-child(5) {
    -webkit-animation-delay: 0.4s;
    animation-delay: 0.4s;
    left: 14px; /* Adjust position */
    top: -22px; /* Adjust position */
  }

  .honeycomb div:nth-child(6) {
    -webkit-animation-delay: 0.5s;
    animation-delay: 0.5s;
    left: -14px; /* Adjust position */
    top: -22px; /* Adjust position */
  }

  .honeycomb div:nth-child(7) {
    -webkit-animation-delay: 0.6s;
    animation-delay: 0.6s;
    left: 0;
    top: 0;
  }
`;

export default Loader;
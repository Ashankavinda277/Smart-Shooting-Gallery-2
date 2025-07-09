import React from 'react';
import '../styles/Target.css';

const Target = ({ showAnimations = true }) => {
  return (
    <div className="target-wrapper">
      <div className="target">
        <div className="target-circle ring-7"></div>
        <div className="target-circle ring-6"></div>
        <div className="target-circle ring-5"></div>
        <div className="target-circle ring-4"></div>
        <div className="target-circle ring-3"></div>
        <div className="target-circle ring-2"></div>
        <div className="target-circle ring-1"></div>
      </div>
      {showAnimations && (
        <>
          <div className="bullet-hit"></div>
          <div className="laser-hit"></div>
        </>
      )}
    </div>
  );
};

export default Target;
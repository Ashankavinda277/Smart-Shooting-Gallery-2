// Polyfill for process.env in browser (for CRA/webpack if needed)
if (typeof process === 'undefined') {
  window.process = { env: {} };
}

import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './styles/index.css';
import './styles/Header.css';
import './styles/Target.css';

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);
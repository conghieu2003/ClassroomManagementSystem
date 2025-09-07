import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import '@fortawesome/fontawesome-free/css/all.min.css';
import 'devextreme/dist/css/dx.light.css';

// CSS global đơn giản
const globalStyles = `
  * {
    box-sizing: border-box;
  }
  
  html, body {
    margin: 0;
    padding: 0;
    width: 100vw;
    height: 100vh;
    overflow: hidden;
    min-width: 1200px;
  }
  
  #root {
    width: 100vw;
    height: 100vh;
    min-width: 1200px;
    overflow: hidden;
    position: fixed;
    top: 0;
    left: 0;
  }
  
  html, body {
    overflow-x: hidden;
  }
  
`;

// Thêm CSS vào head
const styleSheet = document.createElement('style');
styleSheet.textContent = globalStyles;
document.head.appendChild(styleSheet);


const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');

const root = ReactDOM.createRoot(rootElement);
// @ts-ignore
root.render(<App />);

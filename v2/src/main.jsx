import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './app.jsx';
import { TerminalProvider } from '../../src/context/TerminalContext.jsx';
import { LanguageProvider } from '../../src/context/LanguageContext.jsx';
import './styles.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <LanguageProvider>
        <TerminalProvider>
          <App />
        </TerminalProvider>
      </LanguageProvider>
    </BrowserRouter>
  </React.StrictMode>
);

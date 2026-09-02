import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { TerminalProvider } from './context/TerminalContext.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <TerminalProvider>
        <App />
      </TerminalProvider>
    </BrowserRouter>
  </React.StrictMode>,
)

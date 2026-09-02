import React, { createContext, useState, useContext, useEffect } from 'react';

const TerminalContext = createContext();

export const TerminalProvider = ({ children }) => {
  const [isTerminalPopupOpen, setIsTerminalPopupOpen] = useState(false);
  
  const getCurrentTime = () => {
    return new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  };

  const initialMsg = { 
    role: 'system', 
    content: 'Selamat datang. Silakan ketik perintah atau pertanyaan Anda terkait portofolio.',
    time: getCurrentTime()
  };

  const [messages, setMessages] = useState(() => {
    try {
      const active = localStorage.getItem('terminal_active_convo');
      if (active) {
        const parsed = JSON.parse(active);
        if (parsed && parsed.length > 1) {
           const savedHist = localStorage.getItem('terminal_history_list');
           let hist = savedHist ? JSON.parse(savedHist) : [];
           hist = [{ id: Date.now(), messages: parsed, timestamp: new Date().toLocaleTimeString('id-ID') }, ...hist].slice(0, 50);
           localStorage.setItem('terminal_history_list', JSON.stringify(hist));
        }
        localStorage.removeItem('terminal_active_convo');
      }
    } catch {}
    return [initialMsg];
  });

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [historyList, setHistoryList] = useState(() => {
    try {
      const saved = localStorage.getItem('terminal_history_list');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });
  
  const [effort, setEffort] = useState('auto');

  // Sync to local storage
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('terminal_active_convo', JSON.stringify(messages));
    }
  }, [messages]);

  useEffect(() => {
    localStorage.setItem('terminal_history_list', JSON.stringify(historyList));
  }, [historyList]);

  return (
    <TerminalContext.Provider value={{ 
      isTerminalPopupOpen, setIsTerminalPopupOpen,
      messages, setMessages,
      input, setInput,
      isLoading, setIsLoading,
      historyList, setHistoryList,
      effort, setEffort,
      getCurrentTime, initialMsg
    }}>
      {children}
    </TerminalContext.Provider>
  );
};

export const useTerminal = () => useContext(TerminalContext);

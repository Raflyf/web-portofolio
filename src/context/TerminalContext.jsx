import React, { createContext, useState, useContext, useEffect } from 'react';

const TerminalContext = createContext();

export const TerminalProvider = ({ children }) => {
  const [isTerminalPopupOpen, setIsTerminalPopupOpen] = useState(false);
  
  const getCurrentTime = () => {
    return new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  };

  const initialMsg = { 
    role: 'system', 
    content: '* INTERACTIVE DEVELOPER LAB / TERMINAL SIMULATOR (v5.2.0)\n* Initialization Sequence: Complete\n* Engine: OpenCode AI Gateway\n* Status: Online\n\nSelamat datang. Silakan ketik perintah atau pertanyaan Anda terkait portofolio.',
    time: getCurrentTime()
  };

  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem('terminal_active_convo');
      if (saved) return JSON.parse(saved);
    } catch(e) {}
    return [initialMsg];
  });

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [historyList, setHistoryList] = useState(() => {
    try {
      const saved = localStorage.getItem('terminal_history_list');
      if (saved) return JSON.parse(saved);
    } catch(e) {}
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

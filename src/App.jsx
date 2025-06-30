import { useEffect, useRef, useState } from 'react';
import './App.css';

function App() {
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);
  const typingRef = useRef(null);

  // Add welcome message on first load
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{ role: 'assistant', content: 'Hi! Ask me anything...', timestamp: new Date() }]);
    }
  }, []);

  // Add welcome message on first load
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{ role: 'assistant', content: 'Hi! Ask me anything...', timestamp: new Date() }]);
    }
  }, []);

  const handleSubmit = async () => {
    if (!prompt.trim()) return;
    setLoading(true);

    const newMessages = [...messages, { role: 'user', content: prompt, timestamp: new Date() }];
    setMessages(newMessages);
    setPrompt('');

    const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
if (!apiKey || !apiKey.trim()) {
  throw new Error('Missing API Key. Please set VITE_OPENROUTER_API_KEY in .env file.');
}

    console.log('API Key exists:', apiKey ? 'Yes' : 'No');
    console.log('API Key length:', apiKey ? apiKey.length : 0);

    try {
      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey.trim()}`,
          'HTTP-Referer': window.location.origin || 'http://localhost:5173',
          'X-Title': 'GPT Assistant',
        },
        body: JSON.stringify({
          model: 'openai/gpt-3.5-turbo-0613',
          messages: newMessages.map(msg => ({ role: msg.role, content: msg.content })),
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`API Error: ${res.status} - ${errorText}`);
      }

      const data = await res.json();
      const fullResponse = data.choices?.[0]?.message?.content || 'No response received.';

      let i = 0;
      let currentText = '';
      const animatedMessages = [...newMessages, { role: 'assistant', content: '', timestamp: new Date() }];
      setMessages(animatedMessages);

      const typingInterval = setInterval(() => {
        if (i < fullResponse.length) {
          currentText += fullResponse.charAt(i);
          animatedMessages[animatedMessages.length - 1].content = currentText;
          setMessages([...animatedMessages]);
          i++;
        } else {
          clearInterval(typingInterval);
          typingRef.current = null;
          setLoading(false);
        }
      }, 20);
      
      typingRef.current = typingInterval;
    } catch (err) {
      console.error('Error occurred:', err);
      setMessages([...newMessages, { role: 'assistant', content: `Error: ${err.message}`, timestamp: new Date() }]);
      setLoading(false);
    }
  };

  const stopTyping = () => {
    if (typingRef.current) {
      clearInterval(typingRef.current);
      typingRef.current = null;
      setLoading(false);
    }
  };

  const formatTime = (date) => {
    const now = new Date();
    const diff = Math.floor((now - new Date(date)) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return new Date(date).toLocaleDateString();
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <>

      <div className="min-h-screen bg-gradient-to-br from-purple-900/90 via-blue-900/90 to-indigo-900/90 flex items-center justify-center px-4 py-8 backdrop-blur-lg">
        <div className="w-full max-w-2xl p-0.5 rounded-2xl bg-gradient-to-tr from-blue-500/90 via-purple-500/90 to-pink-500/90 shadow-xl shadow-blue-500/50 ring-1 ring-blue-500/20">
          <div className="bg-black rounded-2xl p-4 md:p-6 flex flex-col h-[80vh] border border-blue-500/20">
            <h1 className="text-5xl font-bold text-white mb-8 text-center bg-clip-text bg-gradient-to-r from-blue-300 to-purple-300 animate-gradient-text">GPT Assistant</h1>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto custom-scrollbar relative">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} mt-4 transition-all duration-300`}
                >
                  <div
                    className={`min-w-24 px-6 py-4 break-words w-fit max-w-[80%] shadow-lg rounded-2xl ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-br from-purple-600/90 to-indigo-600/90 text-white rounded-br-none hover:scale-102 transition-all duration-300 hover:shadow-2xl'
                        : 'bg-gradient-to-br from-gray-700/90 to-gray-800/90 text-white rounded-bl-none hover:scale-102 transition-all duration-300 hover:shadow-2xl'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-line">{msg.content}</p>
                    <p className="text-xs text-gray-300 mt-1">{formatTime(msg.timestamp)}</p>
                    {loading && msg.role === 'assistant' && index === messages.length - 1 && (
                      <span className="text-white text-xs animate-pulse">Typing...</span>
                    )}
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} className="h-8" />
              {loading && (
                <div className="flex justify-center mt-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="mt-4">
              <div className="relative w-full">
                <div className="relative">
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    <div className="input-icon">
                      <div className="input-icon::before"></div>
                    </div>
                  </div>
                  <textarea
                    className="w-full h-24 pl-10 pr-12 border border-gray-600 rounded-xl pt-5 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none text-base text-white placeholder-[#60a5fa] bg-gray-800 custom-scrollbar transition-all duration-300 hover:border-blue-400 focus:border-blue-400 focus:ring-2"
                    placeholder="Type your question or prompt..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmit();
                      }
                    }}
                  />
                </div>
                {loading ? (
                  <button
                    onClick={stopTyping}
                    className="absolute bottom-3 right-3 p-2.5 bg-red-600 text-white rounded-full hover:scale-105 transition-all duration-300 hover:bg-red-500 hover:shadow-lg"
                    title="Stop Generating"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <rect x="6" y="6" width="12" height="12" />
                    </svg>
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    className="absolute bottom-3 right-3 p-2.5 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-full hover:scale-105 transition-all duration-300 hover:from-blue-400 hover:to-purple-500 hover:shadow-lg disabled:opacity-50"
                    title="Send"
                    disabled={!prompt.trim() || loading}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 transform rotate-270"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14m0 0l-6-6m6 6l-6 6" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
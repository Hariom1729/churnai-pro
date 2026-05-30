import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, User, Loader2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function Assistant() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Hello! I'm your ChurnAI Data Assistant. I can help you analyze your datasets, interpret models, or suggest business strategies. What would you like to know?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput('');
    
    // Add user message to UI immediately
    const newMessages = [...messages, { role: 'user' as const, content: userMsg }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      // Send to backend
      const response = await axios.post('http://localhost:8000/api/assistant/chat', {
        message: userMsg,
        history: messages.filter(m => m.role !== 'assistant' || messages.indexOf(m) > 0) // exclude initial greeting if you want, or just send all
      }, { headers });

      
      setMessages([...newMessages, { role: 'assistant', content: response.data.response }]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages([...newMessages, { role: 'assistant', content: "I encountered an error connecting to the AI. Please make sure your Gemini API Key is configured correctly." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-140px)] flex flex-col pt-24 pb-8 px-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--color-brand-green)] to-[var(--color-brand-blue)] flex items-center justify-center p-[1px]">
          <div className="w-full h-full bg-[#0B0F19] rounded-xl flex items-center justify-center">
            <Sparkles className="text-[var(--color-brand-green)]" size={24} />
          </div>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">AI Assistant</h1>
          <p className="text-gray-400">Powered by Gemini Pro</p>
        </div>
      </div>

      <div className="flex-1 glass-card rounded-2xl flex flex-col overflow-hidden border border-white/5 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-brand-green)]/5 to-transparent pointer-events-none"></div>
        
        {/* Chat History */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 relative z-10">
          <AnimatePresence>
            {messages.map((msg, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                  msg.role === 'user' 
                    ? 'bg-[var(--color-brand-green)]/20 text-[var(--color-brand-green)] border border-[var(--color-brand-green)]/30' 
                    : 'bg-[#1A1F2B] text-blue-400 border border-blue-500/30'
                }`}>
                  {msg.role === 'user' ? <User size={20} /> : <Bot size={20} />}
                </div>
                <div className={`max-w-[80%] rounded-2xl p-4 ${
                  msg.role === 'user'
                    ? 'bg-[var(--color-brand-green)]/10 text-white border border-[var(--color-brand-green)]/20'
                    : 'bg-[#1A1F2B]/80 text-gray-200 border border-white/5'
                }`}>
                  {msg.role === 'assistant' ? (
                    <div className="prose prose-invert max-w-none">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {isLoading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-[#1A1F2B] text-blue-400 border border-blue-500/30 flex items-center justify-center shrink-0">
                <Bot size={20} />
              </div>
              <div className="bg-[#1A1F2B]/80 border border-white/5 rounded-2xl p-4 flex items-center gap-3 text-gray-400">
                <Loader2 size={18} className="animate-spin text-[var(--color-brand-green)]" />
                Thinking...
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <div className="p-4 bg-[#111622]/90 border-t border-white/5 relative z-10">
          <form onSubmit={handleSubmit} className="flex gap-3">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about your data..."
              className="flex-1 bg-[#1A1F2B] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[var(--color-brand-green)]/50 transition-colors"
            />
            <button 
              type="submit" 
              disabled={isLoading || !input.trim()}
              className="bg-[var(--color-brand-green)] text-black px-6 rounded-xl font-medium hover:bg-[var(--color-brand-green)]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Send size={18} />
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

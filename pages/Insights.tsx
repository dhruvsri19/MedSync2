
import React, { useEffect, useState, useRef } from 'react';
import { Brain, AlertCircle, CheckCircle, Info, Share2, Loader2, Send, Bot, User } from 'lucide-react';
import { Insight, HealthMetric, LabReport, ChatMessage } from '../types';
import { generateHealthInsights, chatWithMedCoach } from '../services/geminiService';

interface InsightsProps {
  metrics: HealthMetric[];
  reports: LabReport[];
}

export const Insights: React.FC<InsightsProps> = ({ metrics, reports }) => {
  // Insights State
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loadingInsights, setLoadingInsights] = useState(false);

  // Chat State
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Hello! I am MedCoach. I have analyzed your latest health metrics and lab reports. How can I help you understand your health data today?',
      timestamp: new Date().toISOString()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [sendingChat, setSendingChat] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchInsights = async () => {
      setLoadingInsights(true);
      try {
        if (insights.length === 0) {
          const generated = await generateHealthInsights(metrics);
          setInsights(generated.map((g, i) => ({
            id: `gen-${i}`,
            title: g.title,
            description: g.description,
            severity: g.severity as any,
            date: new Date().toISOString()
          })));
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingInsights(false);
      }
    };

    fetchInsights();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || sendingChat) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setSendingChat(true);

    try {
      const response = await chatWithMedCoach(inputMessage, { metrics, reports });
      
      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      console.error("Chat error", error);
    } finally {
      setSendingChat(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'alert': return 'text-rose-400 bg-rose-900/20 border-rose-900';
      case 'warning': return 'text-amber-400 bg-amber-900/20 border-amber-900';
      default: return 'text-blue-400 bg-blue-900/20 border-blue-900';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'alert': return AlertCircle;
      case 'warning': return Info;
      default: return CheckCircle;
    }
  };

  return (
    <div className="space-y-8 h-[calc(100vh-6rem)] flex flex-col">
       <div className="flex justify-between items-start flex-shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">AI Health Insights</h1>
          <p className="text-slate-400">Personalized analysis & MedCoach Assistant.</p>
        </div>
        <button className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg border border-slate-700 transition-colors">
          <Share2 className="w-4 h-4" />
          <span>Share Summary</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1 min-h-0">
        {/* Left Column: Static Insights */}
        <div className="overflow-y-auto pr-2 space-y-6 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
          <h3 className="text-xl font-semibold text-white flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-400" />
            Key Observations
          </h3>
          
          {loadingInsights ? (
             <div className="flex flex-col items-center justify-center py-20">
               <Loader2 className="w-10 h-10 text-primary-500 animate-spin mb-4" />
               <p className="text-slate-400">Gemini is analyzing your recent trends...</p>
             </div>
          ) : (
            <div className="grid gap-4">
              {insights.map((insight) => {
                const Icon = getSeverityIcon(insight.severity);
                const colorClass = getSeverityColor(insight.severity);
                
                return (
                  <div key={insight.id} className="bg-slate-800 border border-slate-700 rounded-2xl p-5 flex gap-4 transition-all hover:border-slate-600">
                    <div className={`p-3 rounded-xl h-fit border ${colorClass}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-1">{insight.title}</h3>
                      <p className="text-slate-300 leading-relaxed text-sm">{insight.description}</p>
                      <p className="text-xs text-slate-500 mt-2">Generated {new Date(insight.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                );
              })}
              
              <div className="bg-slate-800/50 border border-slate-800 rounded-2xl p-6 mt-4">
                <p className="text-sm text-slate-500">
                  MedSync uses Google's Gemini AI to process your structured health data alongside lab reports. 
                  Always consult a doctor for medical advice.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: MedCoach Chat */}
        <div className="flex flex-col bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-4 border-b border-slate-700 bg-slate-800/80 backdrop-blur flex items-center gap-3">
            <div className="bg-emerald-600 p-2 rounded-lg">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-white">MedCoach Assistant</h3>
              <p className="text-xs text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Online
              </p>
            </div>
          </div>

          <div 
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-900/50"
          >
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  msg.role === 'user' ? 'bg-primary-600' : 'bg-emerald-600'
                }`}>
                  {msg.role === 'user' ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}
                </div>
                <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === 'user' 
                    ? 'bg-primary-600 text-white rounded-tr-none' 
                    : 'bg-slate-700 text-slate-200 rounded-tl-none'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {sendingChat && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-slate-700 rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-1">
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-700 bg-slate-800">
            <div className="relative">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask about your health data..."
                className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-4 pr-12 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all"
              />
              <button 
                type="submit"
                disabled={!inputMessage.trim() || sendingChat}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg disabled:opacity-50 disabled:hover:bg-primary-600 transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};


import React, { useEffect, useState, useRef } from 'react';
import { Brain, AlertCircle, CheckCircle, Info, Share2, Loader2, Send, Bot, User, MessageCircle, X, ArrowRight } from 'lucide-react';
import { Insight, HealthMetric, LabReport, ChatMessage, AppRoute } from '../types';
import { generateHealthInsights, chatWithMedCoach } from '../services/geminiService';
interface InsightsProps {
  metrics: HealthMetric[];
  reports: LabReport[];
  initialAction?: string | null;
  onNavigate: (route: AppRoute) => void;
}
export const Insights: React.FC<InsightsProps> = ({ metrics, reports, initialAction, onNavigate }) => {
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
  
  // Responsive Chat State
  const [isMobileChatOpen, setIsMobileChatOpen] = useState(false);

  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Handle Initial Action (e.g., from Dashboard)
  useEffect(() => {
    if (initialAction === 'summarize') {
      setIsMobileChatOpen(true); // Open chat on mobile
      const triggerSummary = async () => {
        setSendingChat(true);
        // Add a visible user message to show intent
        const userMsg: ChatMessage = {
          id: Date.now().toString(),
          role: 'user',
          content: "Please provide a detailed summary of my health report.",
          timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, userMsg]);

        try {
          const response = await chatWithMedCoach("Analyze my recent data and lab reports and give me a detailed summary.", { metrics, reports });
          
          const aiMsg: ChatMessage = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: response,
            timestamp: new Date().toISOString(),
            actionLabel: "View Full Lab Reports",
            actionRoute: AppRoute.UPLOAD
          };
          
          setMessages(prev => [...prev, aiMsg]);
        } catch (error) {
          console.error("Chat error", error);
        } finally {
          setSendingChat(false);
        }
      };
      
      // Small delay to make it feel natural after navigation
      setTimeout(triggerSummary, 500);
    }
  }, [initialAction, metrics, reports]);

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
  }, [messages, isMobileChatOpen]);

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
      case 'alert': return 'text-rose-500 dark:text-rose-400 bg-rose-100 dark:bg-rose-900/20 border-rose-200 dark:border-rose-900';
      case 'warning': return 'text-amber-500 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/20 border-amber-200 dark:border-amber-900';
      default: return 'text-blue-500 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/20 border-blue-200 dark:border-blue-900';
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
    <div className="space-y-8 h-[calc(100vh-6rem)] flex flex-col relative animate-in fade-in duration-500">
       <div className="flex justify-between items-start flex-shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">AI Health Insights</h1>
          <p className="text-slate-500 dark:text-slate-400">Personalized analysis & MedCoach Assistant.</p>
        </div>
        <button className="flex items-center gap-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-white px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors shadow-sm">
          <Share2 className="w-4 h-4" />
          <span className="hidden sm:inline">Share Summary</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1 min-h-0 relative">
        {/* Left Column: Static Insights */}
        <div className="overflow-y-auto pr-2 space-y-6 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700 scrollbar-track-transparent pb-24 lg:pb-0">
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-500" />
            Key Observations
          </h3>
          
          {loadingInsights ? (
             <div className="flex flex-col items-center justify-center py-20">
               <Loader2 className="w-10 h-10 text-primary-500 animate-spin mb-4" />
               <p className="text-slate-500 dark:text-slate-400">Gemini is analyzing your recent trends...</p>
             </div>
          ) : (
            <div className="grid gap-4">
              {insights.map((insight) => {
                const Icon = getSeverityIcon(insight.severity);
                const colorClass = getSeverityColor(insight.severity);
                
                return (
                  <div key={insight.id} className="bg-white/70 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 flex gap-4 transition-all hover:border-slate-300 dark:hover:border-slate-600 shadow-sm">
                    <div className={`p-3 rounded-xl h-fit border ${colorClass}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">{insight.title}</h3>
                      <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm">{insight.description}</p>
                      <p className="text-xs text-slate-500 mt-2">Generated {new Date(insight.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                );
              })}
              
              <div className="bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 mt-4">
                <p className="text-sm text-slate-500">
                  MedSync uses Google's Gemini AI to process your structured health data alongside lab reports. 
                  Always consult a doctor for medical advice.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: MedCoach Chat */}
        <div className={`
          flex flex-col bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden shadow-xl
          lg:col-span-1 lg:static lg:h-full lg:w-auto lg:translate-y-0 lg:opacity-100 lg:rounded-2xl lg:pointer-events-auto lg:shadow-xl lg:flex
          fixed bottom-4 right-4 z-50 
          w-[calc(100vw-2rem)] sm:w-[400px]
          transition-all duration-300 cubic-bezier(0.16, 1, 0.3, 1)
          ${isMobileChatOpen 
            ? 'translate-y-0 opacity-100 h-[600px] max-h-[calc(100vh-6rem)] rounded-2xl pointer-events-auto shadow-2xl border-slate-200 dark:border-slate-600' 
            : 'translate-y-12 opacity-0 h-0 pointer-events-none lg:h-full'}
        `}>
          <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-800/80 backdrop-blur flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-600 p-2 rounded-lg">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white">MedCoach Assistant</h3>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Online
                </p>
              </div>
            </div>

            <button 
              onClick={() => setIsMobileChatOpen(false)}
              className="lg:hidden p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              aria-label="Minimize Chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div 
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-900/50"
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
                <div className={`flex flex-col gap-2 max-w-[85%]`}>
                  <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                    msg.role === 'user' 
                      ? 'bg-primary-600 text-white rounded-tr-none' 
                      : 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-200 dark:border-slate-600'
                  }`}>
                    {msg.content}
                  </div>
                  
                  {/* Action Button if available */}
                  {msg.actionRoute && (
                    <button 
                      onClick={() => onNavigate(msg.actionRoute!)}
                      className="self-start bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-3 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/30 w-full justify-center"
                    >
                      {msg.actionLabel || "View Details"}
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
            {sendingChat && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-1 shadow-sm">
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
            <div className="relative">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask about your health data..."
                className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl pl-4 pr-12 py-3 text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all"
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

      {/* Mobile Floating Action Button (FAB) */}
      <button
        onClick={() => setIsMobileChatOpen(true)}
        className={`
          fixed bottom-6 right-6 z-40 lg:hidden
          bg-emerald-600 hover:bg-emerald-500 text-white p-4 rounded-full shadow-lg shadow-emerald-600/50 
          transition-all duration-300 transform
          flex items-center justify-center group
          ${isMobileChatOpen ? 'scale-0 opacity-0 translate-y-10' : 'scale-100 opacity-100 translate-y-0'}
        `}
        aria-label="Open MedCoach"
      >
        <MessageCircle className="w-6 h-6" />
        <span className="absolute right-full mr-3 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-slate-200 dark:border-slate-700 pointer-events-none font-medium shadow-md">
          Ask AI Assistant
        </span>
      </button>
    </div>
  );
};

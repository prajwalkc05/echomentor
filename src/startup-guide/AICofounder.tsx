import { useState, useEffect } from 'react';
import { Sparkles, Send, Lightbulb, Code, Rocket, TrendingUp, FileText, Loader2 } from 'lucide-react';
import { startupGuideService } from '../services/api.service';
import { generateMockCofounders } from './mockData';

interface Message {
  role: 'ai' | 'user';
  content: string;
  suggestions?: string[];
}

export default function AICofounder() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'ai',
      content: "Hey! I'm your AI Cofounder. I've analyzed your startup idea and I'm here to help you every step of the way. What would you like to work on today?",
      suggestions: ['Generate landing page copy', 'Suggest product features', 'Create business plan', 'Launch strategy']
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [progress, setProgress] = useState({ mvp: 0, validation: 0, funding: 0 });

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    try {
      const response = await startupGuideService.getProgress();
      const data = response.data || response;
      if (data) {
        setProgress({
          mvp: data.mvpCompletion || 0,
          validation: data.validationScore || 0,
          funding: data.fundingReadiness || 0
        });
      }
    } catch (error) {
      console.error('Failed to load progress:', error);
      // Set zero progress when database is empty
      setProgress({
        mvp: 0,
        validation: 0,
        funding: 0
      });
    }
  };

  const quickActions = [
    { icon: FileText, label: 'Landing Page Copy', color: 'from-blue-500 to-cyan-500', prompt: 'Generate landing page copy for my startup' },
    { icon: Lightbulb, label: 'Feature Ideas', color: 'from-purple-500 to-pink-500', prompt: 'Suggest innovative features for my product' },
    { icon: Code, label: 'Tech Recommendations', color: 'from-green-500 to-emerald-500', prompt: 'Recommend the best tech stack for my startup' },
    { icon: Rocket, label: 'Launch Checklist', color: 'from-orange-500 to-red-500', prompt: 'Create a comprehensive launch checklist' },
    { icon: TrendingUp, label: 'Growth Strategy', color: 'from-yellow-500 to-orange-500', prompt: 'Develop a growth strategy for my startup' }
  ];

  const handleSend = async (messageText?: string) => {
    const textToSend = messageText || input;
    if (!textToSend.trim()) return;

    setMessages(prev => [...prev, { role: 'user', content: textToSend }]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await startupGuideService.chatWithCofounder(textToSend, { messages });
      const data = response.data || response;
      if (data) {
        setMessages(prev => [...prev, {
          role: 'ai',
          content: data.message,
          suggestions: data.suggestions
        }]);
      }
    } catch (error: any) {
      console.error('Failed to send message:', error);
      // Use mock data as fallback
      console.log('Using mock cofounder response');
      const mockResponse = generateMockCofounders(textToSend, { messages });
      setMessages(prev => [...prev, {
        role: 'ai',
        content: mockResponse.message,
        suggestions: mockResponse.suggestions
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleQuickAction = (prompt: string) => {
    handleSend(prompt);
  };

  return (
    <div className="min-h-screen p-8 bg-linear-to-br from-[#0f0f1e] via-[#1a1a2e] to-[#0f0f1e]">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full bg-linear-to-r from-purple-500 to-pink-500 flex items-center justify-center">
              <Sparkles className="animate-pulse" size={24} />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-linear-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                AI Cofounder
              </h1>
              <p className="text-sm text-green-400 flex items-center gap-2">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                Online & Ready
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chat Area */}
          <div className="lg:col-span-2">
            <div className="bg-[#1a1a2e]/60 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden flex flex-col" style={{ height: '70vh' }}>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] ${msg.role === 'user' ? 'bg-linear-to-r from-purple-500 to-pink-500' : 'bg-white/5'} rounded-2xl p-4`}>
                      <p className="text-sm whitespace-pre-line">{msg.content}</p>
                      {msg.suggestions && msg.suggestions.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {msg.suggestions.map((suggestion, i) => (
                            <button
                              key={i}
                              onClick={() => handleSend(suggestion)}
                              className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded-full text-xs transition-all"
                            >
                              {suggestion}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-white/5 rounded-2xl p-4">
                      <div className="flex gap-2">
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Input */}
              <div className="p-4 border-t border-white/10">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && !isTyping && handleSend()}
                    placeholder="Ask your AI cofounder anything..."
                    disabled={isTyping}
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 transition-all disabled:opacity-50"
                  />
                  <button
                    onClick={() => handleSend()}
                    disabled={isTyping || !input.trim()}
                    className="px-6 py-3 bg-linear-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isTyping ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-[#1a1a2e]/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <h3 className="font-bold mb-4">Quick Actions</h3>
              <div className="space-y-2">
                {quickActions.map((action, idx) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleQuickAction(action.prompt)}
                      disabled={isTyping}
                      className="w-full flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all text-left disabled:opacity-50"
                    >
                      <div className={`p-2 rounded-lg bg-linear-to-r ${action.color}`}>
                        <Icon size={16} />
                      </div>
                      <span className="text-sm">{action.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Startup Stats */}
            <div className="bg-[#1a1a2e]/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <h3 className="font-bold mb-4">Your Progress</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-400">MVP Completion</span>
                    <span className="font-semibold">{progress.mvp}%</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-linear-to-r from-purple-500 to-pink-500 rounded-full" style={{ width: `${progress.mvp}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-400">Validation Score</span>
                    <span className="font-semibold">{progress.validation}%</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-linear-to-r from-green-500 to-emerald-500 rounded-full" style={{ width: `${progress.validation}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-400">Funding Readiness</span>
                    <span className="font-semibold">{progress.funding}%</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-linear-to-r from-yellow-500 to-orange-500 rounded-full" style={{ width: `${progress.funding}%` }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

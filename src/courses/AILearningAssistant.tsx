import { useState } from 'react';
import { Send, Sparkles, Loader } from 'lucide-react';

interface AIAssistantProps {
  careerGoal: string;
  currentSkills: string[];
  onRecommendation: (courses: string[]) => void;
}

export default function AILearningAssistant({
  careerGoal,
  currentSkills,
  onRecommendation,
}: AIAssistantProps) {
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([
    {
      role: 'assistant',
      content: `Hi! I'm your AI Learning Assistant. I'm here to help you on your journey to become a ${careerGoal}. What would you like to learn next?`,
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    // Add user message
    const userMessage = input;
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setInput('');
    setLoading(true);

    try {
      // Call AI to get recommendations
      const response = await fetch('/api/ai/course-recommendation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify({
          query: userMessage,
          careerGoal,
          currentSkills,
        }),
      });

      if (!response.ok) throw new Error('Failed to get recommendation');

      const data = await response.json();
      const assistantMessage = data.recommendation || 'I recommend exploring these courses to advance your skills.';

      setMessages(prev => [...prev, { role: 'assistant', content: assistantMessage }]);

      if (data.courses) {
        onRecommendation(data.courses);
      }
    } catch (error) {
      console.error('Assistant error:', error);
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I had trouble getting recommendations. Please try again.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const suggestedQuestions = [
    'What should I learn next?',
    'How do I improve my JavaScript skills?',
    'What projects should I build?',
    'How long will it take to master this?',
  ];

  return (
    <div className="flex flex-col h-full bg-linear-to-br from-purple-900/20 to-indigo-900/20 border border-purple-500/30 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-purple-500/20 bg-purple-600/10">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles size={20} className="text-purple-400" />
          <h3 className="text-white font-semibold">AI Learning Assistant</h3>
        </div>
        <p className="text-gray-400 text-xs">Get personalized course recommendations</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs px-4 py-2 rounded-lg text-sm ${
                msg.role === 'user'
                  ? 'bg-purple-600 text-white rounded-br-none'
                  : 'bg-white/5 text-gray-300 rounded-bl-none border border-white/10'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white/5 text-gray-300 px-4 py-2 rounded-lg border border-white/10 flex items-center gap-2">
              <Loader size={14} className="animate-spin" />
              <span className="text-sm">Thinking...</span>
            </div>
          </div>
        )}
      </div>

      {/* Suggested Questions */}
      {messages.length === 1 && (
        <div className="px-4 py-3 border-t border-purple-500/20 bg-purple-600/5">
          <p className="text-xs text-gray-400 mb-2">Try asking:</p>
          <div className="space-y-2">
            {suggestedQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setInput(q);
                }}
                className="w-full text-left text-xs p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors border border-white/5 hover:border-purple-500/30"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-purple-500/20 bg-purple-600/5">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyPress={e => e.key === 'Enter' && handleSend()}
            placeholder="Ask me anything..."
            className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 transition-colors"
            disabled={loading}
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white p-2 rounded-lg transition-colors"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

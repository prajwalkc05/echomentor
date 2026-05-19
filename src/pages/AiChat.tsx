import { useState, useRef, useEffect } from 'react';
import React from 'react';
import { Send, Bell, Copy, ThumbsUp, ThumbsDown, Paperclip, Globe, Plus, ChevronDown, Share2, Trash2, Mic, X, FileText, Presentation, Code, Calculator, PenLine, AlertCircle, Edit3, Check } from 'lucide-react';
import { useAppData } from '../context';
import { useUser } from '../context';
import { storage } from '../utils/storage';
import { Page } from '../types';

interface AiChatProps {
  onNavigate?: (page: Page) => void;
}

interface Message {
  role: 'user' | 'ai';
  text: string;
  time: string;
  files?: { name: string; size: string; type: string }[];
  isEditing?: boolean;
  imageUrl?: string;
}

interface ChatSession {
  id: number;
  title: string;
  time: string;
  section: string;
  messages: Message[];
}

const aiTools: { icon: React.ReactElement; bg: string; title: string; desc: string; action: 'navigate' | 'prompt'; page?: Page; prompt?: string }[] = [
  { icon: <Presentation size={18} className="text-pink-400" />, bg: 'bg-pink-600/20', title: 'AI PPT Generator', desc: 'Create presentations in seconds', action: 'navigate', page: 'ppt-generator' },
  { icon: <Code size={18} className="text-blue-400" />, bg: 'bg-blue-600/20', title: 'Code Assistant', desc: 'Write, debug & optimize code', action: 'navigate', page: 'code-assistant' },
  { icon: <FileText size={18} className="text-green-400" />, bg: 'bg-green-600/20', title: 'Summarizer', desc: 'Summarize long content instantly', action: 'prompt', prompt: 'Summarize the following text for me: ' },
  { icon: <Calculator size={18} className="text-yellow-400" />, bg: 'bg-yellow-600/20', title: 'Math Solver', desc: 'Solve equations step-by-step', action: 'prompt', prompt: 'Solve this math problem step-by-step: ' },
  { icon: <PenLine size={18} className="text-purple-400" />, bg: 'bg-purple-600/20', title: 'Grammar Checker', desc: 'Improve your writing', action: 'prompt', prompt: 'Check and correct the grammar in the following text: ' },
];

const suggestedPromptsList = [
  'Explain photosynthesis in simple terms',
  'How does Bitcoin blockchain work?',
  'Tips to improve concentration while studying',
  'Create a study plan for final exams',
  'Explain recursion with an example',
];

function getNow() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function AiChat({ onNavigate }: AiChatProps) {
  const { sendChatMessage, fetchChatHistory, chatHistory, deleteChatMessage, clearAllChatHistory } = useAppData();
  const { isLoggedIn } = useUser();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [input, setInput] = useState('');
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [temp, setTemp] = useState(0.7);
  const [isTyping, setIsTyping] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [browserUrl, setBrowserUrl] = useState('');
  const [showBrowser, setShowBrowser] = useState(false);
  const [isClearingAll, setIsClearingAll] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeSession = sessions.find(s => s.id === activeId) ?? null;

  // Load chat history on mount and from localStorage
  useEffect(() => {
    const loadChatHistory = async () => {
      try {
        // Load from localStorage first for immediate display
        const savedSessions = storage.get('aiChatSessions');
        if (savedSessions) {
          try {
            const parsed = JSON.parse(savedSessions);
            setSessions(parsed);
            if (parsed.length > 0 && !activeId) {
              setActiveId(parsed[0].id);
            }
          } catch (error) {
            console.error('Failed to load saved sessions:', error);
          }
        }
        
        // Then fetch from backend
        await fetchChatHistory();
      } catch (error) {
        console.error('Failed to load chat history:', error);
      }
    };
    loadChatHistory();
  }, []);

  // Save sessions to localStorage whenever they change
  useEffect(() => {
    if (sessions.length >= 0) { // Changed from > 0 to >= 0 to handle empty array
      if (sessions.length === 0) {
        storage.remove('aiChatSessions');
      } else {
        storage.setJSON('aiChatSessions', sessions);
      }
    }
  }, [sessions]);

  // Convert backend chat history to local sessions format (only if no local sessions)
  useEffect(() => {
    if (chatHistory && Array.isArray(chatHistory) && chatHistory.length > 0 && sessions.length === 0) {
      const convertedSessions = chatHistory
        .filter(chat => chat && typeof chat === 'object')
        .map((chat, index) => {
          const message = chat.message || '';
          const response = (chat as any).response || (chat as any).reply || (chat as any).answer || 'No response available';
          const timestamp = chat.timestamp || (chat as any).createdAt || new Date().toISOString();
          const backendId = (chat as any)._id;
          const time = new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          return {
            id: Date.now() + index,
            backendId,
            title: message.slice(0, 30) || 'Chat Session',
            time,
            section: 'Today',
            messages: [
              { role: 'user' as const, text: message, time },
              { role: 'ai' as const, text: response, time },
            ],
          };
        });
      setSessions(convertedSessions as ChatSession[]);
      if (convertedSessions.length > 0 && !activeId) {
        setActiveId(convertedSessions[0].id);
      }
    }
  }, [chatHistory, sessions.length, activeId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeSession?.messages, isTyping]);

  const newChat = () => {
    const id = Date.now();
    const session: ChatSession = { id, title: 'New Chat', time: getNow(), section: 'Today', messages: [] };
    const updatedSessions = [session, ...sessions];
    setSessions(updatedSessions);
    storage.setJSON('aiChatSessions', updatedSessions);
    setActiveId(id);
  };

  const deleteSession = async (e: React.MouseEvent, id: number) => {
    e.preventDefault();
    e.stopPropagation();

    const sessionToDelete = sessions.find(s => s.id === id);
    if (sessionToDelete && (sessionToDelete as any).backendId) {
      try {
        await deleteChatMessage((sessionToDelete as any).backendId);
      } catch (error) {
        console.error('Failed to delete from backend:', error);
      }
    }

    // Remove from local sessions
    const updatedSessions = sessions.filter(s => s.id !== id);
    setSessions(updatedSessions);
    
    // Update localStorage immediately
    if (updatedSessions.length === 0) {
      storage.remove('aiChatSessions');
    } else {
      storage.setJSON('aiChatSessions', updatedSessions);
    }

    // If deleting active session, switch to another or clear
    if (activeId === id) {
      setActiveId(updatedSessions.length > 0 ? updatedSessions[0].id : null);
    }
  };

  const clearAllSessions = async () => {
    if (!isLoggedIn) return;
    setIsClearingAll(true);
    try {
      await clearAllChatHistory();
      setSessions([]);
      storage.remove('aiChatSessions');
      setActiveId(null);
    } catch (error) {
      console.error('Failed to clear all chats:', error);
    } finally {
      setIsClearingAll(false);
      setShowConfirmDialog(false);
    }
  };

  const handleClearAllClick = () => {
    if (sessions.length === 0) return;
    setShowConfirmDialog(true);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachedFiles(prev => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const removeFile = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const startRecording = async () => {
    try {
      if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        alert('Speech recognition not supported in this browser. Try Chrome.');
        return;
      }

      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(prev => prev + (prev ? ' ' : '') + transcript);
        setIsRecording(false);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        alert(`Speech recognition error: ${event.error}`);
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognition.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Error starting speech recognition:', err);
      alert('Failed to start speech recognition');
    }
  };

  const stopRecording = () => {
    setIsRecording(false);
  };


  const loadBrowserContent = async () => {
    if (!browserUrl.trim()) return;
    const content = `Content from ${browserUrl}: This is a simulated browser fetch. In production, use a backend API to fetch and parse web content.`;
    setInput(prev => prev + (prev ? '\n\n' : '') + content);
    setShowBrowser(false);
    setBrowserUrl('');
  };

  const sendMessage = async (text?: string) => {
    if (!isLoggedIn) {
      alert('Please log in to use AI Chat');
      return;
    }

    const msg = (text ?? input).trim();
    if (!msg && attachedFiles.length === 0) return;

    let sessionId = activeId;
    
    // Only create new session if there's no active session at all
    // This ensures continuous conversation like ChatGPT
    if (!sessionId) {
      const id = Date.now();
      const session: ChatSession = { 
        id, 
        title: msg.slice(0, 30) || 'New Chat', 
        time: getNow(), 
        section: 'Today', 
        messages: [] 
      };
      const newSessions = [session, ...sessions];
      setSessions(newSessions);
      storage.setJSON('aiChatSessions', newSessions);
      setActiveId(id);
      sessionId = id;
    }

    const files = attachedFiles.map(f => ({
      name: f.name,
      size: (f.size / 1024).toFixed(1) + ' KB',
      type: f.type || 'unknown'
    }));

    const userMsg: Message = { role: 'user', text: msg || 'Uploaded files', time: getNow(), files: files.length > 0 ? files : undefined };
    setSessions(prevSessions => {
      const updatedSessions = prevSessions.map(s => s.id === sessionId
        ? { ...s, title: s.messages.length === 0 ? (msg.slice(0, 30) || 'New Chat') : s.title, messages: [...s.messages, userMsg] }
        : s
      );
      storage.setJSON('aiChatSessions', updatedSessions);
      return updatedSessions;
    });
    setInput('');
    setAttachedFiles([]);
    setIsTyping(true);

    try {
      // Detect image generation request first
      const isImageRequest = /generate.*image|create.*image|draw|paint|illustrate|picture of|image of|show.*image|make.*image/i.test(msg);

      if (isImageRequest) {
        const subject = msg
          .replace(/generate|create|draw|paint|illustrate|show|make|an image of|a picture of|image of|picture of/gi, '')
          .trim() || msg;
        const encodedPrompt = encodeURIComponent(subject);
        const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=512&height=512&nologo=true&model=flux`;
        const aiMsg: Message = {
          role: 'ai',
          text: `Here's the generated image for: **${subject}**`,
          time: getNow(),
          imageUrl,
        };
        setSessions(prevSessions => {
          const updatedSessions = prevSessions.map(s => s.id === sessionId
            ? { ...s, messages: [...s.messages, aiMsg] } : s
          );
          storage.setJSON('aiChatSessions', updatedSessions);
          return updatedSessions;
        });
        setIsTyping(false);
        return;
      }

      // Always include conversation context for continuity (like ChatGPT)
      const session = sessions.find(s => s.id === sessionId);
      const conversationHistory = (session?.messages || [])
        .filter(m => !m.imageUrl && m.text && m.text.length < 500) // Include more context
        .slice(-8); // Include last 8 messages for better context

      // Build full conversation context
      let fullMessage = msg;
      if (conversationHistory.length > 0) {
        const contextMessages = conversationHistory.map(m => 
          `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.text}`
        ).join('\n');
        fullMessage = `${contextMessages}\nUser: ${msg}`;
      }

      const { text: aiResponse, backendId } = await sendChatMessage(fullMessage);

      let responseText = aiResponse || 'No response received';
      
      const aiMsg: Message = { role: 'ai', text: responseText, time: getNow() };
      setSessions(prevSessions => {
        const updatedSessions = prevSessions.map(s => s.id === sessionId
          ? { ...s, ...(backendId && !(s as any).backendId ? { backendId } : {}), messages: [...s.messages, aiMsg] }
          : s
        );
        storage.setJSON('aiChatSessions', updatedSessions);
        return updatedSessions;
      });
      
    } catch (error: any) {
      console.error('❌ Failed to send message:', error);
      let errorText = 'Sorry, I encountered an error. Please try again.';
      
      if (error.message?.includes('Invalid token') || error.message?.includes('401')) {
        errorText = '🔐 Authentication failed. Please log in again to continue chatting.';
      } else if (error.message?.includes('network') || error.message?.includes('fetch')) {
        errorText = '🌐 Network error. Please check your internet connection and try again.';
      } else if (error.message?.includes('timeout')) {
        errorText = '⏱️ Request timed out. The AI service might be busy. Please try again.';
      } else if (error.message) {
        errorText = `⚠️ ${error.message}`;
      }
      
      const errorMsg: Message = { 
        role: 'ai', 
        text: errorText, 
        time: getNow() 
      };
      setSessions(prevSessions => {
        const updatedSessions = prevSessions.map(s => s.id === sessionId
          ? { ...s, messages: [...s.messages, errorMsg] }
          : s
        );
        storage.setJSON('aiChatSessions', updatedSessions);
        return updatedSessions;
      });
    } finally {
      setIsTyping(false);
    }
  };

  // Enhanced copy function for different content types
  const copyText = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      // Optional: Show a brief success indicator
    }).catch(console.error);
  };

  const copyCodeBlock = (code: string) => {
    navigator.clipboard.writeText(code).then(() => {
      // Optional: Show a brief success indicator
    }).catch(console.error);
  };

  // Render AI message with markdown, clickable links, code blocks
  const renderAiText = (text: string) => {
    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];

      // Code block
      if (line.startsWith('```')) {
        const lang = line.slice(3).trim();
        const codeLines: string[] = [];
        i++;
        while (i < lines.length && !lines[i].startsWith('```')) {
          codeLines.push(lines[i]);
          i++;
        }
        const codeContent = codeLines.join('\n');
        elements.push(
          <div key={i} className="my-2 rounded-xl overflow-hidden border border-white/10 relative group">
            {lang && (
              <div className="bg-white/5 px-3 py-1 text-xs text-purple-300 font-mono flex items-center justify-between">
                <span>{lang}</span>
                <button
                  onClick={() => copyCodeBlock(codeContent)}
                  className="opacity-0 group-hover:opacity-100 flex items-center gap-1 text-gray-400 hover:text-white text-xs transition-all"
                  title="Copy code"
                >
                  <Copy size={12} /> Copy
                </button>
              </div>
            )}
            <div className="relative">
              <pre className="bg-[#0d0d1a] px-4 py-3 text-xs text-green-300 font-mono overflow-x-auto whitespace-pre">{codeContent}</pre>
              {!lang && (
                <button
                  onClick={() => copyCodeBlock(codeContent)}
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 flex items-center gap-1 bg-black/50 hover:bg-black/70 text-gray-400 hover:text-white text-xs px-2 py-1 rounded transition-all"
                  title="Copy code"
                >
                  <Copy size={12} /> Copy
                </button>
              )}
            </div>
          </div>
        );
        i++;
        continue;
      }

      // Bullet list
      if (line.match(/^[-*•]\s/)) {
        elements.push(
          <div key={i} className="flex gap-2 my-0.5">
            <span className="text-purple-400 mt-0.5 shrink-0">•</span>
            <span>{renderInline(line.replace(/^[-*•]\s/, ''))}</span>
          </div>
        );
        i++;
        continue;
      }

      // Numbered list
      if (line.match(/^\d+\.\s/)) {
        const num = line.match(/^(\d+)\./)?.[1];
        elements.push(
          <div key={i} className="flex gap-2 my-0.5">
            <span className="text-purple-400 shrink-0 font-medium">{num}.</span>
            <span>{renderInline(line.replace(/^\d+\.\s/, ''))}</span>
          </div>
        );
        i++;
        continue;
      }

      // Heading
      if (line.startsWith('### ')) {
        elements.push(<p key={i} className="font-bold text-white text-sm mt-3 mb-1">{renderInline(line.slice(4))}</p>);
        i++; continue;
      }
      if (line.startsWith('## ')) {
        elements.push(<p key={i} className="font-bold text-white text-base mt-3 mb-1">{renderInline(line.slice(3))}</p>);
        i++; continue;
      }

      // Empty line
      if (line.trim() === '') {
        elements.push(<div key={i} className="h-2" />);
        i++; continue;
      }

      // Normal line
      elements.push(<p key={i} className="my-0.5 leading-relaxed">{renderInline(line)}</p>);
      i++;
    }

    return <div className="text-gray-200 text-sm">{elements}</div>;
  };

  const renderInline = (text: string): React.ReactNode => {
    // Split by URLs, bold, inline code
    const parts = text.split(/(https?:\/\/[^\s]+|\*\*[^*]+\*\*|`[^`]+`)/g);
    return parts.map((part, idx) => {
      if (part.match(/^https?:\/\//)) {
        return (
          <a key={idx} href={part} target="_blank" rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 underline underline-offset-2 break-all">
            {part}
          </a>
        );
      }
      if (part.match(/^\*\*.*\*\*$/)) {
        return <strong key={idx} className="text-white font-semibold">{part.slice(2, -2)}</strong>;
      }
      if (part.match(/^`.*`$/)) {
        const inlineCode = part.slice(1, -1);
        return (
          <span key={idx} className="relative group inline-block">
            <code className="bg-white/10 text-green-300 px-1.5 py-0.5 rounded text-xs font-mono">{inlineCode}</code>
            <button
              onClick={() => copyText(inlineCode)}
              className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 bg-black/70 hover:bg-black/90 text-white text-xs p-1 rounded transition-all"
              title="Copy code"
            >
              <Copy size={8} />
            </button>
          </span>
        );
      }
      return part;
    });
  };

  const startEditMessage = (sessionId: number, messageIndex: number, currentText: string) => {
    const messageId = `${sessionId}-${messageIndex}`;
    setEditingMessageId(messageId);
    setEditText(currentText);
  };

  const cancelEdit = () => {
    setEditingMessageId(null);
    setEditText('');
  };

  const saveEdit = async (sessionId: number, messageIndex: number) => {
    if (!editText.trim()) { cancelEdit(); return; }

    const newText = editText.trim();
    cancelEdit();

    // Update the user message and remove all messages after it
    setSessions(prevSessions => {
      const updatedSessions = prevSessions.map(session => {
        if (session.id !== sessionId) return session;
        const updatedMessages = session.messages.slice(0, messageIndex);
        updatedMessages.push({ ...session.messages[messageIndex], text: newText, time: getNow() + ' (edited)' });
        return { ...session, messages: updatedMessages };
      });
      storage.setJSON('aiChatSessions', updatedSessions);
      return updatedSessions;
    });

    // Resend to backend with full conversation context
    setIsTyping(true);
    try {
      const editSession = sessions.find(s => s.id === sessionId);
      const conversationHistory = (editSession?.messages || [])
        .slice(0, messageIndex) // Get messages before the edited one
        .filter(m => !m.imageUrl && m.text && m.text.length < 500);
      
      // Build full conversation context including the edited message
      let fullMessage = newText;
      if (conversationHistory.length > 0) {
        const contextMessages = conversationHistory.map(m => 
          `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.text}`
        ).join('\n');
        fullMessage = `${contextMessages}\nUser: ${newText}`;
      }
      
      const { text: aiResponse, backendId } = await sendChatMessage(fullMessage);
      const aiMsg: Message = { role: 'ai', text: aiResponse || 'No response received', time: getNow() };
      setSessions(prevSessions => {
        const updatedSessions = prevSessions.map(s => s.id === sessionId
          ? { ...s, ...(backendId && !(s as any).backendId ? { backendId } : {}), messages: [...s.messages, aiMsg] }
          : s
        );
        storage.setJSON('aiChatSessions', updatedSessions);
        return updatedSessions;
      });
    } catch (error: any) {
      const errorMsg: Message = { role: 'ai', text: `⚠️ ${error.message || 'Failed to get response. Please try again.'}`, time: getNow() };
      setSessions(prevSessions => {
        const updatedSessions = prevSessions.map(s => s.id === sessionId
          ? { ...s, messages: [...s.messages, errorMsg] }
          : s
        );
        storage.setJSON('aiChatSessions', updatedSessions);
        return updatedSessions;
      });
    } finally {
      setIsTyping(false);
    }
  };

  const handleAiTool = (tool: typeof aiTools[0]) => {
    if (tool.action === 'navigate' && onNavigate) {
      onNavigate(tool.page!);
    } else if (tool.action === 'prompt') {
      setInput(tool.prompt!);
      if (!activeId) newChat();
    }
  };

  const shareChat = async () => {
    if (!activeSession || activeSession.messages.length === 0) return;
    const chatText = activeSession.messages
      .map(m => `${m.role === 'user' ? 'You' : 'AI'}: ${m.text}`)
      .join('\n\n');
    if (navigator.share) {
      try {
        await navigator.share({ title: activeSession.title, text: chatText });
      } catch (err) {
        if ((err as Error).name !== 'AbortError') copyText(chatText);
      }
    } else {
      copyText(chatText);
    }
  };

  const grouped = ['Today', 'Yesterday', 'This Week'].map(section => ({
    section,
    items: sessions.filter(s => s.section === section),
  })).filter(g => g.items.length > 0);

  return (
    <>
    <div className="flex-1 flex bg-[#0f0f1e] h-screen overflow-hidden">
      {/* Chat History Sidebar */}
      <div className="w-64 border-r border-white/5 flex flex-col">
        <div className="p-3 border-b border-white/5">
          <div className="flex gap-2">
            <button onClick={newChat} className="flex-1 flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl px-3 py-2 text-white text-sm font-medium transition-colors">
              <Plus size={14} /> New Chat
            </button>
            <button onClick={handleClearAllClick} disabled={isClearingAll || sessions.length === 0} className="flex items-center gap-1 bg-red-600/20 hover:bg-red-600/30 disabled:bg-gray-600/20 disabled:text-gray-500 border border-red-500/30 disabled:border-gray-500/30 rounded-xl px-3 py-2 text-red-400 disabled:cursor-not-allowed text-sm font-medium transition-colors" title={sessions.length === 0 ? 'No chats to clear' : 'Clear all chats'}>
              <Trash2 size={14} className={isClearingAll ? 'animate-spin' : ''} /> 
              {isClearingAll ? 'Clearing...' : 'Clear All'}
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {sessions.length === 0 && (
            <p className="text-gray-600 text-xs text-center mt-6 px-3">No chats yet. Start a new conversation!</p>
          )}
          {grouped.map(({ section, items }) => (
            <div key={section} className="mb-3">
              <p className="text-gray-600 text-xs px-2 py-1">{section}</p>
              {items.map(s => (
                <div key={s.id} className={`group flex items-center rounded-xl transition-colors ${activeId === s.id ? 'bg-purple-600/20' : 'hover:bg-white/5'}`}>
                  <button 
                    onClick={() => setActiveId(s.id)} 
                    className="flex-1 text-left px-3 py-2.5 text-sm min-w-0"
                  >
                    <p className={`font-medium truncate ${activeId === s.id ? 'text-purple-300' : 'text-gray-400'}`}>{s.title}</p>
                    <p className="text-gray-600 text-xs">{s.time}</p>
                  </button>
                  <button 
                    onClick={(e) => deleteSession(e, s.id)} 
                    className="opacity-0 group-hover:opacity-100 p-2 text-gray-600 hover:text-red-400 transition-all shrink-0"
                    title="Delete chat"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <div>
            <h1 className="text-white text-lg font-bold flex items-center gap-2">AI Chat <span className="text-purple-400">✦</span></h1>
            <p className="text-gray-500 text-sm">Your AI-powered study companion</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={shareChat} className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-gray-300 text-sm hover:bg-white/10 transition-colors">
              <Share2 size={14} /> Share Chat
            </button>
            <button className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-gray-300 text-sm hover:bg-white/10 transition-colors">
              EchoMentor AI <ChevronDown size={14} />
            </button>
            <div className="relative">
              <Bell size={18} className="text-gray-400" />
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {!isLoggedIn ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-24 h-24 bg-red-600/20 rounded-2xl flex items-center justify-center mb-4">
                <AlertCircle size={40} className="text-red-400" />
              </div>
              <h2 className="text-white text-xl font-bold mb-2">Authentication Required</h2>
              <p className="text-gray-500 text-sm mb-6">Please log in to access AI Chat features and start conversations.</p>
              <button 
                onClick={() => window.location.href = '/login'} 
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-medium transition-colors"
              >
                Go to Login
              </button>
            </div>
          ) : !activeSession || activeSession.messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <img src="https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=300&q=80" alt="AI" className="w-24 h-24 rounded-2xl object-cover mb-4 opacity-90" />
              <h2 className="text-white text-xl font-bold mb-2">How can I help you today?</h2>
              <p className="text-gray-500 text-sm mb-6">Ask me anything about your studies, career, or learning goals.</p>
              
              <div className="grid grid-cols-1 gap-2 w-full max-w-md">
                {suggestedPromptsList.map((p, i) => (
                  <button key={i} onClick={() => sendMessage(p)} className="bg-white/5 hover:bg-purple-600/20 border border-white/5 hover:border-purple-500/30 rounded-xl px-4 py-2.5 text-gray-400 hover:text-white text-sm text-left transition-all">
                    {p}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {activeSession.messages.map((msg, i) => {
                const messageId = `${activeSession.id}-${i}`;
                const isEditing = editingMessageId === messageId;
                
                return (
                <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.role === 'ai' && (
                    <div className="w-9 h-9 bg-purple-600 rounded-full overflow-hidden shrink-0"><img src="https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=80&q=80" alt="AI" className="w-full h-full object-cover" /></div>
                  )}
                  <div className={`${msg.imageUrl ? 'w-full max-w-lg' : 'max-w-2xl'} ${msg.role === 'user' ? 'order-first' : ''}`}>
                    {msg.role === 'user' ? (
                      <div className="bg-purple-600 text-white rounded-2xl rounded-tr-sm px-4 py-3 text-sm">
                        {isEditing ? (
                          <div className="space-y-2">
                            <textarea
                              value={editText}
                              onChange={(e) => setEditText(e.target.value)}
                              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/60 text-sm resize-none focus:outline-none focus:border-white/40"
                              rows={3}
                              placeholder="Edit your message..."
                            />
                            <div className="flex gap-2 justify-end">
                              <button
                                onClick={cancelEdit}
                                className="flex items-center gap-1 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg px-3 py-1 text-white/80 text-xs transition-colors"
                              >
                                <X size={12} /> Cancel
                              </button>
                              <button
                                onClick={() => saveEdit(activeSession.id, i)}
                                className="flex items-center gap-1 bg-white/20 hover:bg-white/30 border border-white/30 rounded-lg px-3 py-1 text-white text-xs transition-colors"
                              >
                                <Check size={12} /> Save
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <p>{msg.text}</p>
                            {msg.files && msg.files.length > 0 && (
                              <div className="mt-2 space-y-1">
                                {msg.files.map((f, fi) => (
                                  <div key={fi} className="flex items-center gap-2 bg-white/10 rounded-lg px-2 py-1 text-xs">
                                    <FileText size={12} />
                                    <span>{f.name}</span>
                                    <span className="text-purple-200">({f.size})</span>
                                  </div>
                                ))}
                              </div>
                            )}
                            <div className="flex items-center justify-between mt-2">
                              <div className="flex gap-2">
                                <button
                                  onClick={() => copyText(msg.text)}
                                  className="flex items-center gap-1 text-purple-200 hover:text-white text-xs transition-colors"
                                  title="Copy message"
                                >
                                  <Copy size={12} /> Copy
                                </button>
                                <button
                                  onClick={() => startEditMessage(activeSession.id, i, msg.text)}
                                  className="flex items-center gap-1 text-purple-200 hover:text-white text-xs transition-colors"
                                  title="Edit message"
                                >
                                  <Edit3 size={12} /> Edit
                                </button>
                              </div>
                              <p className="text-purple-200 text-xs">{msg.time} ✓✓</p>
                            </div>
                          </>
                        )}
                      </div>
                    ) : (
                      <div className="bg-[#1a1a2e] border border-white/5 rounded-2xl rounded-tl-sm px-5 py-4">
                        {renderAiText(msg.text)}
                        {msg.imageUrl && (
                          <div className="mt-3 space-y-2">
                            <div className="relative rounded-xl overflow-hidden border border-purple-500/30 bg-[#0d0d1a]" style={{ minHeight: '260px' }}>
                              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2" id={`img-loading-${i}`}>
                                <div className="w-8 h-8 border-2 border-purple-400/30 border-t-purple-400 rounded-full animate-spin" />
                                <p className="text-gray-500 text-xs">Generating image...</p>
                              </div>
                              <img
                                src={msg.imageUrl}
                                alt="AI Generated"
                                referrerPolicy="no-referrer"
                                className="w-full object-cover rounded-xl relative z-10"
                                onLoad={(e) => {
                                  const img = e.target as HTMLImageElement;
                                  img.style.opacity = '1';
                                  const loadingEl = document.getElementById(`img-loading-${i}`);
                                  if (loadingEl) loadingEl.style.display = 'none';
                                }}
                                onError={() => {
                                  const loadingEl = document.getElementById(`img-loading-${i}`);
                                  if (loadingEl) {
                                    loadingEl.innerHTML = `<p class="text-red-400 text-xs text-center px-4">⚠️ Could not load image.<br/><a href="${msg.imageUrl}" target="_blank" class="text-blue-400 underline mt-1 inline-block">Click here to view it</a></p>`;
                                  }
                                }}
                                style={{ opacity: 0, transition: 'opacity 0.3s' }}
                              />
                            </div>
                            <div className="flex items-center gap-3">
                              <a href={msg.imageUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 text-xs underline">
                                🔗 Open full image
                              </a>
                            </div>
                          </div>
                        )}
                        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-white/5">
                          <button onClick={() => copyText(msg.text)} className="flex items-center gap-1 text-gray-500 hover:text-white text-xs transition-colors">
                            <Copy size={12} /> Copy Text
                          </button>
                          <div className="ml-auto flex items-center gap-2">
                            <button className="text-gray-500 hover:text-green-400 transition-colors"><ThumbsUp size={14} /></button>
                            <button className="text-gray-500 hover:text-red-400 transition-colors"><ThumbsDown size={14} /></button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  {msg.role === 'user' && (
                    <div className="w-9 h-9 rounded-full bg-linear-to-br from-pink-400 to-purple-600 flex items-center justify-center text-white text-xs font-bold shrink-0">U</div>
                  )}
                </div>
              );})}
              {isTyping && (
                <div className="flex gap-3 justify-start">
                  <div className="w-9 h-9 bg-purple-600 rounded-full overflow-hidden shrink-0"><img src="https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=80&q=80" alt="AI" className="w-full h-full object-cover" /></div>
                  <div className="bg-[#1a1a2e] border border-white/5 rounded-2xl rounded-tl-sm px-5 py-4">
                    <div className="flex gap-1 items-center h-5">
                      <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        <div className="p-4 border-t border-white/5">
          {showBrowser && (
            <div className="mb-3 bg-[#1a1a2e] border border-purple-500/30 rounded-2xl p-3">
              <div className="flex items-center gap-2 mb-2">
                <Globe size={16} className="text-purple-400" />
                <span className="text-white text-sm font-medium">Browse Web</span>
                <button onClick={() => setShowBrowser(false)} className="ml-auto text-gray-500 hover:text-white">
                  <X size={16} />
                </button>
              </div>
              <div className="flex gap-2">
                <input
                  value={browserUrl}
                  onChange={e => setBrowserUrl(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && loadBrowserContent()}
                  placeholder="Enter URL to fetch content..."
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-gray-300 text-sm focus:outline-none focus:border-purple-500/50"
                />
                <button onClick={loadBrowserContent} className="bg-purple-600 hover:bg-purple-700 text-white text-sm px-4 rounded-xl transition-colors">
                  Load
                </button>
              </div>
            </div>
          )}
          {attachedFiles.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-2">
              {attachedFiles.map((file, i) => (
                <div key={i} className="flex items-center gap-2 bg-purple-600/20 border border-purple-500/30 rounded-xl px-3 py-2 text-sm">
                  <FileText size={14} className="text-purple-400" />
                  <span className="text-white">{file.name}</span>
                  <span className="text-gray-400 text-xs">({(file.size / 1024).toFixed(1)} KB)</span>
                  <button onClick={() => removeFile(i)} className="text-gray-400 hover:text-white ml-1">
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
          <div className="bg-[#1a1a2e] border border-white/10 rounded-2xl p-3 flex items-end gap-3">
            <input type="file" ref={fileInputRef} onChange={handleFileUpload} multiple className="hidden" />
            <div className="flex gap-2">
              <button onClick={() => fileInputRef.current?.click()} className="text-gray-500 hover:text-purple-400 transition-colors p-1" title="Attach files">
                <Paperclip size={18} />
              </button>
              <button onClick={() => setShowBrowser(!showBrowser)} className="text-gray-500 hover:text-purple-400 transition-colors p-1" title="Browse web">
                <Globe size={18} />
              </button>
              <button
                onClick={isRecording ? stopRecording : startRecording}
                className={`transition-colors p-1 ${isRecording ? 'text-red-500 animate-pulse' : 'text-gray-500 hover:text-purple-400'}`}
                title={isRecording ? 'Stop recording' : 'Voice input'}
              >
                <Mic size={18} />
              </button>
            </div>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              placeholder="Ask anything..."
              className="flex-1 bg-transparent text-white placeholder-gray-600 text-sm focus:outline-none"
            />
            <button 
              onClick={() => sendMessage()} 
              disabled={!input.trim() && attachedFiles.length === 0 || !isLoggedIn} 
              className="w-9 h-9 bg-purple-600 hover:bg-purple-700 disabled:opacity-40 rounded-full flex items-center justify-center transition-colors shrink-0"
              title={!isLoggedIn ? 'Please log in to send messages' : 'Send message'}
            >
              <Send size={15} className="text-white" />
            </button>
          </div>
          <p className="text-gray-700 text-xs text-center mt-2">AI can make mistakes. Please verify important information.</p>
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-60 border-l border-white/5 overflow-y-auto p-4 space-y-5">
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-white text-sm font-semibold">AI Tools</h3>
            <button className="text-purple-400 text-xs">View all</button>
          </div>
          <div className="space-y-2">
            {aiTools.map((t, i) => (
              <div key={i} onClick={() => handleAiTool(t)} className="flex items-center gap-2 bg-white/5 hover:bg-white/10 rounded-xl p-2.5 cursor-pointer transition-colors">
                <div className={`w-8 h-8 ${t.bg} rounded-lg flex items-center justify-center shrink-0`}>{t.icon}</div>
                <div>
                  <p className="text-white text-xs font-medium">{t.title}</p>
                  <p className="text-gray-600 text-xs">{t.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-white text-sm font-semibold">Suggested Prompts</h3>
          </div>
          <div className="space-y-2">
            {suggestedPromptsList.map((p, i) => (
              <button key={i} onClick={() => sendMessage(p)} className="w-full text-left bg-white/5 hover:bg-purple-600/20 border border-white/5 hover:border-purple-500/30 rounded-xl px-3 py-2 text-gray-400 hover:text-white text-xs transition-all">
                {p}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-white text-sm font-semibold mb-3">Chat Settings</h3>
          <div className="space-y-3">
            <div>
              <label className="text-gray-500 text-xs mb-1.5 block">Response Length</label>
              <select className="w-full bg-white/5 border border-white/10 text-gray-300 text-xs rounded-xl px-3 py-2 focus:outline-none">
                <option>Medium</option>
                <option>Short</option>
                <option>Long</option>
              </select>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-gray-500 text-xs">Temperature</label>
                <span className="text-gray-400 text-xs">{temp}</span>
              </div>
              <input type="range" min="0" max="1" step="0.1" value={temp} onChange={e => setTemp(parseFloat(e.target.value))} className="w-full accent-purple-600" />
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Confirmation Dialog */}
    {showConfirmDialog && (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-[#1a1a2e] border border-white/10 rounded-2xl p-6 max-w-md mx-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-red-600/20 rounded-full flex items-center justify-center">
              <AlertCircle size={24} className="text-red-400" />
            </div>
            <div>
              <h3 className="text-white font-semibold">Clear All Chats</h3>
              <p className="text-gray-400 text-sm">This action cannot be undone</p>
            </div>
          </div>
          <p className="text-gray-300 text-sm mb-6">
            Are you sure you want to delete all {sessions.length} chat{sessions.length !== 1 ? 's' : ''}? 
            This will permanently remove all conversations.
          </p>
          <div className="flex gap-3">
            <button 
              onClick={() => setShowConfirmDialog(false)}
              disabled={isClearingAll}
              className="flex-1 bg-white/5 hover:bg-white/10 disabled:opacity-50 border border-white/10 rounded-xl px-4 py-2 text-gray-300 text-sm font-medium transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={clearAllSessions}
              disabled={isClearingAll}
              className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl px-4 py-2 text-white text-sm font-medium transition-colors flex items-center justify-center gap-2"
            >
              {isClearingAll ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Clearing...
                </>
              ) : (
                <>
                  <Trash2 size={14} />
                  Delete All
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}

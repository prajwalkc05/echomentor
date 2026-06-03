import { useState, useRef, useEffect } from 'react';
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Send, Bell, Copy, ThumbsUp, ThumbsDown, Paperclip, Plus, Share2, Trash2, Mic, X, FileText, Presentation, Code, Calculator, PenLine, AlertCircle, Edit3, Check } from 'lucide-react';
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

interface UploadedFile {
  name: string;
  size: string;
  type: string;
}

interface ChatSession {
  id: number;
  title: string;
  time: string;
  section: string;
  messages: Message[];
  // Extracted text from all files uploaded in this session — persisted in localStorage
  fileContext: string;
  uploadedFiles: UploadedFile[];
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
  const { sendChatMessage, extractFiles, fetchChatHistory, deleteChatMessage, clearAllChatHistory } = useAppData();
  const { isLoggedIn } = useUser();
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    const saved = storage.getJSON<ChatSession[]>('aiChatSessions');
    return saved ?? [];
  });
  const [activeId, setActiveId] = useState<number | null>(() => {
    const saved = storage.get('aiChatActiveId');
    return saved ? Number(saved) : null;
  });
  const [input, setInput] = useState('');
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isClearingAll, setIsClearingAll] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Mirror of sessions kept in a ref so send() always reads the latest value
  // (avoids stale closure when send() is called right after handleFileUpload)
  const sessionsRef = useRef<ChatSession[]>(sessions);
  useEffect(() => { sessionsRef.current = sessions; }, [sessions]);

  const activeSession = sessions.find(s => s.id === activeId) ?? null;

  // Persist sessions to localStorage on every change
  useEffect(() => {
    if (sessions.length === 0) storage.remove('aiChatSessions');
    else storage.setJSON('aiChatSessions', sessions);
  }, [sessions]);

  // Persist activeId to localStorage on every change
  useEffect(() => {
    if (activeId === null) storage.remove('aiChatActiveId');
    else storage.set('aiChatActiveId', String(activeId));
  }, [activeId]);

  // Fetch backend history once on mount (only to seed if nothing in localStorage)
  useEffect(() => {
    fetchChatHistory().catch(() => {});
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeSession?.messages, isTyping]);

  const newChat = () => {
    const id = Date.now();
    const session: ChatSession = { id, title: 'New Chat', time: getNow(), section: 'Today', messages: [], fileContext: '', uploadedFiles: [] };
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const newFiles = Array.from(e.target.files);
    setAttachedFiles(prev => [...prev, ...newFiles]);
    e.target.value = '';

    // Resolve or create session immediately so we have a sessionId to attach files to
    let sessionId = activeId;
    if (!sessionId) {
      const id = Date.now();
      const newSession: ChatSession = {
        id, title: 'New Chat', time: getNow(), section: 'Today',
        messages: [], fileContext: '', uploadedFiles: [],
      };
      setSessions(prev => [newSession, ...prev]);
      setActiveId(id);
      sessionId = id;
    }

    // Extract text immediately — store in session so every follow-up message has context
    setIsExtracting(true);
    try {
      const { extractedText } = await extractFiles(newFiles);
      const newFileMeta: UploadedFile[] = newFiles.map(f => ({
        name: f.name,
        size: (f.size / 1024).toFixed(1) + ' KB',
        type: f.type,
      }));
      setSessions(prev =>
        prev.map(s =>
          s.id === sessionId
            ? {
                ...s,
                // Append new extracted text to any existing file context in this session
                fileContext: s.fileContext
                  ? `${s.fileContext}\n\n${extractedText}`
                  : extractedText,
                uploadedFiles: [...(s.uploadedFiles ?? []), ...newFileMeta],
              }
            : s
        )
      );
    } catch (err) {
      console.error('File extraction failed:', err);
    } finally {
      setIsExtracting(false);
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
      };

      recognition.onerror = () => {
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognition.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Recording error:', error);
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    setIsRecording(false);
  };

  const generateTitle = (text: string) =>
    text.length < 5 ? 'New Conversation' : text.slice(0, 40);

  const send = async () => {
    if (!input.trim() && attachedFiles.length === 0) return;
    if (isExtracting) return; // wait for extraction to finish

    const userText = input.trim();
    setInput('');

    // Resolve or create session
    let sessionId = activeId;
    if (!sessionId) {
      const id = Date.now();
      const newSession: ChatSession = {
        id,
        title: userText ? generateTitle(userText) : 'New Chat',
        time: getNow(),
        section: 'Today',
        messages: [],
        fileContext: '',
        uploadedFiles: [],
      };
      setSessions(prev => [newSession, ...prev]);
      setActiveId(id);
      sessionId = id;
    }

    const currentSession = sessionsRef.current.find(s => s.id === sessionId);
    const sessionFileContext = currentSession?.fileContext || '';

    const userMsg: Message = {
      role: 'user',
      text: userText || `Uploaded ${attachedFiles.length} file(s)`,
      time: getNow(),
      files: attachedFiles.length > 0
        ? attachedFiles.map(f => ({ name: f.name, size: (f.size / 1024).toFixed(1) + ' KB', type: f.type }))
        : undefined,
    };

    setSessions(prev =>
      prev.map(s =>
        s.id === sessionId
          ? {
              ...s,
              title: s.messages.length === 0 && userText ? generateTitle(userText) : s.title,
              messages: [...s.messages, userMsg],
            }
          : s
      )
    );

    setAttachedFiles([]);
    setIsTyping(true);

    try {
      // Build conversation history from this session only
      const history = (currentSession?.messages ?? []).map(m => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.text,
      }));
      if (userText) history.push({ role: 'user', content: userText });

      // Always pass the session's fileContext — backend injects it as system message
      const response = await sendChatMessage(
        userText || 'Analyze the uploaded file.',
        history,
        sessionFileContext || undefined
      );

      const aiMsg: Message = { role: 'ai', text: response, time: getNow() };
      setSessions(prev =>
        prev.map(s =>
          s.id === sessionId ? { ...s, messages: [...s.messages, aiMsg] } : s
        )
      );
    } catch (error: any) {
      console.error('Send message error:', error);
      const errorMsg: Message = { 
        role: 'ai', 
        text: error.message === 'Authentication required. Please log in to use this feature.' 
          ? '❌ You need to log in to use this feature. Please log in first.'
          : error.message || 'Sorry, I encountered an error. Please try again.', 
        time: getNow() 
      };
      setSessions(prev =>
        prev.map(s =>
          s.id === sessionId ? { ...s, messages: [...s.messages, errorMsg] } : s
        )
      );
    } finally {
      setIsTyping(false);
    }
  };

  const handleToolClick = (tool: typeof aiTools[0]) => {
    if (tool.action === 'navigate' && tool.page && onNavigate) {
      onNavigate(tool.page);
    } else if (tool.action === 'prompt' && tool.prompt) {
      setInput(tool.prompt);
    }
  };

  const handleSuggestedPrompt = (prompt: string) => {
    setInput(prompt);
  };

  const startEditMessage = (msgIndex: number, currentText: string) => {
    setEditingMessageId(`${activeId}-${msgIndex}`);
    setEditText(currentText);
  };

  const saveEditMessage = async (msgIndex: number) => {
    if (!editText.trim() || !activeId) return;

    setSessions(prev =>
      prev.map(s => {
        if (s.id === activeId) {
          const updatedMessages = [...s.messages];
          updatedMessages[msgIndex] = { ...updatedMessages[msgIndex], text: editText.trim() };

          // Remove all messages after edited one
          const newMessages = updatedMessages.slice(0, msgIndex + 1);

          return { ...s, messages: newMessages };
        }
        return s;
      })
    );

    setEditingMessageId(null);
    setEditText('');

    // Regenerate AI response
    if (msgIndex % 2 === 0) {
      setIsTyping(true);
      try {
        const response = await sendChatMessage(editText.trim());
        const aiMsg: Message = { role: 'ai', text: response, time: getNow() };
        setSessions(prev =>
          prev.map(s =>
            s.id === activeId ? { ...s, messages: [...s.messages, aiMsg] } : s
          )
        );
      } catch (error) {
        console.error('Failed to regenerate response:', error);
      } finally {
        setIsTyping(false);
      }
    }
  };

  const cancelEdit = () => {
    setEditingMessageId(null);
    setEditText('');
  };

  return (
    <div className="flex flex-1 overflow-hidden bg-[#0f0f1e] text-white">
      {/* Sidebar */}
      <div className="w-64 bg-[#1a1a2e] border-r border-white/5 flex flex-col">
        <div className="p-4 border-b border-white/5">
          <button
            onClick={newChat}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
          >
            <Plus size={18} />
            <span className="font-medium">New Chat</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {['Today', 'Yesterday', 'Previous 7 Days'].map(section => {
            const sectionChats = sessions.filter(s => s.section === section);
            if (sectionChats.length === 0) return null;
            return (
              <div key={section} className="mb-4">
                <div className="px-4 py-2 text-xs text-gray-400 font-medium">{section}</div>
                {sectionChats.map(s => (
                  <button
                    key={s.id}
                    onClick={() => setActiveId(s.id)}
                    className={`w-full px-4 py-2.5 text-left hover:bg-white/5 transition-colors group relative ${
                      activeId === s.id ? 'bg-white/10' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 truncate text-sm">{s.title}</div>
                      <button
                        onClick={(e) => deleteSession(e, s.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 rounded transition-opacity"
                      >
                        <Trash2 size={14} className="text-red-400" />
                      </button>
                    </div>
                  </button>
                ))}
              </div>
            );
          })}
        </div>

        <div className="p-4 border-t border-white/5">
          <button
            onClick={handleClearAllClick}
            disabled={sessions.length === 0 || isClearingAll}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Trash2 size={16} />
            <span>{isClearingAll ? 'Clearing...' : 'Clear All Chats'}</span>
          </button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="h-14 border-b border-white/5 flex items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-linear-to-br from-purple-500 to-pink-500 flex items-center justify-center text-sm font-bold">
              AI
            </div>
            <div>
              <div className="font-semibold">EchoMentor AI</div>
              <div className="text-xs text-gray-400">Always here to help</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {activeSession && (activeSession.uploadedFiles ?? []).length > 0 && (
              <div className="flex items-center gap-1 px-2 py-1 bg-purple-600/20 border border-purple-500/30 rounded-lg text-xs text-purple-300">
                <FileText size={12} />
                <span>{(activeSession.uploadedFiles ?? []).length} file(s) in context</span>
              </div>
            )}
            <button className="p-2 hover:bg-white/5 rounded-lg transition-colors">
              <Share2 size={18} />
            </button>
            <button className="p-2 hover:bg-white/5 rounded-lg transition-colors">
              <Bell size={18} />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {!activeSession || activeSession.messages.length === 0 ? (
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-12">
                <div className="w-16 h-16 rounded-full bg-linear-to-br from-purple-500 to-pink-500 flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  AI
                </div>
                <h1 className="text-3xl font-bold mb-2">How can I help you today?</h1>
                <p className="text-gray-400">Ask me anything or try one of these:</p>
              </div>

              {/* AI Tools */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-8">
                {aiTools.map((tool, i) => (
                  <button
                    key={i}
                    onClick={() => handleToolClick(tool)}
                    className="p-4 bg-[#1a1a2e] border border-white/5 rounded-xl hover:border-purple-500/50 transition-all text-left group"
                  >
                    <div className={`w-10 h-10 ${tool.bg} rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                      {tool.icon}
                    </div>
                    <div className="font-medium mb-1">{tool.title}</div>
                    <div className="text-sm text-gray-400">{tool.desc}</div>
                  </button>
                ))}
              </div>

              {/* Suggested Prompts */}
              <div className="space-y-2">
                <div className="text-sm text-gray-400 mb-3">Suggested prompts:</div>
                {suggestedPromptsList.map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => handleSuggestedPrompt(prompt)}
                    className="w-full p-3 bg-[#1a1a2e] border border-white/5 rounded-lg hover:border-purple-500/50 transition-all text-left text-sm"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto space-y-6">
              {activeSession.messages.map((msg, i) => {
                const isEditing = editingMessageId === `${activeId}-${i}`;
                return (
                  <div key={i} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                    {msg.role === 'ai' && (
                      <div className="w-8 h-8 rounded-full bg-linear-to-br from-purple-500 to-pink-500 flex items-center justify-center text-sm font-bold shrink-0">
                        AI
                      </div>
                    )}
                    <div className={`flex-1 ${msg.role === 'user' ? 'flex justify-end' : ''}`}>
                      {isEditing ? (
                        <div className="w-full">
                          <textarea
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            className="w-full p-3 bg-[#1a1a2e] border border-purple-500 rounded-lg resize-none focus:outline-none"
                            rows={3}
                          />
                          <div className="flex gap-2 mt-2">
                            <button
                              onClick={() => saveEditMessage(i)}
                              className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm flex items-center gap-1"
                            >
                              <Check size={14} /> Save
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-sm"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div
                          className={`inline-block max-w-[85%] p-4 rounded-2xl ${
                            msg.role === 'user'
                              ? 'bg-purple-600 text-white'
                              : 'bg-[#1a1a2e] border border-white/5 w-full'
                          }`}
                        >
                          {msg.role === 'user' && msg.files && msg.files.length > 0 && (
                            <div className="mb-2 flex flex-wrap gap-1">
                              {msg.files.map((f, fi) => (
                                <div key={fi} className="flex items-center gap-1 bg-white/20 rounded-lg px-2 py-1 text-xs">
                                  <FileText size={11} />
                                  <span>{f.name}</span>
                                  <span className="opacity-70">({f.size})</span>
                                </div>
                              ))}
                            </div>
                          )}
                          {msg.role === 'ai' ? (
                            <div className="prose prose-invert max-w-none text-sm">
                              <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                components={{
                                  code({ className, children, ...props }: any) {
                                    const match = /language-(\w+)/.exec(className || '');
                                    const codeStr = String(children).replace(/\n$/, '');
                                    const isBlock = !props.inline && match;
                                    if (isBlock) {
                                      return (
                                        <div className="my-3 rounded-xl overflow-hidden border border-white/10">
                                          <div className="flex items-center justify-between bg-white/5 px-4 py-2">
                                            <span className="text-xs text-purple-300 font-mono">{match[1]}</span>
                                            <button
                                              onClick={() => navigator.clipboard.writeText(codeStr)}
                                              className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors"
                                            >
                                              <Copy size={12} /> Copy
                                            </button>
                                          </div>
                                          <SyntaxHighlighter
                                            style={oneDark}
                                            language={match[1]}
                                            PreTag="div"
                                            customStyle={{ margin: 0, borderRadius: 0, fontSize: '0.8rem' }}
                                          >
                                            {codeStr}
                                          </SyntaxHighlighter>
                                        </div>
                                      );
                                    }
                                    return <code className="bg-white/10 text-green-300 px-1.5 py-0.5 rounded text-xs font-mono" {...props}>{children}</code>;
                                  },
                                }}
                              >
                                {msg.text}
                              </ReactMarkdown>
                            </div>
                          ) : (
                            <div>{msg.text}</div>
                          )}
                          <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5">
                            <span className="text-xs text-gray-400">{msg.time}</span>
                            <div className="flex gap-1">
                              {msg.role === 'user' && (
                                <button
                                  onClick={() => startEditMessage(i, msg.text)}
                                  className="p-1 hover:bg-white/10 rounded transition-colors"
                                  title="Edit message"
                                >
                                  <Edit3 size={14} />
                                </button>
                              )}
                              {msg.role === 'ai' && (
                                <>
                                  <button
                                    onClick={() => navigator.clipboard.writeText(msg.text)}
                                    className="p-1 hover:bg-white/10 rounded transition-colors"
                                    title="Copy response"
                                  >
                                    <Copy size={14} />
                                  </button>
                                  <button className="p-1 hover:bg-white/10 rounded transition-colors" title="Like">
                                    <ThumbsUp size={14} />
                                  </button>
                                  <button className="p-1 hover:bg-white/10 rounded transition-colors" title="Dislike">
                                    <ThumbsDown size={14} />
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    {msg.role === 'user' && (
                      <div className="w-8 h-8 rounded-full bg-linear-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-sm font-bold shrink-0">
                        U
                      </div>
                    )}
                  </div>
                );
              })}
              {isTyping && (
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-linear-to-br from-purple-500 to-pink-500 flex items-center justify-center text-sm font-bold shrink-0">
                    AI
                  </div>
                  <div className="flex-1">
                    <div className="inline-block p-4 rounded-2xl bg-[#1a1a2e] border border-white/5">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t border-white/5 p-4">
          <div className="max-w-3xl mx-auto">
            {attachedFiles.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-2">
                {attachedFiles.map((file, i) => (
                  <div key={i} className="flex items-center gap-2 px-3 py-2 bg-[#1a1a2e] rounded-lg text-sm">
                    {isExtracting ? (
                      <div className="w-3 h-3 border border-purple-400 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Paperclip size={14} className="text-green-400" />
                    )}
                    <span>{file.name}</span>
                    <span className="text-xs text-gray-400">{isExtracting ? 'Reading...' : 'Ready'}</span>
                    <button onClick={() => removeFile(i)} className="hover:text-red-400">
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                className="hidden"
                multiple
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-3 hover:bg-white/5 rounded-lg transition-colors"
                title="Attach file"
              >
                <Paperclip size={20} />
              </button>
              <button
                onClick={isRecording ? stopRecording : startRecording}
                className={`p-3 rounded-lg transition-colors ${
                  isRecording ? 'bg-red-500 hover:bg-red-600' : 'hover:bg-white/5'
                }`}
                title={isRecording ? 'Stop recording' : 'Voice input'}
              >
                <Mic size={20} />
              </button>
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && send()}
                  placeholder="Message EchoMentor AI..."
                  className="w-full px-4 py-3 bg-[#1a1a2e] border border-white/10 rounded-lg focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>
              <button
                onClick={send}
                disabled={(!input.trim() && attachedFiles.length === 0) || isExtracting}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Send size={20} />
              </button>
            </div>
            <div className="mt-2 text-xs text-gray-400 text-center">
              EchoMentor AI can make mistakes. Check important info.
            </div>
          </div>
        </div>
      </div>

      {/* Confirm Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#1a1a2e] border border-white/10 rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center shrink-0">
                <AlertCircle size={20} className="text-red-400" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Clear All Chats?</h3>
                <p className="text-sm text-gray-400">
                  This will permanently delete all your chat history. This action cannot be undone.
                </p>
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowConfirmDialog(false)}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={clearAllSessions}
                disabled={isClearingAll}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg transition-colors disabled:opacity-50"
              >
                {isClearingAll ? 'Clearing...' : 'Clear All'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

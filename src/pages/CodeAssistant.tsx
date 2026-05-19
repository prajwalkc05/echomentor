import { useState, useRef, useEffect } from 'react';
import { Play, Copy, Trash2, Send, ChevronDown, CheckCheck, AlertCircle } from 'lucide-react';
import { useAppData } from '../context';
import { useUser } from '../context';
import { storage } from '../utils/storage';

const codeSnippets = {
  Python: [
    { title: 'For Loop', code: 'for i in range(10):\n    print(i)' },
    { title: 'List Comprehension', code: '[x**2 for x in range(10) if x % 2 == 0]' },
    { title: 'Function Definition', code: 'def greet(name):\n    return f"Hello, {name}!"' },
    { title: 'Try Except', code: 'try:\n    result = 10 / 0\nexcept ZeroDivisionError as e:\n    print(f"Error: {e}")' },
    { title: 'Class Definition', code: 'class Person:\n    def __init__(self, name):\n        self.name = name\n    \n    def greet(self):\n        return f"Hi, I\'m {self.name}"' },
  ],
  Java: [
    { title: 'For Loop', code: 'for (int i = 0; i < 10; i++) {\n    System.out.println(i);\n}' },
    { title: 'Method Definition', code: 'public static String greet(String name) {\n    return "Hello, " + name + "!";\n}' },
    { title: 'Class Definition', code: 'public class Person {\n    private String name;\n    \n    public Person(String name) {\n        this.name = name;\n    }\n    \n    public String getName() {\n        return name;\n    }\n}' },
    { title: 'Try Catch', code: 'try {\n    int result = 10 / 0;\n} catch (ArithmeticException e) {\n    System.out.println("Error: " + e.getMessage());\n}' },
    { title: 'ArrayList', code: 'ArrayList<String> list = new ArrayList<>();\nlist.add("Hello");\nlist.add("World");\nfor (String item : list) {\n    System.out.println(item);\n}' },
  ],
  'C++': [
    { title: 'For Loop', code: 'for (int i = 0; i < 10; i++) {\n    std::cout << i << std::endl;\n}' },
    { title: 'Function Definition', code: 'std::string greet(const std::string& name) {\n    return "Hello, " + name + "!";\n}' },
    { title: 'Class Definition', code: 'class Person {\nprivate:\n    std::string name;\npublic:\n    Person(const std::string& n) : name(n) {}\n    \n    std::string getName() const {\n        return name;\n    }\n};' },
    { title: 'Vector Usage', code: '#include <vector>\n#include <iostream>\n\nstd::vector<int> numbers = {1, 2, 3, 4, 5};\nfor (const auto& num : numbers) {\n    std::cout << num << " ";\n}' },
    { title: 'Pointer Example', code: 'int value = 42;\nint* ptr = &value;\nstd::cout << "Value: " << *ptr << std::endl;\nstd::cout << "Address: " << ptr << std::endl;' },
  ]
};

const LANGUAGES = ['Python', 'Java', 'C++'] as const;
type Language = typeof LANGUAGES[number];

const LANGUAGE_CONFIG = {
  Python: {
    extension: 'py',
    color: 'bg-blue-500',
    icon: '🐍',
    comment: '#',
    defaultCode: '# Python Code\nprint("Hello, World!")\n\n# Write your Python code here...',
  },
  Java: {
    extension: 'java',
    color: 'bg-orange-500',
    icon: '☕',
    comment: '//',
    defaultCode: '// Java Code\npublic class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n        \n        // Write your Java code here...\n    }\n}',
  },
  'C++': {
    extension: 'cpp',
    color: 'bg-purple-500',
    icon: '⚡',
    comment: '//',
    defaultCode: '// C++ Code\n#include <iostream>\n\nint main() {\n    std::cout << "Hello, World!" << std::endl;\n    \n    // Write your C++ code here...\n    \n    return 0;\n}',
  }
};

const ACTIONS = ['Explain', 'Debug', 'Review', 'Generate'] as const;
type Action = typeof ACTIONS[number];

const ACTION_MAP: Record<Action, 'generate' | 'explain' | 'debug' | 'review'> = {
  Explain: 'explain',
  Debug: 'debug',
  Review: 'review',
  Generate: 'generate',
};

function getNow() { return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); }

export default function CodeAssistant() {
  const { getCodeAssistance } = useAppData();
  const { isLoggedIn } = useUser();
  const [code, setCode] = useState(() => {
    const savedCode = storage.get('codeAssistant_code');
    const savedLang = storage.get('codeAssistant_lang') as Language || 'Python';
    return savedCode || LANGUAGE_CONFIG[savedLang].defaultCode;
  });
  const [lang, setLang] = useState<Language>(() => (storage.get('codeAssistant_lang') as Language) || 'Python');
  const [fileName, setFileName] = useState(() => storage.get('codeAssistant_fileName') || `main.${LANGUAGE_CONFIG.Python.extension}`);
  const [aiInput, setAiInput] = useState('');
  const [output, setOutput] = useState(() => storage.get('codeAssistant_output') || '');
  const [outputTime, setOutputTime] = useState(() => storage.get('codeAssistant_outputTime') || '');
  const [isLoading, setIsLoading] = useState(false);
  const [activeAction, setActiveAction] = useState<Action | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [outputHeight, setOutputHeight] = useState(() => {
    const saved = storage.get('codeAssistant_outputHeight');
    return saved ? parseInt(saved) : 280;
  });
  const [isDragging, setIsDragging] = useState(false);
  const outputRef = useRef<HTMLPreElement>(null);
  const dragStartY = useRef<number>(0);
  const dragStartHeight = useRef<number>(0);

  // Persist state to localStorage
  useEffect(() => { storage.set('codeAssistant_code', code); }, [code]);
  useEffect(() => { storage.set('codeAssistant_lang', lang); }, [lang]);
  useEffect(() => { storage.set('codeAssistant_fileName', fileName); }, [fileName]);
  useEffect(() => { storage.set('codeAssistant_output', output); }, [output]);
  useEffect(() => { storage.set('codeAssistant_outputTime', outputTime); }, [outputTime]);
  useEffect(() => { storage.set('codeAssistant_outputHeight', outputHeight.toString()); }, [outputHeight]);

  // Update filename extension and default code when language changes
  useEffect(() => {
    const config = LANGUAGE_CONFIG[lang];
    setFileName(prev => {
      const baseName = prev.replace(/\.[^.]+$/, '');
      return `${baseName}.${config.extension}`;
    });
    
    // If code is empty or matches old default, set new default
    if (!code.trim() || Object.values(LANGUAGE_CONFIG).some(c => code.trim() === c.defaultCode.trim())) {
      setCode(config.defaultCode);
    }
  }, [lang]);

  useEffect(() => {
    if (output) outputRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [output]);

  const newFile = () => {
    const config = LANGUAGE_CONFIG[lang];
    setCode(config.defaultCode);
    setOutput('');
    setError('');
    setOutputTime('');
    setAiInput('');
  };

  const insertSnippet = (snippet: { title: string; code: string }) => {
    const newCode = code + (code ? '\n\n' : '') + snippet.code;
    setCode(newCode);
  };
  // Drag functionality for resizing output panel
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    dragStartY.current = e.clientY;
    dragStartHeight.current = outputHeight;
    
    const handleMouseMove = (e: MouseEvent) => {
      const deltaY = dragStartY.current - e.clientY; // Inverted for intuitive dragging
      const newHeight = Math.max(150, Math.min(600, dragStartHeight.current + deltaY));
      setOutputHeight(newHeight);
    };
    
    const handleMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
    
    setIsDragging(true);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.body.style.cursor = 'ns-resize';
    document.body.style.userSelect = 'none';
  };

  // Update filename extension when language changes
  useEffect(() => {
    const extMap: Record<string, string> = {
      Python: 'py', JavaScript: 'js', TypeScript: 'ts', Java: 'java', 'C++': 'cpp',
    };
    const ext = extMap[lang] || 'txt';
    setFileName(prev => prev.replace(/\.[^.]+$/, `.${ext}`));
  }, [lang]);

  const runAction = async (action: Action, customMsg?: string) => {
    if (!isLoggedIn) {
      setError('Please log in to use Code Assistant.');
      return;
    }

    const msg = customMsg ?? aiInput.trim();

    if (!code.trim() && !msg) {
      setError('Please write some code or type a question first.');
      return;
    }

    setIsLoading(true);
    setActiveAction(action);
    setOutput('');
    setError('');

    try {
      const input = code.trim()
        ? `${msg || action + ' this code'}\n\nCode:\n${code}`
        : msg;

      const response = await getCodeAssistance(ACTION_MAP[action], input, lang.toLowerCase());
      const result = response?.result || response?.message || response?.output || 'No output received.';

      if (action === 'Generate') {
        const codeBlockMatch = result.match(/```(?:\w+)?\n([\s\S]*?)```/);
        if (codeBlockMatch) {
          setCode(codeBlockMatch[1].trim());
          const explanation = result.replace(/```(?:\w+)?\n[\s\S]*?```/g, '').trim();
          setOutput(explanation || '✅ Code generated and placed in the editor.');
        } else {
          const looksLikeCode =
            result.includes('def ') || result.includes('function ') ||
            result.includes('const ') || result.includes('class ') ||
            result.includes('import ') || result.includes('print(') ||
            result.includes('console.log') || result.includes('return ');
          if (looksLikeCode) {
            setCode(result.trim());
            setOutput('✅ Code generated and placed in the editor above.');
          } else {
            setOutput(result);
          }
        }
      } else if (action === 'Debug') {
        const codeBlockMatch = result.match(/```(?:\w+)?\n([\s\S]*?)```/);
        if (codeBlockMatch) {
          setCode(codeBlockMatch[1].trim());
          const explanation = result.replace(/```(?:\w+)?\n[\s\S]*?```/g, '').trim();
          setOutput(explanation || '✅ Code fixed and placed in the editor.');
        } else {
          setOutput(result);
        }
      } else {
        setOutput(result);
      }

      setOutputTime(getNow());
      setAiInput('');
    } catch (err: any) {
      const msg = err.message?.includes('401') || err.message?.includes('Invalid token')
        ? 'Authentication failed. Please log in again.'
        : err.message || 'Something went wrong. Please try again.';
      setError(msg);
      setOutputTime(getNow());
    } finally {
      setIsLoading(false);
      setActiveAction(null);
    }
  };

  const handleSend = () => {
    if (!aiInput.trim()) return;
    const lower = aiInput.toLowerCase();
    if (lower.includes('debug') || lower.includes('fix') || lower.includes('error') || lower.includes('bug'))
      runAction('Debug', aiInput);
    else if (lower.includes('review') || lower.includes('optimize') || lower.includes('improve') || lower.includes('refactor'))
      runAction('Review', aiInput);
    else if (lower.includes('generate') || lower.includes('create') || lower.includes('write') || lower.includes('build'))
      runAction('Generate', aiInput);
    else
      runAction('Explain', aiInput);
  };

  const copyOutput = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const clearAll = () => {
    setCode('');
    setOutput('');
    setError('');
    setOutputTime('');
    setAiInput('');
    storage.remove('codeAssistant_code');
    storage.remove('codeAssistant_output');
    storage.remove('codeAssistant_outputTime');
  };

  const lines = code.split('\n');
  const lineCount = Math.max(lines.length, 1);

  return (
    <div className="flex-1 flex flex-col bg-[#0f0f1e] h-screen overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-white/5 shrink-0">
        <h1 className="text-white text-lg font-bold flex items-center gap-2">
          <span className="text-blue-400">&lt;/&gt;</span> Code Assistant
        </h1>
        <div className="flex items-center gap-3">
          <div className="relative">
            <select
              value={lang}
              onChange={e => setLang(e.target.value as Language)}
              className="appearance-none bg-white/5 border border-white/10 rounded-xl pl-3 pr-8 py-1.5 text-gray-300 text-sm focus:outline-none cursor-pointer"
            >
              {LANGUAGES.map(l => (
                <option key={l} value={l}>{LANGUAGE_CONFIG[l].icon} {l}</option>
              ))}
            </select>
            <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Auth warning */}
      {!isLoggedIn && (
        <div className="mx-4 mt-3 flex items-center gap-2 bg-red-600/10 border border-red-500/30 rounded-xl px-4 py-2.5 shrink-0">
          <AlertCircle size={14} className="text-red-400 shrink-0" />
          <p className="text-red-400 text-xs">Please log in to use AI actions.</p>
        </div>
      )}

      {/* Error banner */}
      {error && (
        <div className="mx-4 mt-3 flex items-center gap-2 bg-red-600/10 border border-red-500/30 rounded-xl px-4 py-2.5 shrink-0">
          <AlertCircle size={14} className="text-red-400 shrink-0" />
          <p className="text-red-400 text-xs flex-1">{error}</p>
          <button onClick={() => setError('')} className="text-red-400 hover:text-white text-xs">✕</button>
        </div>
      )}

      {/* Main Layout */}
      <div className="flex-1 flex overflow-hidden mt-0">

        {/* Left: Editor + Output */}
        <div className="flex-1 flex flex-col overflow-hidden border-r border-white/5">

          {/* Editor Tab Bar */}
          <div className="flex items-center justify-between border-b border-white/5 bg-[#12122a] px-3 py-1.5 shrink-0">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 ${LANGUAGE_CONFIG[lang].color} rounded-full flex items-center justify-center text-xs`}>
                <span className="text-white text-xs">{LANGUAGE_CONFIG[lang].icon}</span>
              </div>
              <input
                value={fileName}
                onChange={e => setFileName(e.target.value)}
                className="text-white text-xs bg-transparent focus:outline-none w-32"
              />
              <span className="text-gray-500 text-xs">({lang})</span>
            </div>
            <div className="flex items-center gap-1">
              <button 
                onClick={newFile} 
                title="New File" 
                className="p-1.5 text-gray-500 hover:text-green-400 transition-colors"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="12" y1="18" x2="12" y2="12"/>
                  <line x1="9" y1="15" x2="15" y2="15"/>
                </svg>
              </button>
              <button onClick={() => navigator.clipboard.writeText(code)} title="Copy Code" className="p-1.5 text-gray-500 hover:text-white transition-colors"><Copy size={13} /></button>
              <button onClick={clearAll} title="Clear All" className="flex items-center gap-1 px-2 py-1 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors text-xs">
                <Trash2 size={13} /> Clear All
              </button>
            </div>
          </div>

          {/* Code Editor */}
          <div className="flex-1 overflow-auto bg-[#0d0d1a] font-mono text-sm">
            <div className="flex min-h-full">
              <div className="w-10 text-gray-700 text-right pr-3 pt-4 select-none shrink-0 leading-6">
                {Array.from({ length: lineCount }, (_, i) => (
                  <div key={i} className="leading-6">{i + 1}</div>
                ))}
              </div>
              <textarea
                value={code}
                onChange={e => setCode(e.target.value)}
                placeholder={`${LANGUAGE_CONFIG[lang].comment} Write your ${lang} code here...\n${LANGUAGE_CONFIG[lang].comment} Use the AI actions below to get help with your code`}
                className="flex-1 pt-4 pr-4 pb-4 bg-transparent text-gray-300 leading-6 focus:outline-none resize-none placeholder-gray-700 font-mono text-sm"
                spellCheck={false}
              />
            </div>
          </div>

          {/* AI Output Panel with Draggable Resizer */}
          <div className="border-t border-white/5 bg-[#0a0a16] flex flex-col" style={{ height: `${outputHeight}px` }}>
            {/* Draggable Resize Handle */}
            <div 
              className={`flex items-center justify-center h-3 bg-white/5 border-b border-white/5 cursor-ns-resize hover:bg-purple-500/20 transition-colors group select-none ${
                isDragging ? 'bg-purple-500/30' : ''
              }`}
              onMouseDown={handleMouseDown}
              title="Drag to resize output panel"
            >
              <div className="flex items-center gap-0.5">
                <div className="w-4 h-0.5 bg-gray-500 group-hover:bg-purple-400 transition-colors rounded-full" />
                <div className="w-4 h-0.5 bg-gray-500 group-hover:bg-purple-400 transition-colors rounded-full" />
                <div className="w-4 h-0.5 bg-gray-500 group-hover:bg-purple-400 transition-colors rounded-full" />
              </div>
            </div>
            
            <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 shrink-0">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-500" />
                <span className="text-white text-xs font-semibold">AI Output</span>
                {outputTime && <span className="text-gray-600 text-xs">{outputTime}</span>}
                <span className="text-gray-600 text-xs">({outputHeight}px)</span>
              </div>
              <div className="flex items-center gap-2">
                {isLoading && (
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                )}
                {output && (
                  <button onClick={copyOutput} className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors">
                    {copied ? <CheckCheck size={12} className="text-green-400" /> : <Copy size={12} />}
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                )}
                {output && (
                  <button onClick={() => setOutput('')} className="text-xs text-gray-500 hover:text-red-400 transition-colors">
                    <Trash2 size={12} />
                  </button>
                )}
                <button 
                  onClick={() => setOutputHeight(280)} 
                  className="text-xs text-gray-500 hover:text-purple-400 transition-colors"
                  title="Reset to default height"
                >
                  Reset
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-auto p-4">
              {!output && !isLoading && (
                <p className="text-gray-600 text-xs font-mono">AI response will appear here. Select an action or type a question below...</p>
              )}
              {isLoading && (
                <p className="text-purple-400 text-xs font-mono animate-pulse">
                  {activeAction ? `${activeAction}ing your code...` : 'Processing...'}
                </p>
              )}
              {output && !isLoading && (
                <pre ref={outputRef} className="text-gray-300 text-xs font-mono whitespace-pre-wrap leading-relaxed">{output}</pre>
              )}
            </div>
          </div>
        </div>

        {/* Right: Actions + Snippets */}
        <div className="w-64 flex flex-col shrink-0 overflow-hidden">

          {/* Quick Actions */}
          <div className="p-3 border-b border-white/5">
            <p className="text-gray-500 text-xs mb-2 uppercase tracking-wider">Quick Actions</p>
            <div className="grid grid-cols-2 gap-1.5">
              {ACTIONS.map(action => (
                <button
                  key={action}
                  onClick={() => runAction(action)}
                  disabled={isLoading || !isLoggedIn}
                  className={`py-2 px-3 rounded-lg text-xs font-semibold transition-all border disabled:opacity-40 disabled:cursor-not-allowed ${
                    activeAction === action
                      ? 'bg-purple-600 border-purple-500 text-white'
                      : 'bg-white/5 border-white/10 text-gray-300 hover:bg-purple-600/20 hover:border-purple-500/30 hover:text-white'
                  }`}
                >
                  {action === 'Explain' && '💡 '}
                  {action === 'Debug' && '🐛 '}
                  {action === 'Review' && '🔍 '}
                  {action === 'Generate' && '✨ '}
                  {action}
                </button>
              ))}
            </div>
          </div>

          {/* Ask AI Input */}
          <div className="p-3 border-b border-white/5">
            <p className="text-gray-500 text-xs mb-2 uppercase tracking-wider">Ask AI</p>
            <div className="flex gap-2">
              <input
                value={aiInput}
                onChange={e => setAiInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                placeholder="Ask anything about your code..."
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-gray-300 placeholder-gray-600 focus:outline-none focus:border-purple-500/50"
                disabled={isLoading || !isLoggedIn}
              />
              <button
                onClick={handleSend}
                disabled={!aiInput.trim() || isLoading || !isLoggedIn}
                className="w-8 h-8 bg-purple-600 hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl flex items-center justify-center transition-colors shrink-0"
              >
                <Send size={12} className="text-white" />
              </button>
            </div>
          </div>

          {/* Run & Explain */}
          <div className="p-3 border-b border-white/5">
            <button
              onClick={() => runAction('Explain', `Run through this ${lang} code step by step and explain what each part does and what the output would be`)}
              disabled={!code.trim() || isLoading || !isLoggedIn}
              className="w-full flex items-center justify-center gap-2 py-2 bg-green-600/20 hover:bg-green-600/30 border border-green-500/30 text-green-400 text-xs font-semibold rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Play size={12} /> Run & Explain
            </button>
          </div>

          {/* Code Snippets */}
          <div className="flex-1 overflow-y-auto p-3">
            <p className="text-gray-500 text-xs mb-2 uppercase tracking-wider">{lang} Snippets</p>
            <div className="space-y-1.5">
              {codeSnippets[lang].map((s, i) => (
                <div
                  key={i}
                  onClick={() => insertSnippet(s)}
                  className="flex items-center gap-2 bg-white/5 rounded-lg p-2 hover:bg-white/10 cursor-pointer group"
                >
                  <div className={`w-6 h-6 ${LANGUAGE_CONFIG[lang].color} rounded-md flex items-center justify-center text-white text-xs shrink-0`}>
                    {LANGUAGE_CONFIG[lang].icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-xs font-medium truncate">{s.title}</p>
                    <p className="text-gray-600 text-xs font-mono truncate">{s.code.split('\n')[0]}</p>
                  </div>
                  <button
                    onClick={e => { e.stopPropagation(); navigator.clipboard.writeText(s.code); }}
                    className="text-gray-600 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Copy size={11} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

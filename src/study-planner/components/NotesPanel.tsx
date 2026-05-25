import { useState, useEffect } from 'react';
import { FileText, Download, Sparkles, Copy, Check } from 'lucide-react';
import { StudyPlannerEngine } from '../engine/StudyPlannerEngine';

interface NotesPanelProps {
  topic: string;
  examMode?: boolean;
}

export default function NotesPanel({ topic, examMode = false }: NotesPanelProps) {
  const [notes, setNotes] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadNotes();
  }, [topic, examMode]);

  const loadNotes = async () => {
    try {
      setLoading(true);
      const notesContent = await StudyPlannerEngine.generateNotes(topic, examMode);
      setNotes(notesContent);
    } catch (error) {
      console.error('Failed to load notes:', error);
      setNotes('Failed to generate notes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(notes);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy notes:', error);
    }
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([notes], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${topic.replace(/\s+/g, '_')}_notes.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  if (loading) {
    return (
      <div className="bg-linear-to-br from-green-900/20 to-teal-900/20 backdrop-blur-sm border border-green-500/30 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <FileText size={20} className="text-green-400" />
          <h3 className="text-white font-semibold">
            {examMode ? 'Exam Notes' : 'Study Notes'}
          </h3>
          <Sparkles size={16} className="text-yellow-400 animate-pulse" />
        </div>
        <div className="animate-pulse space-y-3">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-4 bg-white/10 rounded w-full"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-linear-to-br from-green-900/20 to-teal-900/20 backdrop-blur-sm border border-green-500/30 rounded-2xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FileText size={20} className="text-green-400" />
          <h3 className="text-white font-semibold">
            {examMode ? 'Exam Notes' : 'Study Notes'} - {topic}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
            title="Copy to clipboard"
          >
            {copied ? (
              <Check size={16} className="text-green-400" />
            ) : (
              <Copy size={16} className="text-gray-400" />
            )}
          </button>
          <button
            onClick={handleDownload}
            className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
            title="Download notes"
          >
            <Download size={16} className="text-gray-400" />
          </button>
          <button
            onClick={loadNotes}
            className="p-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
            title="Regenerate notes"
          >
            <Sparkles size={16} className="text-white" />
          </button>
        </div>
      </div>

      {/* Notes Content */}
      <div className="bg-white/5 rounded-xl p-4 max-h-96 overflow-y-auto">
        <pre className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap font-sans">
          {notes}
        </pre>
      </div>

      {/* Mode Toggle */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <span>Mode:</span>
          <span className={`px-2 py-1 rounded text-xs font-medium ${
            examMode 
              ? 'bg-red-500/20 text-red-400' 
              : 'bg-blue-500/20 text-blue-400'
          }`}>
            {examMode ? 'Exam Focus' : 'Study Mode'}
          </span>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
        >
          Switch Mode
        </button>
      </div>
    </div>
  );
}
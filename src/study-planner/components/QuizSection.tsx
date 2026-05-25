import { useState, useEffect } from 'react';
import { Brain, CheckCircle, XCircle, RotateCcw, Trophy, Target } from 'lucide-react';
import { StudyPlannerEngine } from '../engine/StudyPlannerEngine';
import { QuizData } from '../types/index';
import { useStudyStore } from '../store/studyStore';

interface QuizSectionProps {
  topic: string;
  onComplete?: (score: number, results: any) => void;
}

export default function QuizSection({ topic, onComplete }: QuizSectionProps) {
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(true);
  const [quizStarted, setQuizStarted] = useState(false);
  const store = useStudyStore();

  useEffect(() => {
    loadQuiz();
  }, [topic]);

  const loadQuiz = async () => {
    try {
      setLoading(true);
      const quiz = await StudyPlannerEngine.generateQuiz(topic, 5);
      setQuizData(quiz);
    } catch (error) {
      console.error('Failed to load quiz:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (questionId: string, answer: string) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const calculateScore = () => {
    if (!quizData) return 0;
    
    let correct = 0;
    quizData.questions.forEach(question => {
      if (selectedAnswers[question.id] === question.correctAnswer) {
        correct++;
      }
    });
    
    return Math.round((correct / quizData.questions.length) * 100);
  };

  const handleSubmitQuiz = () => {
    const score = calculateScore();
    
    // Track in store
    store.setTopicScore(topic, score);
    store.addQuizAttempt({
      id: `quiz_${Date.now()}`,
      topic,
      score,
      totalQuestions: quizData?.questions.length || 0,
      correctAnswers: quizData?.questions.filter(q => selectedAnswers[q.id] === q.correctAnswer).length || 0,
      timestamp: new Date().toISOString(),
      answers: selectedAnswers,
    });
    
    setShowResults(true);
    
    if (onComplete) {
      onComplete(score, {
        topic,
        score,
        answers: selectedAnswers,
        questions: quizData?.questions || []
      });
    }
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setSelectedAnswers({});
    setShowResults(false);
    setQuizStarted(false);
    loadQuiz();
  };

  if (loading) {
    return (
      <div className="bg-linear-to-br from-blue-900/20 to-purple-900/20 backdrop-blur-sm border border-blue-500/30 rounded-2xl p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-white/10 rounded-lg w-3/4"></div>
          <div className="space-y-2">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-4 bg-white/10 rounded w-full"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!quizData) {
    return (
      <div className="bg-red-500/20 border border-red-500/50 rounded-2xl p-6 text-red-400">
        Failed to load quiz. Please try again.
        <button
          onClick={loadQuiz}
          className="ml-4 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white text-sm"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!quizStarted) {
    return (
      <div className="bg-linear-to-br from-blue-600/20 to-purple-600/20 backdrop-blur-sm border border-blue-500/30 rounded-2xl p-8 text-center">
        <Brain size={48} className="text-blue-400 mx-auto mb-4" />
        <h2 className="text-white text-2xl font-bold mb-2">Quiz: {topic}</h2>
        <p className="text-gray-300 mb-6">
          Test your knowledge with {quizData.questions.length} questions
        </p>
        <div className="flex items-center justify-center gap-6 mb-6 text-sm text-gray-400">
          <div className="flex items-center gap-2">
            <Target size={16} />
            <span>{quizData.questions.length} Questions</span>
          </div>
          <div className="flex items-center gap-2">
            <Trophy size={16} />
            <span>Pass: 70%</span>
          </div>
        </div>
        <button
          onClick={() => setQuizStarted(true)}
          className="bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-8 py-3 rounded-xl transition-all duration-200 transform hover:scale-105"
        >
          Start Quiz
        </button>
      </div>
    );
  }

  if (showResults) {
    const score = calculateScore();
    const passed = score >= 70;
    
    return (
      <div className="space-y-6">
        {/* Results Header */}
        <div className={`bg-linear-to-br ${
          passed ? 'from-green-600/20 to-emerald-600/20 border-green-500/30' : 'from-red-600/20 to-pink-600/20 border-red-500/30'
        } backdrop-blur-sm border rounded-2xl p-8 text-center`}>
          {passed ? (
            <Trophy size={48} className="text-green-400 mx-auto mb-4" />
          ) : (
            <Target size={48} className="text-red-400 mx-auto mb-4" />
          )}
          <h2 className="text-white text-2xl font-bold mb-2">
            {passed ? 'Congratulations!' : 'Keep Practicing!'}
          </h2>
          <div className="text-4xl font-bold mb-2">
            <span className={passed ? 'text-green-400' : 'text-red-400'}>{score}%</span>
          </div>
          <p className="text-gray-300">
            You got {quizData.questions.filter(q => selectedAnswers[q.id] === q.correctAnswer).length} out of {quizData.questions.length} questions correct
          </p>
        </div>

        {/* Question Review */}
        <div className="space-y-4">
          <h3 className="text-white font-semibold">Review Answers</h3>
          {quizData.questions.map((question, index) => {
            const userAnswer = selectedAnswers[question.id];
            const isCorrect = userAnswer === question.correctAnswer;
            
            return (
              <div key={question.id} className="bg-white/5 border border-white/10 rounded-xl p-4">
                <div className="flex items-start gap-3 mb-3">
                  {isCorrect ? (
                    <CheckCircle size={20} className="text-green-400 mt-0.5" />
                  ) : (
                    <XCircle size={20} className="text-red-400 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p className="text-white font-medium mb-2">
                      {index + 1}. {question.question}
                    </p>
                    <div className="space-y-1 text-sm">
                      <p className="text-gray-300">
                        Your answer: <span className={isCorrect ? 'text-green-400' : 'text-red-400'}>{userAnswer}</span>
                      </p>
                      {!isCorrect && (
                        <p className="text-gray-300">
                          Correct answer: <span className="text-green-400">{question.correctAnswer}</span>
                        </p>
                      )}
                      <p className="text-gray-400 mt-2">{question.explanation}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={resetQuiz}
            className="flex-1 bg-white/5 hover:bg-white/10 text-gray-300 py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <RotateCcw size={16} />
            Retake Quiz
          </button>
          <button
            onClick={() => {
              const score = calculateScore();
              onComplete?.(score, { topic, score, answers: selectedAnswers });
            }}
            className="flex-1 bg-linear-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-3 rounded-xl transition-all"
          >
            Continue Learning
          </button>
        </div>
      </div>
    );
  }

  const question = quizData.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / quizData.questions.length) * 100;

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="bg-white/5 rounded-full h-2 overflow-hidden">
        <div 
          className="bg-linear-to-r from-blue-500 to-purple-500 h-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Question */}
      <div className="bg-linear-to-br from-blue-900/20 to-purple-900/20 backdrop-blur-sm border border-blue-500/30 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-blue-400 text-sm font-medium">
            Question {currentQuestion + 1} of {quizData.questions.length}
          </span>
          <Brain size={20} className="text-purple-400" />
        </div>
        
        <h3 className="text-white text-lg font-semibold mb-6">
          {question.question}
        </h3>

        <div className="space-y-3">
          {question.options.map((option, index) => {
            const optionLetter = ['A', 'B', 'C', 'D'][index];
            const isSelected = selectedAnswers[question.id] === optionLetter;
            
            return (
              <button
                key={index}
                onClick={() => handleAnswerSelect(question.id, optionLetter)}
                className={`w-full text-left p-4 rounded-xl border transition-all ${
                  isSelected
                    ? 'bg-purple-600/20 border-purple-500 text-white'
                    : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:border-white/20'
                }`}
              >
                <span className="font-medium text-purple-400 mr-3">{optionLetter})</span>
                {option}
              </button>
            );
          })}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex gap-3">
        <button
          onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
          disabled={currentQuestion === 0}
          className="px-6 py-3 bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed text-gray-300 rounded-xl transition-colors"
        >
          Previous
        </button>
        
        <div className="flex-1" />
        
        {currentQuestion === quizData.questions.length - 1 ? (
          <button
            onClick={handleSubmitQuiz}
            disabled={Object.keys(selectedAnswers).length !== quizData.questions.length}
            className="px-6 py-3 bg-linear-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-all"
          >
            Submit Quiz
          </button>
        ) : (
          <button
            onClick={() => setCurrentQuestion(prev => Math.min(quizData.questions.length - 1, prev + 1))}
            disabled={!selectedAnswers[question.id]}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-colors"
          >
            Next
          </button>
        )}
      </div>
    </div>
  );
}
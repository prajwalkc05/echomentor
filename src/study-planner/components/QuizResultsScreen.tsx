import { CheckCircle, RotateCcw, ArrowRight, Trophy, Target, TrendingUp } from 'lucide-react';

interface QuizResultsScreenProps {
  score: number;
  topic: string;
  totalQuestions: number;
  correctAnswers: number;
  onRetakeQuiz: () => void;
  onContinueLearning: () => void;
}

export default function QuizResultsScreen({
  score,
  topic,
  totalQuestions,
  correctAnswers,
  onRetakeQuiz,
  onContinueLearning,
}: QuizResultsScreenProps) {
  const isPassed = score >= 70;
  const performanceLevel = score >= 90 ? 'Excellent' : score >= 80 ? 'Great' : score >= 70 ? 'Good' : 'Needs Improvement';
  const performanceColor = score >= 90 ? 'text-green-400' : score >= 80 ? 'text-blue-400' : score >= 70 ? 'text-yellow-400' : 'text-red-400';
  const performanceBg = score >= 90 ? 'from-green-600/20 to-green-900/20' : score >= 80 ? 'from-blue-600/20 to-blue-900/20' : score >= 70 ? 'from-yellow-600/20 to-yellow-900/20' : 'from-red-600/20 to-red-900/20';

  return (
    <div className="flex-1 bg-[#0f0f1e] overflow-y-auto flex items-center justify-center p-4 md:p-6">
      <div className="max-w-2xl w-full">
        {/* Results Card */}
        <div className={`bg-linear-to-br ${performanceBg} backdrop-blur-sm border border-white/10 rounded-3xl p-6 md:p-8 mb-6 md:mb-8`}>
          {/* Header */}
          <div className="text-center mb-6 md:mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-white/10 rounded-full flex items-center justify-center">
                {isPassed ? (
                  <CheckCircle size={40} className="text-green-400 md:w-12 md:h-12" />
                ) : (
                  <Target size={40} className="text-orange-400 md:w-12 md:h-12" />
                )}
              </div>
            </div>
            <h1 className="text-white text-2xl md:text-4xl font-bold mb-2">
              {isPassed ? 'Great Job! 🎉' : 'Keep Practicing! 💪'}
            </h1>
            <p className="text-gray-300 text-base md:text-lg">{topic}</p>
          </div>

          {/* Score Display */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 md:gap-4 mb-6 md:mb-8">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-3 sm:p-4 md:p-6 text-center">
              <div className="text-xl sm:text-2xl md:text-4xl font-bold text-white mb-1 md:mb-3">{score}%</div>
              <div className="text-gray-400 text-xs sm:text-xs md:text-sm">Your Score</div>
            </div>
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-3 sm:p-4 md:p-6 text-center">
              <div className="text-xl sm:text-2xl md:text-4xl font-bold text-blue-400 mb-1 md:mb-3">{correctAnswers}/{totalQuestions}</div>
              <div className="text-gray-400 text-xs sm:text-xs md:text-sm">Correct Answers</div>
            </div>
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-3 sm:p-4 md:p-6 text-center">
              <div className={`text-lg sm:text-xl md:text-2xl font-bold ${performanceColor} mb-1 md:mb-3`}>{performanceLevel}</div>
              <div className="text-gray-400 text-xs sm:text-xs md:text-sm">Performance</div>
            </div>
          </div>

          {/* Feedback */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-3 sm:p-4 md:p-6 mb-6 md:mb-8">
            <div className="flex items-start gap-2 sm:gap-3">
              <TrendingUp size={16} className={`${performanceColor} shrink-0 mt-1 sm:w-5 sm:h-5`} />
              <div className="min-w-0">
                <h3 className="text-white font-semibold mb-1 sm:mb-2 text-xs sm:text-sm md:text-base">Feedback</h3>
                <p className="text-gray-300 text-xs md:text-sm leading-relaxed">
                  {isPassed
                    ? `Excellent work! You've demonstrated a solid understanding of ${topic}. You can now mark this topic as completed and move on to the next one.`
                    : `You're making progress! Review the material and try again to improve your score. Focus on the areas where you struggled.`}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-4">
            <button
              onClick={onRetakeQuiz}
              className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 rounded-xl transition-all duration-200 text-xs sm:text-sm md:text-base whitespace-nowrap"
            >
              <RotateCcw size={16} className="sm:w-5 sm:h-5" />
              Retake Quiz
            </button>
            <button
              onClick={onContinueLearning}
              className="flex items-center justify-center gap-2 bg-linear-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg shadow-purple-500/25 text-xs sm:text-sm md:text-base whitespace-nowrap"
            >
              <ArrowRight size={16} className="sm:w-5 sm:h-5" />
              {isPassed ? 'Mark Complete' : 'Continue Learning'}
            </button>
          </div>
        </div>

        {/* Tips Section */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-3 sm:p-4 md:p-6">
          <h3 className="text-white font-semibold mb-3 flex items-center gap-2 text-xs sm:text-sm md:text-base">
            <Trophy size={16} className="text-yellow-400 shrink-0 sm:w-5 sm:h-5" />
            <span>Tips for Next Time</span>
          </h3>
          <ul className="space-y-1 sm:space-y-2 text-gray-300 text-xs md:text-sm">
            <li>✓ Review the material before taking the quiz</li>
            <li>✓ Take notes on key concepts</li>
            <li>✓ Practice similar problems multiple times</li>
            <li>✓ Don't rush through the questions</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

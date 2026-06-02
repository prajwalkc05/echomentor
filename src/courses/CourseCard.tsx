import { Star, Clock, Users, BookOpen, Bookmark, Plus, ExternalLink } from 'lucide-react';
import { AggregatedCourse } from '../services/courseAggregation.service';

interface CourseCardProps {
  course: AggregatedCourse;
  onStartLearning: (course: AggregatedCourse) => void;
  onSave: (course: AggregatedCourse) => void;
  onAddToPath: (course: AggregatedCourse) => void;
  isSaved?: boolean;
}

const platformConfig = {
  youtube: { icon: '▶️', color: 'from-red-600 to-red-700', label: 'YouTube' },
  'khan-academy': { icon: '🎓', color: 'from-blue-600 to-blue-700', label: 'Khan Academy' },
  freecodecamp: { icon: '💻', color: 'from-green-600 to-green-700', label: 'freeCodeCamp' },
  coursera: { icon: '📚', color: 'from-purple-600 to-purple-700', label: 'Coursera' },
  udemy: { icon: '🎯', color: 'from-orange-600 to-orange-700', label: 'Udemy' },
};

export default function CourseCard({
  course,
  onStartLearning,
  onSave,
  onAddToPath,
  isSaved = false,
}: CourseCardProps) {
  const config = platformConfig[course.platform];

  return (
    <div className="group relative h-full">
      {/* Gradient Glow Background */}
      <div className="absolute inset-0 bg-linear-to-r from-purple-600/20 to-blue-600/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Card Container */}
      <div className="relative h-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden hover:border-purple-500/50 transition-all duration-300 flex flex-col">
        {/* Thumbnail */}
        <div className={`relative h-40 bg-linear-to-br ${config.color} overflow-hidden`}>
          <div className="absolute inset-0 bg-linear-to-br from-white/10 to-transparent" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-5xl opacity-50">{config.icon}</span>
          </div>

          {/* Platform Badge */}
          <div className="absolute top-3 right-3 bg-black/40 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium text-white border border-white/20">
            {config.label}
          </div>

          {/* Free Badge */}
          {course.isFree && (
            <div className="absolute top-3 left-3 bg-green-500/80 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-white">
              FREE
            </div>
          )}

          {/* Certificate Badge */}
          {course.certificateAvailable && (
            <div className="absolute bottom-3 left-3 bg-yellow-500/80 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium text-white flex items-center gap-1">
              🏆 Certificate
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 p-4 flex flex-col">
          {/* Title */}
          <h3 className="text-white font-semibold text-sm mb-2 line-clamp-2 group-hover:text-purple-300 transition-colors">
            {course.title}
          </h3>

          {/* Instructor */}
          <p className="text-gray-400 text-xs mb-3">{course.instructor}</p>

          {/* Description */}
          <p className="text-gray-500 text-xs mb-3 line-clamp-2">{course.description}</p>

          {/* Skills Tags */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {course.skills.slice(0, 3).map(skill => (
              <span
                key={skill}
                className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded-full border border-purple-500/30 group-hover:border-purple-500/60 transition-colors"
              >
                {skill}
              </span>
            ))}
            {course.skills.length > 3 && (
              <span className="text-xs text-gray-400 px-2 py-1">+{course.skills.length - 3}</span>
            )}
          </div>

          {/* Difficulty & Duration */}
          <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
            <span className={`px-2 py-1 rounded-full font-medium ${
              course.difficulty === 'Beginner'
                ? 'bg-green-500/20 text-green-300'
                : course.difficulty === 'Intermediate'
                ? 'bg-yellow-500/20 text-yellow-300'
                : 'bg-red-500/20 text-red-300'
            }`}>
              {course.difficulty}
            </span>
            <span className="flex items-center gap-1">
              <Clock size={12} /> {course.duration}
            </span>
          </div>

          {/* Rating & Students */}
          <div className="flex items-center justify-between text-xs text-gray-400 mb-4 pb-4 border-b border-white/5">
            <span className="flex items-center gap-1">
              <Star size={12} className="text-yellow-400" /> {course.rating}
            </span>
            <span className="flex items-center gap-1">
              <Users size={12} /> {(course.students / 1000).toFixed(1)}K
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 mt-auto">
            <button
              onClick={() => onStartLearning(course)}
              className="flex-1 bg-linear-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white text-xs font-semibold py-2 rounded-lg transition-all duration-300 flex items-center justify-center gap-1 group/btn"
            >
              <BookOpen size={12} />
              Start
            </button>
            <button
              onClick={() => onSave(course)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-all duration-300 border ${
                isSaved
                  ? 'bg-purple-500/20 border-purple-500/50 text-purple-300'
                  : 'bg-white/5 border-white/10 text-gray-400 hover:border-purple-500/30'
              }`}
              title="Save course"
            >
              <Bookmark size={12} fill={isSaved ? 'currentColor' : 'none'} />
            </button>
            <button
              onClick={() => onAddToPath(course)}
              className="px-3 py-2 rounded-lg text-xs font-medium bg-white/5 border border-white/10 text-gray-400 hover:border-blue-500/30 transition-all duration-300"
              title="Add to learning path"
            >
              <Plus size={12} />
            </button>
          </div>

          {/* External Link */}
          <a
            href={course.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 text-center text-xs text-purple-400 hover:text-purple-300 transition-colors flex items-center justify-center gap-1"
          >
            View on {config.label} <ExternalLink size={10} />
          </a>
        </div>
      </div>
    </div>
  );
}

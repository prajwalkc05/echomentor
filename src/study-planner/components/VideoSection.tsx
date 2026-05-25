import { useState, useEffect } from 'react';
import { Play, ExternalLink, User, Calendar } from 'lucide-react';
import { StudyPlannerEngine } from '../engine/StudyPlannerEngine';
import { VideoRecommendation } from '../types/index';

interface VideoSectionProps {
  topic: string;
}

export default function VideoSection({ topic }: VideoSectionProps) {
  const [videos, setVideos] = useState<VideoRecommendation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVideos();
  }, [topic]);

  const loadVideos = async () => {
    try {
      setLoading(true);
      const videoData = await StudyPlannerEngine.getVideoRecommendations(topic);
      setVideos(videoData);
    } catch (error) {
      console.error('Failed to load videos:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="bg-linear-to-br from-red-900/20 to-pink-900/20 backdrop-blur-sm border border-red-500/30 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Play size={20} className="text-red-400" />
          <h3 className="text-white font-semibold">Video Tutorials</h3>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse flex gap-3">
              <div className="w-24 h-16 bg-white/10 rounded-lg"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-white/10 rounded w-3/4"></div>
                <div className="h-3 bg-white/10 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="bg-linear-to-br from-red-900/20 to-pink-900/20 backdrop-blur-sm border border-red-500/30 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Play size={20} className="text-red-400" />
          <h3 className="text-white font-semibold">Video Tutorials</h3>
        </div>
        <div className="text-center py-8">
          <Play size={48} className="text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">No videos found for this topic</p>
          <button
            onClick={loadVideos}
            className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-linear-to-br from-red-900/20 to-pink-900/20 backdrop-blur-sm border border-red-500/30 rounded-2xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Play size={20} className="text-red-400" />
          <h3 className="text-white font-semibold">Video Tutorials - {topic}</h3>
        </div>
        <span className="text-xs text-gray-400 bg-white/5 px-2 py-1 rounded">
          {videos.length} videos
        </span>
      </div>

      {/* Video Grid */}
      <div className="grid gap-4">
        {videos.map((video, index) => (
          <a
            key={index}
            href={video.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex gap-4 p-4 bg-white/5 hover:bg-white/10 rounded-xl transition-all duration-200 hover:scale-[1.02]"
          >
            {/* Thumbnail */}
            <div className="relative w-32 h-20 bg-red-600/20 rounded-lg overflow-hidden shrink-0">
              {video.thumbnail && !video.thumbnail.includes('video-placeholder') ? (
                <img 
                  src={video.thumbnail} 
                  alt={video.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.nextElementSibling?.classList.remove('hidden');
                  }}
                />
              ) : null}
              
              {/* Fallback Play Icon */}
              <div className={`w-full h-full flex items-center justify-center ${
                video.thumbnail && !video.thumbnail.includes('video-placeholder') ? 'hidden' : ''
              }`}>
                <Play size={24} className="text-red-400" />
              </div>
              
              {/* Play Overlay */}
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                  <Play size={16} className="text-white ml-0.5" />
                </div>
              </div>
            </div>

            {/* Video Info */}
            <div className="flex-1 min-w-0">
              <h4 className="text-white font-medium text-sm leading-snug mb-2 group-hover:text-red-300 transition-colors line-clamp-2">
                {video.title.length > 60 ? `${video.title.substring(0, 60)}...` : video.title}
              </h4>
              
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <User size={12} />
                  <span className="truncate">{video.channel}</span>
                </div>
                
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <Calendar size={12} />
                  <span>{formatDate(video.publishedAt)}</span>
                </div>
              </div>
            </div>

            {/* External Link Icon */}
            <div className="flex items-center">
              <ExternalLink size={16} className="text-gray-400 group-hover:text-red-400 transition-colors" />
            </div>
          </a>
        ))}
      </div>

      {/* View More Button */}
      <div className="mt-6 text-center">
        <a
          href={`https://www.youtube.com/results?search_query=${encodeURIComponent(topic + ' tutorial')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <Play size={16} />
          View More on YouTube
          <ExternalLink size={14} />
        </a>
      </div>
    </div>
  );
}
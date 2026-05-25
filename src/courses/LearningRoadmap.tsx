import { CheckCircle, Circle, Lock } from 'lucide-react';

interface RoadmapNode {
  id: string;
  title: string;
  description: string;
  status: 'completed' | 'current' | 'locked';
  skills: string[];
  estimatedHours: number;
}

interface LearningRoadmapProps {
  careerGoal: string;
  nodes: RoadmapNode[];
  onNodeClick: (nodeId: string) => void;
}

export default function LearningRoadmap({ careerGoal, nodes, onNodeClick }: LearningRoadmapProps) {
  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-white text-2xl font-bold mb-2">{careerGoal} Roadmap</h2>
        <p className="text-gray-400">Your personalized learning path to mastery</p>
      </div>

      {/* Roadmap Container */}
      <div className="relative">
        {/* Vertical Line */}
        <div className="absolute left-8 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-600 via-blue-600 to-purple-600 opacity-30" />

        {/* Nodes */}
        <div className="space-y-8">
          {nodes.map((node, index) => (
            <div key={node.id} className="relative pl-24">
              {/* Node Circle */}
              <div
                onClick={() => onNodeClick(node.id)}
                className="absolute left-0 top-0 cursor-pointer transition-all duration-300"
              >
                {node.status === 'completed' && (
                  <div className="relative">
                    <div className="absolute inset-0 bg-green-500 rounded-full blur-lg opacity-50 animate-pulse" />
                    <CheckCircle size={40} className="text-green-400 relative z-10" />
                  </div>
                )}
                {node.status === 'current' && (
                  <div className="relative">
                    <div className="absolute inset-0 bg-purple-500 rounded-full blur-lg opacity-50 animate-pulse" />
                    <Circle size={40} className="text-purple-400 relative z-10 fill-purple-400/20" />
                  </div>
                )}
                {node.status === 'locked' && (
                  <div className="relative">
                    <div className="absolute inset-0 bg-gray-500 rounded-full blur-lg opacity-30" />
                    <Lock size={40} className="text-gray-500 relative z-10" />
                  </div>
                )}
              </div>

              {/* Node Card */}
              <div
                onClick={() => onNodeClick(node.id)}
                className={`p-4 rounded-2xl border transition-all duration-300 cursor-pointer group ${
                  node.status === 'completed'
                    ? 'bg-green-600/10 border-green-500/30 hover:border-green-500/60'
                    : node.status === 'current'
                    ? 'bg-purple-600/20 border-purple-500/50 hover:border-purple-500/80 shadow-lg shadow-purple-500/20'
                    : 'bg-gray-600/10 border-gray-500/20 opacity-60'
                }`}
              >
                {/* Status Badge */}
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-white font-semibold text-lg">{node.title}</h3>
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-medium ${
                      node.status === 'completed'
                        ? 'bg-green-500/20 text-green-300'
                        : node.status === 'current'
                        ? 'bg-purple-500/20 text-purple-300'
                        : 'bg-gray-500/20 text-gray-400'
                    }`}
                  >
                    {node.status === 'completed' && '✓ Completed'}
                    {node.status === 'current' && '→ In Progress'}
                    {node.status === 'locked' && '🔒 Locked'}
                  </span>
                </div>

                {/* Description */}
                <p className="text-gray-400 text-sm mb-3">{node.description}</p>

                {/* Skills */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {node.skills.map(skill => (
                    <span
                      key={skill}
                      className="text-xs bg-white/5 text-gray-300 px-2 py-1 rounded-full border border-white/10 group-hover:border-purple-500/30 transition-colors"
                    >
                      {skill}
                    </span>
                  ))}
                </div>

                {/* Duration */}
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>⏱️ {node.estimatedHours} hours</span>
                  {node.status === 'current' && (
                    <button className="text-purple-400 hover:text-purple-300 font-medium transition-colors">
                      Start Learning →
                    </button>
                  )}
                </div>
              </div>

              {/* Connector Arrow */}
              {index < nodes.length - 1 && (
                <div className="absolute left-8 top-full mt-2 h-6 flex items-center justify-center">
                  <div className="text-purple-500/50 text-xl">↓</div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Progress Summary */}
      <div className="mt-12 p-6 bg-linear-to-r from-purple-900/20 to-blue-900/20 border border-purple-500/30 rounded-2xl">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-green-400">
              {nodes.filter(n => n.status === 'completed').length}
            </p>
            <p className="text-gray-400 text-sm">Completed</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-400">
              {nodes.filter(n => n.status === 'current').length}
            </p>
            <p className="text-gray-400 text-sm">In Progress</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-400">
              {nodes.filter(n => n.status === 'locked').length}
            </p>
            <p className="text-gray-400 text-sm">Remaining</p>
          </div>
        </div>
      </div>
    </div>
  );
}

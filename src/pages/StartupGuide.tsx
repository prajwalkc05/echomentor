import { useState } from 'react';
import { Rocket, Lightbulb, CheckCircle, Code, Map, DollarSign, Sparkles } from 'lucide-react';
import StartupHub from '../startup-guide/StartupHub';
import IdeaLab from '../startup-guide/IdeaLab';
import ValidationCenter from '../startup-guide/ValidationCenter';
import MVPBuilder from '../startup-guide/MVPBuilder';
import RoadmapStudio from '../startup-guide/RoadmapStudio';
import FundingAssistant from '../startup-guide/FundingAssistant';
import AICofounder from '../startup-guide/AICofounder';

type Module = 'hub' | 'idea' | 'validation' | 'mvp' | 'roadmap' | 'funding' | 'cofounder';

export default function StartupGuide() {
  const [activeModule, setActiveModule] = useState<Module>('hub');
  const [moduleData, setModuleData] = useState<any>(null);

  const handleNavigate = (module: string, data?: any) => {
    console.log('🚀 StartupGuide: handleNavigate called');
    console.log('  - Target module:', module);
    console.log('  - Data received:', data);
    console.log('  - Ideas count:', data?.ideas?.length || 0);
    
    setActiveModule(module as Module);
    if (data !== undefined) {
      setModuleData(data);
      console.log('✅ StartupGuide: moduleData updated');
    }
  };

  const modules = [
    { id: 'hub' as Module, name: 'Startup Hub', icon: Rocket },
    { id: 'idea' as Module, name: 'Idea Lab', icon: Lightbulb },
    { id: 'validation' as Module, name: 'Validation Center', icon: CheckCircle },
    { id: 'mvp' as Module, name: 'MVP Builder', icon: Code },
    { id: 'roadmap' as Module, name: 'Roadmap Studio', icon: Map },
    { id: 'funding' as Module, name: 'Funding Assistant', icon: DollarSign },
    { id: 'cofounder' as Module, name: 'AI Cofounder', icon: Sparkles },
  ];

  const renderModule = () => {
    const key = `${activeModule}-${moduleData ? JSON.stringify(moduleData).substring(0, 50) : 'empty'}`;
    switch (activeModule) {
      case 'hub': return <StartupHub key={key} onNavigate={handleNavigate} />;
      case 'idea': return <IdeaLab key={key} onNavigate={handleNavigate} initialData={moduleData} />;
      case 'validation': return <ValidationCenter key={key} initialData={moduleData} />;
      case 'mvp': return <MVPBuilder key={key} initialData={moduleData} />;
      case 'roadmap': return <RoadmapStudio key={key} initialData={moduleData} />;
      case 'funding': return <FundingAssistant key={key} initialData={moduleData} />;
      case 'cofounder': return <AICofounder key={key} />;
      default: return <StartupHub key={key} onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0f1e] text-white">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 min-h-screen bg-linear-to-b from-[#1a1a2e] to-[#16162a] border-r border-white/5 p-4">
          <div className="mb-8">
            <h2 className="text-xl font-bold bg-linear-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Startup Guide
            </h2>
            <p className="text-xs text-gray-400 mt-1">AI-Powered Incubator</p>
          </div>
          
          <nav className="space-y-2">
            {modules.map((module) => {
              const Icon = module.icon;
              return (
                <button
                  key={module.id}
                  onClick={() => {
                    setActiveModule(module.id);
                    // Don't clear moduleData when clicking sidebar
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    activeModule === module.id
                      ? 'bg-linear-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30'
                      : 'hover:bg-white/5'
                  }`}
                >
                  <Icon size={18} className={activeModule === module.id ? 'text-purple-400' : 'text-gray-400'} />
                  <span className={`text-sm ${activeModule === module.id ? 'text-white font-medium' : 'text-gray-400'}`}>
                    {module.name}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto h-screen">
          {renderModule()}
        </div>
      </div>
    </div>
  );
}

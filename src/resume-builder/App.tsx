import React, { useState, useEffect } from "react";
import { ResumeData, TemplateId } from "./types/resume";
import { defaultResumeData } from "./data/defaultData";
import { saveToLocalStorage, loadFromLocalStorage } from "./utils/helpers";
import ResumeForm from "./components/ResumeForm";
import Template1 from "./templates/Template1";
import Template2 from "./templates/Template2";
import Template3 from "./templates/Template3";
import Template4 from "./templates/Template4";
import { useAppData } from '../context';
import { useUser } from '../context';

const templateNames: Record<TemplateId, string> = {
  1: "Classic Dark",
  2: "Warm Beige",
  3: "Minimal Clean",
  4: "Modern Teal",
};

const templateColors: Record<TemplateId, string> = {
  1: "#2d2d2d",
  2: "#b8935a",
  3: "#4a5568",
  4: "#2d5f6e",
};

const emptyResumeData: ResumeData = {
  firstName: "",
  lastName: "",
  jobTitle: "",
  phone: "",
  email: "",
  website: "",
  address: "",
  about: "",
  photo: "",
  workExperience: [],
  education: [],
  skills: [],
  languages: [],
  references: [],
  professionalSkills: [],
  personalSkills: [],
  achievements: [],
};

const App: React.FC = () => {
  const { createManualResume, fetchResumes, resumes } = useAppData();
  const { isLoggedIn } = useUser();
  const [data, setData] = useState<ResumeData>(emptyResumeData);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateId>(1);
  const [showAIGenerator, setShowAIGenerator] = useState(false);
  const [showSavedResumes, setShowSavedResumes] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  // Load saved data on mount
  useEffect(() => {
    const savedData = loadFromLocalStorage();
    if (savedData) {
      setData(savedData);
    }
  }, []);

  // Auto-save data when it changes (debounced)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (data.firstName || data.lastName || data.email || data.phone) {
        saveToLocalStorage(data);
      }
    }, 1000); // Save after 1 second of no changes

    return () => clearTimeout(timeoutId);
  }, [data]);

  useEffect(() => {
    if (isLoggedIn) fetchResumes();
  }, [isLoggedIn]);

  const showToast = (type: 'success' | 'error', msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  const handlePrint = () => window.print();

  const handleSaveResume = async () => {
    if (!isLoggedIn) { showToast('error', 'Please log in to save your resume.'); return; }
    setSaving(true);
    try {
      await createManualResume({
        title: `${data.firstName || 'My'} ${data.lastName || 'Resume'}`.trim(),
        content: data,
        template: selectedTemplate,
      });
      showToast('success', 'Resume saved successfully!');
    } catch (error: any) {
      showToast('error', error.message || 'Failed to save resume. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const mapToResumeData = (raw: any): ResumeData => {
    const normalizeList = (val: any): string[] => {
      if (!val) return [];
      if (Array.isArray(val)) return val.map((v: any) => typeof v === 'string' ? v : v.name || v.skill || v.language || String(v)).filter(Boolean);
      if (typeof val === 'string') return val.split(/[,\n]/).map((s: string) => s.trim()).filter(Boolean);
      return [];
    };

    const normalizeBullets = (val: any): string[] => {
      if (!val) return [];
      if (Array.isArray(val)) return val.map((v: any) => typeof v === 'string' ? v : String(v)).filter(Boolean);
      if (typeof val === 'string') return val.split('\n').map((s: string) => s.trim()).filter(Boolean);
      return [];
    };

    let firstName = raw.firstName || raw.first_name || '';
    let lastName = raw.lastName || raw.last_name || '';
    if (!firstName && raw.name) {
      const parts = (raw.name as string).trim().split(' ');
      firstName = parts[0] || '';
      lastName = parts.slice(1).join(' ') || '';
    }

    const workExperience = (raw.workExperience || raw.work_experience || raw.experience || raw.jobs || []).map((e: any) => ({
      company: e.company || e.employer || e.organization || '',
      role: e.role || e.title || e.position || e.jobTitle || '',
      startYear: e.startYear || e.start_year || e.startDate || e.from || '',
      endYear: e.endYear || e.end_year || e.endDate || e.to || 'Present',
      bullets: normalizeBullets(e.bullets || e.responsibilities || e.description || e.duties || []),
    }));

    const education = (raw.education || raw.educations || []).map((e: any) => ({
      institution: e.institution || e.school || e.university || e.college || '',
      degree: e.degree || e.qualification || e.course || '',
      startYear: e.startYear || e.start_year || e.from || '',
      endYear: e.endYear || e.end_year || e.to || '',
    }));

    const references = (raw.references || []).map((r: any) => ({
      name: r.name || '',
      company: r.company || r.organization || '',
      phone: r.phone || '',
      email: r.email || '',
    }));

    const achievements = (raw.achievements || raw.awards || []).map((a: any) => ({
      award: a.award || a.name || '',
      title: a.title || '',
      description: a.description || '',
    }));

    return {
      firstName,
      lastName,
      jobTitle: raw.jobTitle || raw.job_title || raw.title || raw.position || '',
      phone: raw.phone || raw.phoneNumber || raw.mobile || '',
      email: raw.email || raw.emailAddress || '',
      website: raw.website || raw.portfolio || raw.linkedin || '',
      address: raw.address || raw.location || raw.city || '',
      about: raw.about || raw.summary || raw.bio || raw.objective || raw.profile || '',
      photo: raw.photo || '',
      workExperience,
      education,
      skills: normalizeList(raw.skills),
      languages: normalizeList(raw.languages),
      professionalSkills: normalizeList(raw.professionalSkills || raw.professional_skills || raw.technicalSkills || raw.technical_skills),
      personalSkills: normalizeList(raw.personalSkills || raw.personal_skills || raw.softSkills || raw.soft_skills),
      references,
      achievements,
    };
  };

  const handleGenerateAI = async () => {
    if (!aiPrompt.trim()) return;
    if (!isLoggedIn) { showToast('error', 'Please log in to use AI generation.'); return; }
    setGenerating(true);
    try {
      const structuredPrompt = `Generate a professional resume in valid JSON format for the following person. Return ONLY a JSON object with these exact fields, no extra text:
{
  "firstName": "",
  "lastName": "",
  "jobTitle": "",
  "email": "",
  "phone": "",
  "address": "",
  "website": "",
  "about": "",
  "workExperience": [{"company": "", "role": "", "startYear": "", "endYear": "", "bullets": [""]}],
  "education": [{"institution": "", "degree": "", "startYear": "", "endYear": ""}],
  "skills": [""],
  "languages": [""],
  "professionalSkills": [""],
  "personalSkills": [""],
  "references": [{"name": "", "company": "", "phone": "", "email": ""}],
  "achievements": [{"award": "", "title": "", "description": ""}]
}

Person details: ${aiPrompt}`;

      // Use AI chat to generate the resume JSON
      const token = localStorage.getItem('authToken');
      const response = await fetch('https://echobackend-dexy.onrender.com/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ message: structuredPrompt }),
      });
      const result = await response.json();
      const text = result.reply || result.message || result.response || result.text || result.answer || '';
      
      // Extract JSON from the response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('AI did not return valid JSON. Please try again.');
      
      const raw = JSON.parse(jsonMatch[0]);
      const safe: ResumeData = {
        ...emptyResumeData,
        ...mapToResumeData(raw),
      };
      // Final array safety
      (['skills','languages','professionalSkills','personalSkills','workExperience','education','references','achievements'] as const).forEach(key => {
        if (!Array.isArray(safe[key])) (safe as any)[key] = [];
      });
      safe.workExperience = safe.workExperience.map(e => ({ ...e, bullets: Array.isArray(e.bullets) ? e.bullets : [] }));
      
      setData(safe);
      showToast('success', 'Resume generated! Review and edit the fields on the left.');
      setShowAIGenerator(false);
      setAiPrompt('');
    } catch (error: any) {
      showToast('error', error.message || 'Failed to generate resume. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const loadSavedResume = (resume: any) => {
    const raw = resume.content || resume.data || resume;
    if (raw && typeof raw === 'object') {
      setData(mapToResumeData(raw));
      if (resume.template) setSelectedTemplate(resume.template as TemplateId);
      showToast('success', 'Resume loaded!');
    }
    setShowSavedResumes(false);
  };

  const renderTemplate = () => {
    switch (selectedTemplate) {
      case 1: return <Template1 data={data} />;
      case 2: return <Template2 data={data} />;
      case 3: return <Template3 data={data} />;
      case 4: return <Template4 data={data} />;
      default: return <Template1 data={data} />;
    }
  };

  return (
    <>
      <style>{`
        @media print {
          @page { size: A4; margin: 0; }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          body * { visibility: hidden; }
          #resume-print-area, #resume-print-area * { visibility: visible; }
          #resume-print-area { position: absolute; left: 0; top: 0; width: 210mm; height: 297mm; }
        }
      `}</style>

      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-200 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium ${
          toast.type === 'success' ? 'bg-green-600/90 text-white' : 'bg-red-600/90 text-white'
        }`}>
          {toast.type === 'success' ? '✅' : '❌'} {toast.msg}
        </div>
      )}

      <div className="flex h-screen bg-[#0f0f1e] overflow-hidden">
        {/* Left Panel - Form */}
        <div className="shrink-0 bg-[#1a1a2e] border-r border-white/5 flex flex-col overflow-hidden" style={{ width: "360px" }}>
          <div className="px-5 py-4 border-b border-white/5 shrink-0" style={{ backgroundColor: "#7c3aed" }}>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">📄</span>
              <h1 className="text-lg font-black text-white tracking-wide">Resume Builder</h1>
            </div>
            <p className="text-xs text-white/70">
              Template: <span className="font-semibold text-white">{templateNames[selectedTemplate]}</span>
            </p>
          </div>
          <div className="flex-1 overflow-hidden px-4 pt-4">
            <ResumeForm
              data={data}
              setData={setData}
              selectedTemplate={selectedTemplate}
              setSelectedTemplate={setSelectedTemplate}
            />
          </div>
        </div>

        {/* Right Panel - Preview */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Preview Header */}
          <div className="bg-[#1a1a2e] border-b border-white/5 px-6 py-3 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-gray-400">Preview</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold" style={{ backgroundColor: templateColors[selectedTemplate], color: "white" }}>
                {templateNames[selectedTemplate]}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowAIGenerator(!showAIGenerator)}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-purple-600 hover:bg-purple-700 rounded-lg text-white font-semibold transition"
              >
                🤖 Generate with AI
              </button>
              {isLoggedIn && resumes.length > 0 && (
                <button
                  onClick={() => setShowSavedResumes(!showSavedResumes)}
                  className="text-xs px-3 py-1.5 border border-white/10 rounded-lg hover:bg-white/5 text-gray-400 transition"
                >
                  📂 Saved ({resumes.length})
                </button>
              )}
              <button
                onClick={handleSaveResume}
                disabled={saving}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 border border-white/10 rounded-lg hover:bg-white/5 text-gray-400 transition disabled:opacity-50"
              >
                {saving ? '⏳ Saving...' : '💾 Save Resume'}
              </button>
              <button
                onClick={() => setData(defaultResumeData)}
                className="text-xs px-3 py-1.5 border border-white/10 rounded-lg hover:bg-white/5 text-gray-400 transition"
              >
                Reset to Demo
              </button>
              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 text-xs px-4 py-1.5 rounded-lg text-white font-semibold transition shadow-sm hover:opacity-90"
                style={{ backgroundColor: "#7c3aed" }}
              >
                🖨️ Print / Save PDF
              </button>
            </div>
          </div>

          {/* Preview Area */}
          <div className="flex-1 overflow-auto flex justify-center" style={{ backgroundColor: "#0f0f1e", padding: "24px" }}>
            <div id="resume-print-container" style={{ width: "794px", minWidth: "794px", backgroundColor: "white", boxShadow: "0 4px 24px rgba(0,0,0,0.4)", borderRadius: "2px" }}>
              <div id="resume-print-area">{renderTemplate()}</div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Generator Modal */}
      {showAIGenerator && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-100">
          <div className="bg-[#1a1a2e] border border-purple-500/30 rounded-2xl p-6 w-[460px] mx-4">
            <h3 className="text-white font-semibold mb-1 flex items-center gap-2">🤖 Generate Resume with AI</h3>
            <p className="text-gray-400 text-sm mb-1">Describe yourself and the AI will fill your resume.</p>
            <p className="text-gray-600 text-xs mb-3">Include: your name, job title, skills, work experience, education, and target role.</p>
            <textarea
              value={aiPrompt}
              onChange={e => setAiPrompt(e.target.value)}
              placeholder="e.g. I'm John Doe, a software engineer with 3 years of experience in React and Node.js. I worked at Google and Amazon. I have a B.Tech in Computer Science from MIT. I'm looking for a senior frontend developer role."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-gray-300 text-sm placeholder-gray-600 focus:outline-none focus:border-purple-500/50 resize-none h-32 mb-4"
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={handleGenerateAI}
                disabled={!aiPrompt.trim() || generating}
                className="flex-1 flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
              >
                {generating ? (
                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Generating...</>
                ) : (
                  <>🤖 Generate Resume</>
                )}
              </button>
              <button
                onClick={() => { setShowAIGenerator(false); setAiPrompt(''); }}
                className="bg-white/5 hover:bg-white/10 text-gray-400 text-sm px-4 py-2.5 rounded-xl transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Saved Resumes Modal */}
      {showSavedResumes && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-100">
          <div className="bg-[#1a1a2e] border border-white/10 rounded-2xl p-6 w-[480px] mx-4 max-h-[70vh] flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold">📂 Saved Resumes</h3>
              <button onClick={() => setShowSavedResumes(false)} className="text-gray-500 hover:text-white text-lg">✕</button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-2">
              {resumes.map((resume, i) => (
                <div key={resume._id || i} className="flex items-center justify-between bg-white/5 rounded-xl px-4 py-3 hover:bg-white/10 transition-colors">
                  <div>
                    <p className="text-white text-sm font-medium">{resume.title || 'Untitled Resume'}</p>
                    <p className="text-gray-500 text-xs">{resume.createdAt ? new Date(resume.createdAt).toLocaleDateString() : ''} · {resume.type === 'ai' ? '🤖 AI Generated' : '✏️ Manual'}</p>
                  </div>
                  <button
                    onClick={() => loadSavedResume(resume)}
                    className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
                  >
                    Load
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Template Quick Switcher */}
      <div className="fixed bottom-5 right-5 flex gap-2 bg-[#1a1a2e] rounded-full px-4 py-2 shadow-xl border border-white/10" style={{ zIndex: 100 }}>
        {([1, 2, 3, 4] as TemplateId[]).map((id) => (
          <button
            key={id}
            onClick={() => setSelectedTemplate(id)}
            title={templateNames[id]}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
              selectedTemplate === id ? "text-white shadow-sm scale-105" : "text-gray-400 hover:bg-white/5"
            }`}
            style={selectedTemplate === id ? { backgroundColor: templateColors[id] } : {}}
          >
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: templateColors[id] }} />
            {templateNames[id]}
          </button>
        ))}
      </div>
    </>
  );
};

export default App;

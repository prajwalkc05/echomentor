import React, { useRef } from "react";
import { ResumeData, TemplateId } from "../types/resume";
import FormSection from "./FormSection";

interface Props {
  data: ResumeData;
  setData: React.Dispatch<React.SetStateAction<ResumeData>>;
  selectedTemplate: TemplateId;
  setSelectedTemplate: (t: TemplateId) => void;
}

const inputClass =
  "w-full border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-[#0f0f1e] text-white placeholder-gray-500";

const labelClass = "block text-xs font-semibold text-gray-400 mb-1";

const templates = [
  { id: 1 as TemplateId, name: "Classic Dark", color: "#2d2d2d" },
  { id: 2 as TemplateId, name: "Warm Beige", color: "#b8935a" },
  { id: 3 as TemplateId, name: "Minimal Clean", color: "#4a5568" },
  { id: 4 as TemplateId, name: "Modern Teal", color: "#2d5f6e" },
];

const ResumeForm: React.FC<Props> = ({ data, setData, selectedTemplate, setSelectedTemplate }) => {
  const fileRef = useRef<HTMLInputElement>(null);

  const update = (field: keyof ResumeData, value: unknown) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      update("photo", ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Work Experience
  const updateExp = (i: number, field: string, value: string) => {
    const exps = [...data.workExperience];
    exps[i] = { ...exps[i], [field]: value };
    update("workExperience", exps);
  };

  const updateExpBullet = (i: number, j: number, value: string) => {
    const exps = [...data.workExperience];
    const bullets = [...(exps[i].bullets || [])];
    bullets[j] = value;
    exps[i] = { ...exps[i], bullets };
    update("workExperience", exps);
  };

  const addExpBullet = (i: number) => {
    const exps = [...data.workExperience];
    exps[i] = { ...exps[i], bullets: [...(exps[i].bullets || []), ""] };
    update("workExperience", exps);
  };

  const removeExpBullet = (i: number, j: number) => {
    const exps = [...data.workExperience];
    const bullets = (exps[i].bullets || []).filter((_, idx) => idx !== j);
    exps[i] = { ...exps[i], bullets };
    update("workExperience", exps);
  };

  const addExp = () => {
    update("workExperience", [
      ...data.workExperience,
      { company: "", role: "", startYear: "", endYear: "", bullets: [""] },
    ]);
  };

  const removeExp = (i: number) => {
    update("workExperience", (data.workExperience || []).filter((_, idx) => idx !== i));
  };

  // Education
  const updateEdu = (i: number, field: string, value: string) => {
    const edus = [...(data.education || [])];
    edus[i] = { ...edus[i], [field]: value };
    update("education", edus);
  };

  const addEdu = () => {
    update("education", [...(data.education || []), { institution: "", degree: "", startYear: "", endYear: "" }]);
  };

  const removeEdu = (i: number) => {
    update("education", (data.education || []).filter((_, idx) => idx !== i));
  };

  // References
  const updateRef = (i: number, field: string, value: string) => {
    const refs = [...(data.references || [])];
    refs[i] = { ...refs[i], [field]: value };
    update("references", refs);
  };

  const addRef = () => {
    update("references", [...(data.references || []), { name: "", company: "", phone: "", email: "" }]);
  };

  const removeRef = (i: number) => {
    update("references", (data.references || []).filter((_, idx) => idx !== i));
  };

  // Skills list handler
  const handleListChange = (field: "skills" | "languages" | "professionalSkills" | "personalSkills", value: string) => {
    update(field, value.split("\n").map(s => s.trim()).filter(Boolean));
  };

  // Achievements
  const updateAch = (i: number, field: string, value: string) => {
    const achs = [...data.achievements];
    achs[i] = { ...achs[i], [field]: value };
    update("achievements", achs);
  };

  const addAch = () => {
    update("achievements", [...data.achievements, { award: "", title: "", description: "" }]);
  };

  const removeAch = (i: number) => {
    update("achievements", (data.achievements || []).filter((_, idx) => idx !== i));
  };

  return (
    <div className="h-full overflow-y-auto" style={{ paddingBottom: "40px" }}>
      {/* Template Selector */}
      <div className="mb-6">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3 border-b border-white/10 pb-2">
          🎨 Choose Template
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {templates.map((t) => (
            <button
              key={t.id}
              onClick={() => setSelectedTemplate(t.id)}
              className={`flex items-center gap-2 p-2.5 rounded-lg border-2 text-left transition-all ${
                selectedTemplate === t.id
                  ? "border-purple-500 bg-purple-500/10"
                  : "border-white/10 hover:border-white/20 bg-[#0f0f1e]"
              }`}
            >
              <div
                className="w-4 h-4 rounded-full shrink-0"
                style={{ backgroundColor: t.color }}
              />
              <span className="text-xs font-semibold text-white">{t.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Personal Info */}
      <FormSection title="Personal Info" icon="👤">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className={labelClass}>First Name</label>
            <input
              className={inputClass}
              placeholder="OLIVIA"
              value={data.firstName}
              onChange={(e) => update("firstName", e.target.value)}
            />
          </div>
          <div>
            <label className={labelClass}>Last Name</label>
            <input
              className={inputClass}
              placeholder="SCHUMACHER"
              value={data.lastName}
              onChange={(e) => update("lastName", e.target.value)}
            />
          </div>
        </div>
        <div>
          <label className={labelClass}>Job Title</label>
          <input
            className={inputClass}
            placeholder="Marketing Manager"
            value={data.jobTitle}
            onChange={(e) => update("jobTitle", e.target.value)}
          />
        </div>
        <div>
          <label className={labelClass}>Photo</label>
          <div className="flex items-center gap-2">
            {data.photo && (
              <img
                src={data.photo}
                alt="preview"
                className="w-10 h-10 rounded-full object-cover border border-gray-200"
              />
            )}
            <button
              onClick={() => fileRef.current?.click()}
              className="text-xs px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 text-gray-300 transition"
            >
              {data.photo ? "Change Photo" : "Upload Photo"}
            </button>
            {data.photo && (
              <button
                onClick={() => update("photo", "")}
                className="text-xs px-2 py-1.5 text-red-400 hover:bg-red-500/10 rounded-lg border border-red-500/30 transition"
              >
                Remove
              </button>
            )}
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
          </div>
        </div>
      </FormSection>

      {/* Contact */}
      <FormSection title="Contact" icon="📞">
        <div>
          <label className={labelClass}>Phone</label>
          <input
            className={inputClass}
            placeholder="+123-456-7890"
            value={data.phone}
            onChange={(e) => update("phone", e.target.value)}
          />
        </div>
        <div>
          <label className={labelClass}>Email</label>
          <input
            className={inputClass}
            placeholder="hello@reallygreatsite.com"
            value={data.email}
            onChange={(e) => update("email", e.target.value)}
          />
        </div>
        <div>
          <label className={labelClass}>Website</label>
          <input
            className={inputClass}
            placeholder="www.reallygreatsite.com"
            value={data.website}
            onChange={(e) => update("website", e.target.value)}
          />
        </div>
        <div>
          <label className={labelClass}>Address</label>
          <input
            className={inputClass}
            placeholder="123 Anywhere St., Any City, ST 12345"
            value={data.address}
            onChange={(e) => update("address", e.target.value)}
          />
        </div>
      </FormSection>

      {/* About */}
      <FormSection title="About Me" icon="📝">
        <textarea
          className={inputClass}
          rows={4}
          placeholder="Write a brief summary about yourself..."
          value={data.about}
          onChange={(e) => update("about", e.target.value)}
        />
      </FormSection>

      {/* Work Experience */}
      <FormSection title="Work Experience" icon="💼">
        {(data.workExperience || []).map((exp, i) => (
          <div key={i} className="border border-white/10 rounded-lg p-3 bg-[#0f0f1e]">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-semibold text-gray-400">Experience #{i + 1}</span>
              <button
                onClick={() => removeExp(i)}
                className="text-xs text-red-400 hover:text-red-300"
              >
                ✕ Remove
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 mb-2">
              <div>
                <label className={labelClass}>Company</label>
                <input
                  className={inputClass}
                  placeholder="Ginyard International Co."
                  value={exp.company}
                  onChange={(e) => updateExp(i, "company", e.target.value)}
                />
              </div>
              <div>
                <label className={labelClass}>Role</label>
                <input
                  className={inputClass}
                  placeholder="Product Design Manager"
                  value={exp.role}
                  onChange={(e) => updateExp(i, "role", e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 mb-2">
              <div>
                <label className={labelClass}>Start Year</label>
                <input
                  className={inputClass}
                  placeholder="2020"
                  value={exp.startYear}
                  onChange={(e) => updateExp(i, "startYear", e.target.value)}
                />
              </div>
              <div>
                <label className={labelClass}>End Year</label>
                <input
                  className={inputClass}
                  placeholder="2023 or Present"
                  value={exp.endYear}
                  onChange={(e) => updateExp(i, "endYear", e.target.value)}
                />
              </div>
            </div>
            <label className={labelClass}>Bullet Points</label>
            {(exp.bullets || []).map((b, j) => (
              <div key={j} className="flex gap-1 mb-1">
                <input
                  className={inputClass}
                  placeholder={`Bullet point ${j + 1}`}
                  value={b}
                  onChange={(e) => updateExpBullet(i, j, e.target.value)}
                />
                <button
                  onClick={() => removeExpBullet(i, j)}
                  className="text-red-400 hover:text-red-300 px-2 text-sm"
                >
                  ✕
                </button>
              </div>
            ))}
            <button
              onClick={() => addExpBullet(i)}
              className="text-xs text-purple-400 hover:text-purple-300 mt-1"
            >
              + Add Bullet
            </button>
          </div>
        ))}
        <button
          onClick={addExp}
          className="w-full py-2 text-xs font-semibold text-purple-400 border border-dashed border-purple-500/30 rounded-lg hover:bg-purple-500/10 transition"
        >
          + Add Work Experience
        </button>
      </FormSection>

      {/* Education */}
      <FormSection title="Education" icon="🎓">
        {(data.education || []).map((edu, i) => (
          <div key={i} className="border border-white/10 rounded-lg p-3 bg-[#0f0f1e]">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-semibold text-gray-400">Education #{i + 1}</span>
              <button onClick={() => removeEdu(i)} className="text-xs text-red-400 hover:text-red-300">
                ✕ Remove
              </button>
            </div>
            <div className="mb-2">
              <label className={labelClass}>Institution</label>
              <input
                className={inputClass}
                placeholder="Borcelle Business School"
                value={edu.institution}
                onChange={(e) => updateEdu(i, "institution", e.target.value)}
              />
            </div>
            <div className="mb-2">
              <label className={labelClass}>Degree</label>
              <input
                className={inputClass}
                placeholder="Bachelor of Business Management"
                value={edu.degree}
                onChange={(e) => updateEdu(i, "degree", e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className={labelClass}>Start Year</label>
                <input
                  className={inputClass}
                  placeholder="2018"
                  value={edu.startYear}
                  onChange={(e) => updateEdu(i, "startYear", e.target.value)}
                />
              </div>
              <div>
                <label className={labelClass}>End Year</label>
                <input
                  className={inputClass}
                  placeholder="2022"
                  value={edu.endYear}
                  onChange={(e) => updateEdu(i, "endYear", e.target.value)}
                />
              </div>
            </div>
          </div>
        ))}
        <button
          onClick={addEdu}
          className="w-full py-2 text-xs font-semibold text-purple-400 border border-dashed border-purple-500/30 rounded-lg hover:bg-purple-500/10 transition"
        >
          + Add Education
        </button>
      </FormSection>

      {/* Skills */}
      <FormSection title="Skills" icon="⚡">
        <div>
          <label className={labelClass}>Skills (one per line)</label>
          <textarea
            className={inputClass}
            rows={5}
            placeholder={`Management Skills\nDigital Marketing\nNegotiation\nCritical Thinking`}
            value={(data.skills || []).join("\n")}
            onChange={(e) => handleListChange("skills", e.target.value)}
          />
        </div>
      </FormSection>

      {/* Languages */}
      <FormSection title="Languages" icon="🌍">
        <div>
          <label className={labelClass}>Languages (one per line)</label>
          <textarea
            className={inputClass}
            rows={3}
            placeholder={`English\nHindi\nFrench`}
            value={(data.languages || []).join("\n")}
            onChange={(e) => handleListChange("languages", e.target.value)}
          />
        </div>
      </FormSection>

      {/* Professional & Personal Skills (Template 4) */}
      <FormSection title="Professional Skills (Template 4)" icon="🏆">
        <div>
          <label className={labelClass}>Professional Skills (one per line)</label>
          <textarea
            className={inputClass}
            rows={4}
            placeholder={`SEO and Google Analytics\nSocial media strategy\nMarketing`}
            value={(data.professionalSkills || []).join("\n")}
            onChange={(e) => handleListChange("professionalSkills", e.target.value)}
          />
        </div>
        <div>
          <label className={labelClass}>Personal Skills (one per line)</label>
          <textarea
            className={inputClass}
            rows={4}
            placeholder={`Market Strategy\nAccounting\nCommunication`}
            value={(data.personalSkills || []).join("\n")}
            onChange={(e) => handleListChange("personalSkills", e.target.value)}
          />
        </div>
      </FormSection>

      {/* References */}
      <FormSection title="References" icon="👥">
        {(data.references || []).map((ref, i) => (
          <div key={i} className="border border-white/10 rounded-lg p-3 bg-[#0f0f1e]">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-semibold text-gray-400">Reference #{i + 1}</span>
              <button onClick={() => removeRef(i)} className="text-xs text-red-400 hover:text-red-300">
                ✕ Remove
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 mb-2">
              <div>
                <label className={labelClass}>Name</label>
                <input
                  className={inputClass}
                  placeholder="Harumi Kobayashi"
                  value={ref.name}
                  onChange={(e) => updateRef(i, "name", e.target.value)}
                />
              </div>
              <div>
                <label className={labelClass}>Company / Title</label>
                <input
                  className={inputClass}
                  placeholder="Wardiere Inc. / CEO"
                  value={ref.company}
                  onChange={(e) => updateRef(i, "company", e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className={labelClass}>Phone</label>
                <input
                  className={inputClass}
                  placeholder="123-456-7890"
                  value={ref.phone}
                  onChange={(e) => updateRef(i, "phone", e.target.value)}
                />
              </div>
              <div>
                <label className={labelClass}>Email</label>
                <input
                  className={inputClass}
                  placeholder="hello@example.com"
                  value={ref.email}
                  onChange={(e) => updateRef(i, "email", e.target.value)}
                />
              </div>
            </div>
          </div>
        ))}
        <button
          onClick={addRef}
          className="w-full py-2 text-xs font-semibold text-purple-400 border border-dashed border-purple-500/30 rounded-lg hover:bg-purple-500/10 transition"
        >
          + Add Reference
        </button>
      </FormSection>

      {/* Achievements (Template 2) */}
      <FormSection title="Achievements (Template 2)" icon="🏅">
        {(data.achievements || []).map((ach, i) => (
          <div key={i} className="border border-white/10 rounded-lg p-3 bg-[#0f0f1e]">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-semibold text-gray-400">Achievement #{i + 1}</span>
              <button onClick={() => removeAch(i)} className="text-xs text-red-400 hover:text-red-300">
                ✕ Remove
              </button>
            </div>
            <div className="mb-2">
              <label className={labelClass}>Award Name</label>
              <input
                className={inputClass}
                placeholder="Borcelle Award"
                value={ach.award}
                onChange={(e) => updateAch(i, "award", e.target.value)}
              />
            </div>
            <div className="mb-2">
              <label className={labelClass}>Title</label>
              <input
                className={inputClass}
                placeholder="Best Graphic Designer - 2020"
                value={ach.title}
                onChange={(e) => updateAch(i, "title", e.target.value)}
              />
            </div>
            <div>
              <label className={labelClass}>Description</label>
              <textarea
                className={inputClass}
                rows={2}
                placeholder="Brief description..."
                value={ach.description}
                onChange={(e) => updateAch(i, "description", e.target.value)}
              />
            </div>
          </div>
        ))}
        <button
          onClick={addAch}
          className="w-full py-2 text-xs font-semibold text-purple-400 border border-dashed border-purple-500/30 rounded-lg hover:bg-purple-500/10 transition"
        >
          + Add Achievement
        </button>
      </FormSection>
    </div>
  );
};

export default ResumeForm;

import React from "react";
import { ResumeData } from "../types/resume";

interface Props {
  data: ResumeData;
}

const Template2: React.FC<Props> = ({ data }) => {
  return (
    <div
      className="w-full bg-white"
      style={{ fontFamily: "Arial, sans-serif", minHeight: "297mm" }}
    >
      {/* Top Section: Name + Photo */}
      <div style={{ padding: "32px 32px 0 32px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: "32px", fontWeight: "900", color: "#1a1a1a", letterSpacing: "0px", lineHeight: "1.1" }}>
            {data.firstName.toUpperCase()} {data.lastName.toUpperCase()}
          </div>
          <div style={{ fontSize: "14px", color: "#555", marginTop: "4px" }}>
            {data.jobTitle}
          </div>
        </div>
        {data.photo && (
          <div
            style={{
              width: "90px",
              height: "90px",
              borderRadius: "50%",
              overflow: "hidden",
              border: "2px solid #ccc",
              flexShrink: 0,
            }}
          >
            <img
              src={data.photo}
              alt="Profile"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>
        )}
      </div>

      {/* Decorative line with tan accents */}
      <div style={{ display: "flex", alignItems: "center", padding: "12px 32px 0 32px" }}>
        <div style={{ width: "40px", height: "3px", backgroundColor: "#b8935a" }} />
        <div style={{ flex: 1, height: "1px", backgroundColor: "#ddd", margin: "0 8px" }} />
        <div style={{ width: "40px", height: "3px", backgroundColor: "#b8935a" }} />
      </div>

      {/* About Me - Full Width */}
      {data.about && (
        <div style={{ padding: "16px 32px" }}>
          <div style={{ fontSize: "12px", fontWeight: "700", color: "#111", marginBottom: "6px", letterSpacing: "0.5px" }}>
            ABOUT ME
          </div>
          <p style={{ fontSize: "10.5px", color: "#444", lineHeight: "1.65", textAlign: "justify" }}>
            {data.about}
          </p>
        </div>
      )}

      {/* Decorative line */}
      <div style={{ display: "flex", alignItems: "center", padding: "0 32px 12px 32px" }}>
        <div style={{ width: "40px", height: "3px", backgroundColor: "#b8935a" }} />
        <div style={{ flex: 1, height: "1px", backgroundColor: "#ddd", margin: "0 8px" }} />
        <div style={{ width: "40px", height: "3px", backgroundColor: "#b8935a" }} />
      </div>

      {/* Two Column Layout */}
      <div style={{ display: "flex", padding: "0 0 32px 0" }}>
        {/* Left Column - Beige Background */}
        <div
          style={{
            width: "220px",
            flexShrink: 0,
            backgroundColor: "#f5ede0",
            padding: "20px 18px",
          }}
        >
          {/* Contact */}
          <div style={{ marginBottom: "20px" }}>
            <div style={{ fontSize: "12px", fontWeight: "700", color: "#1a1a1a", marginBottom: "10px", letterSpacing: "0.5px" }}>
              CONTACT
            </div>
            <div style={{ fontSize: "10px", color: "#444", lineHeight: "1.8" }}>
              {data.phone && (
                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                  <span style={{ display: "inline-flex", width: "16px", height: "16px", borderRadius: "50%", backgroundColor: "#b8935a", color: "white", alignItems: "center", justifyContent: "center", fontSize: "8px", flexShrink: 0 }}>📞</span>
                  <span>{data.phone}</span>
                </div>
              )}
              {data.address && (
                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                  <span style={{ display: "inline-flex", width: "16px", height: "16px", borderRadius: "50%", backgroundColor: "#b8935a", color: "white", alignItems: "center", justifyContent: "center", fontSize: "8px", flexShrink: 0 }}>📍</span>
                  <span>{data.address}</span>
                </div>
              )}
              {data.website && (
                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                  <span style={{ display: "inline-flex", width: "16px", height: "16px", borderRadius: "50%", backgroundColor: "#b8935a", color: "white", alignItems: "center", justifyContent: "center", fontSize: "8px", flexShrink: 0 }}>🌐</span>
                  <span style={{ wordBreak: "break-all" }}>{data.website}</span>
                </div>
              )}
              {data.email && (
                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                  <span style={{ display: "inline-flex", width: "16px", height: "16px", borderRadius: "50%", backgroundColor: "#b8935a", color: "white", alignItems: "center", justifyContent: "center", fontSize: "8px", flexShrink: 0 }}>✉</span>
                  <span style={{ wordBreak: "break-all" }}>{data.email}</span>
                </div>
              )}
            </div>
          </div>

          {/* Education */}
          {(data.education || []).length > 0 && (
            <div style={{ marginBottom: "20px" }}>
              <div style={{ fontSize: "12px", fontWeight: "700", color: "#1a1a1a", marginBottom: "10px", letterSpacing: "0.5px" }}>
                EDUCATION
              </div>
              {(data.education || []).map((edu, i) => (
                <div key={i} style={{ marginBottom: "10px" }}>
                  <div style={{ fontWeight: "700", fontSize: "10px", color: "#1a1a1a" }}>{edu.institution.toUpperCase()}</div>
                  <div style={{ fontSize: "10px", color: "#555" }}>{edu.degree}</div>
                  {(edu.startYear || edu.endYear) && (
                    <div style={{ fontSize: "10px", color: "#777" }}>
                      {edu.startYear}{edu.startYear && edu.endYear ? " - " : ""}{edu.endYear}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Skills */}
          {(data.skills || []).length > 0 && (
            <div style={{ marginBottom: "20px" }}>
              <div style={{ fontSize: "12px", fontWeight: "700", color: "#1a1a1a", marginBottom: "10px", letterSpacing: "0.5px" }}>
                SKILLS
              </div>
              <ul style={{ paddingLeft: "0", listStyle: "none", margin: 0 }}>
                {(data.skills || []).map((skill, i) => (
                  <li key={i} style={{ fontSize: "10px", color: "#444", marginBottom: "5px", display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ fontSize: "7px", color: "#777" }}>●</span>
                    {skill}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Languages */}
          {(data.languages || []).length > 0 && (
            <div style={{ marginBottom: "20px" }}>
              <div style={{ fontSize: "12px", fontWeight: "700", color: "#1a1a1a", marginBottom: "10px", letterSpacing: "0.5px" }}>
                LANGUAGES
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {(data.languages || []).map((lang, i) => (
                  <span key={i} style={{ fontSize: "10px", color: "#444" }}>{lang}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column */}
        <div style={{ flex: 1, padding: "20px 24px" }}>
          {/* Work Experience */}
          {(data.workExperience || []).length > 0 && (
            <div style={{ marginBottom: "20px" }}>
              <div style={{ fontSize: "13px", fontWeight: "700", color: "#1a1a1a", marginBottom: "12px", letterSpacing: "0.5px" }}>
                WORK EXPERIENCE
              </div>
              {(data.workExperience || []).map((exp, i) => (
                <div key={i} style={{ marginBottom: "14px", display: "flex", gap: "8px" }}>
                  {/* Left border accent */}
                  <div style={{ width: "3px", backgroundColor: "#b8935a", flexShrink: 0, marginTop: "2px" }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: "700", fontSize: "11px", color: "#1a1a1a", textTransform: "uppercase", letterSpacing: "0.3px" }}>
                      {exp.company}
                    </div>
                    <div style={{ fontSize: "10px", color: "#666", marginBottom: "4px" }}>
                      {exp.role}{exp.startYear || exp.endYear ? ` - ${exp.endYear || exp.startYear}` : ""}
                    </div>
                    <p style={{ fontSize: "10px", color: "#555", lineHeight: "1.5", margin: 0 }}>
                      {(exp.bullets || []).filter(b => b.trim()).join(". ")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Achievements */}
          {data.achievements && (data.achievements || []).length > 0 && data.achievements[0].award && (
            <div style={{ marginBottom: "20px" }}>
              <div style={{ fontSize: "13px", fontWeight: "700", color: "#1a1a1a", marginBottom: "12px", letterSpacing: "0.5px" }}>
                ACHIEVEMENT
              </div>
              {(data.achievements || []).map((ach, i) => (
                <div key={i} style={{ marginBottom: "12px" }}>
                  <div style={{ fontSize: "10.5px", color: "#333", letterSpacing: "0.3px", marginBottom: "2px" }}>
                    {ach.award.toUpperCase()}
                  </div>
                  <div style={{ fontSize: "10px", color: "#666", marginBottom: "4px" }}>{ach.title}</div>
                  <p style={{ fontSize: "10px", color: "#555", lineHeight: "1.5", margin: 0 }}>{ach.description}</p>
                </div>
              ))}
            </div>
          )}

          {/* References */}
          {(data.references || []).length > 0 && (
            <div style={{ marginBottom: "20px" }}>
              <div style={{ fontSize: "13px", fontWeight: "700", color: "#1a1a1a", marginBottom: "12px", letterSpacing: "0.5px" }}>
                REFERENCE
              </div>
              <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
                {(data.references || []).map((ref, i) => (
                  <div key={i} style={{ minWidth: "150px" }}>
                    <div style={{ fontWeight: "700", fontSize: "11px", color: "#111" }}>{ref.name}</div>
                    <div style={{ fontSize: "10px", color: "#666", marginBottom: "4px" }}>{ref.company}</div>
                    {ref.phone && (
                      <div style={{ fontSize: "10px", color: "#444", display: "flex", alignItems: "center", gap: "4px" }}>
                        <span style={{ display: "inline-flex", width: "14px", height: "14px", borderRadius: "50%", backgroundColor: "#b8935a", alignItems: "center", justifyContent: "center", fontSize: "7px" }}>📞</span>
                        {ref.phone}
                      </div>
                    )}
                    {ref.email && (
                      <div style={{ fontSize: "10px", color: "#444", display: "flex", alignItems: "center", gap: "4px", marginTop: "2px" }}>
                        <span style={{ display: "inline-flex", width: "14px", height: "14px", borderRadius: "50%", backgroundColor: "#b8935a", alignItems: "center", justifyContent: "center", fontSize: "7px" }}>🌐</span>
                        {ref.email}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Template2;

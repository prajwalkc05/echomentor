import React from "react";
import { ResumeData } from "../types/resume";

interface Props {
  data: ResumeData;
}

const Template4: React.FC<Props> = ({ data }) => {
  return (
    <div
      className="w-full bg-white flex"
      style={{ fontFamily: "Arial, sans-serif", minHeight: "297mm", position: "relative", overflow: "hidden" }}
    >
      {/* Geometric Background shapes on right */}
      <div style={{ position: "absolute", top: 0, right: 0, width: "180px", height: "100%", pointerEvents: "none", zIndex: 0 }}>
        {/* Dark teal top shape */}
        <div style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: "130px",
          height: "220px",
          backgroundColor: "#2d5f6e",
          clipPath: "polygon(100% 0, 100% 100%, 0 100%, 40% 0)",
        }} />
        {/* Light gray middle shape */}
        <div style={{
          position: "absolute",
          top: "150px",
          right: "0px",
          width: "80px",
          height: "220px",
          backgroundColor: "#b0bec5",
          clipPath: "polygon(100% 0, 100% 100%, 0 100%, 20% 0)",
          opacity: 0.8,
        }} />
        {/* Dark teal bottom shape */}
        <div style={{
          position: "absolute",
          bottom: 0,
          right: 0,
          width: "140px",
          height: "280px",
          backgroundColor: "#2d5f6e",
          clipPath: "polygon(100% 0, 100% 100%, 0 100%, 30% 0)",
        }} />
        {/* Light gray bottom accent */}
        <div style={{
          position: "absolute",
          bottom: "60px",
          right: "0px",
          width: "60px",
          height: "200px",
          backgroundColor: "#90a4ae",
          clipPath: "polygon(100% 0, 100% 100%, 0 100%, 10% 0)",
          opacity: 0.7,
        }} />
      </div>

      {/* Left Column */}
      <div
        style={{
          width: "220px",
          flexShrink: 0,
          backgroundColor: "#b0bec5",
          padding: "24px 18px",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Photo */}
        <div
          style={{
            width: "100%",
            paddingBottom: "100%",
            position: "relative",
            marginBottom: "20px",
            overflow: "hidden",
          }}
        >
          {data.photo ? (
            <img
              src={data.photo}
              alt="Profile"
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          ) : (
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                backgroundColor: "#90a4ae",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontSize: "12px",
              }}
            >
              Photo
            </div>
          )}
        </div>

        {/* Professional Skills */}
        {data.professionalSkills && (data.professionalSkills || []).length > 0 && (
          <div style={{ marginBottom: "20px" }}>
            <div style={{ fontSize: "10px", fontWeight: "700", color: "#1a1a1a", letterSpacing: "2px", marginBottom: "8px" }}>
              PROFESSIONAL SKILLS
            </div>
            {(data.professionalSkills || []).map((skill, i) => (
              <div key={i} style={{ fontSize: "10px", color: "#222", lineHeight: "1.7" }}>{skill}</div>
            ))}
          </div>
        )}

        {/* Personal Skills */}
        {data.personalSkills && (data.personalSkills || []).length > 0 && (
          <div style={{ marginBottom: "20px" }}>
            <div style={{ fontSize: "10px", fontWeight: "700", color: "#1a1a1a", letterSpacing: "2px", marginBottom: "8px" }}>
              PERSONAL SKILLS
            </div>
            {(data.personalSkills || []).map((skill, i) => (
              <div key={i} style={{ fontSize: "10px", color: "#222", lineHeight: "1.7" }}>{skill}</div>
            ))}
          </div>
        )}

        {/* Contact Info */}
        {(data.phone || data.email || data.address) && (
          <div style={{ marginBottom: "20px" }}>
            <div style={{ fontSize: "10px", fontWeight: "700", color: "#1a1a1a", letterSpacing: "2px", marginBottom: "8px" }}>
              CONTACT
            </div>
            {data.phone && <div style={{ fontSize: "10px", color: "#222", lineHeight: "1.7" }}>{data.phone}</div>}
            {data.email && <div style={{ fontSize: "10px", color: "#222", lineHeight: "1.7", wordBreak: "break-all" }}>{data.email}</div>}
            {data.address && <div style={{ fontSize: "10px", color: "#222", lineHeight: "1.7" }}>{data.address}</div>}
          </div>
        )}
      </div>

      {/* Right Column */}
      <div style={{ flex: 1, padding: "28px 24px 28px 24px", position: "relative", zIndex: 1 }}>
        {/* Name & Title */}
        <div style={{ marginBottom: "20px" }}>
          <div style={{ fontSize: "36px", fontWeight: "900", color: "#1a1a1a", lineHeight: "1", letterSpacing: "3px" }}>
            {data.firstName.toUpperCase()}
          </div>
          <div style={{ fontSize: "36px", fontWeight: "900", color: "#1a1a1a", lineHeight: "1.1", letterSpacing: "3px", marginBottom: "6px" }}>
            {data.lastName.toUpperCase()}
          </div>
          <div style={{ fontSize: "11px", color: "#444", letterSpacing: "4px", textTransform: "uppercase" }}>
            {data.jobTitle}
          </div>
        </div>

        {/* About */}
        {data.about && (
          <div style={{ marginBottom: "20px" }}>
            <div style={{ fontSize: "11px", fontWeight: "700", color: "#1a1a1a", letterSpacing: "2px", marginBottom: "8px" }}>
              ABOUT
            </div>
            <p style={{ fontSize: "10px", color: "#444", lineHeight: "1.6" }}>{data.about}</p>
          </div>
        )}

        {/* Work Experience */}
        {(data.workExperience || []).length > 0 && (
          <div style={{ marginBottom: "20px" }}>
            <div style={{ fontSize: "11px", fontWeight: "700", color: "#1a1a1a", letterSpacing: "2px", marginBottom: "12px" }}>
              WORK EXPERIENCE
            </div>
            {(data.workExperience || []).map((exp, i) => (
              <div key={i} style={{ marginBottom: "14px" }}>
                <div style={{ fontSize: "12px", color: "#1a1a1a", fontWeight: "400", marginBottom: "2px" }}>
                  {exp.company}
                </div>
                <div style={{ fontSize: "10px", color: "#555", marginBottom: "4px" }}>
                  {exp.role} {exp.startYear || exp.endYear ? `${exp.startYear || ""}` : ""}
                  {exp.startYear && exp.endYear ? "" : ""}{exp.endYear && exp.endYear !== exp.startYear ? exp.endYear : ""}
                </div>
                {(exp.bullets || []).filter(b => b.trim()).map((b, j) => (
                  <div key={j} style={{ display: "flex", gap: "6px", alignItems: "flex-start", margin: "3px 0" }}>
                    <span style={{ fontSize: "7px", color: "#555", marginTop: "4px", flexShrink: 0 }}>●</span>
                    <span style={{ fontSize: "10px", color: "#444", lineHeight: "1.5" }}>{b}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {/* Education */}
        {(data.education || []).length > 0 && (
          <div style={{ marginBottom: "20px" }}>
            <div style={{ fontSize: "11px", fontWeight: "700", color: "#1a1a1a", letterSpacing: "2px", marginBottom: "12px" }}>
              EDUCATION
            </div>
            {(data.education || []).map((edu, i) => (
              <div key={i} style={{ marginBottom: "10px" }}>
                <div style={{ fontSize: "12px", color: "#1a1a1a", fontWeight: "400", marginBottom: "2px" }}>
                  {edu.institution}
                </div>
                <ul style={{ paddingLeft: "14px", margin: "4px 0 0 0" }}>
                  <li style={{ fontSize: "10px", color: "#444", lineHeight: "1.5" }}>{edu.degree}</li>
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Template4;

import React from "react";
import { ResumeData } from "../types/resume";

interface Props {
  data: ResumeData;
}

const Template3: React.FC<Props> = ({ data }) => {
  return (
    <div
      className="w-full bg-white"
      style={{ fontFamily: "Arial, sans-serif", minHeight: "297mm", padding: "32px 36px" }}
    >
      {/* Name & Title */}
      <div style={{ marginBottom: "16px" }}>
        <div style={{ fontSize: "30px", fontWeight: "900", color: "#1a1a1a", letterSpacing: "2px" }}>
          {data.firstName.toUpperCase()} {data.lastName.toUpperCase()}
        </div>
        <div style={{ fontSize: "13px", color: "#555", marginTop: "2px", letterSpacing: "0.5px" }}>
          {data.jobTitle}
        </div>
      </div>

      {/* Contact Bar */}
      <div
        style={{
          display: "flex",
          gap: "20px",
          flexWrap: "wrap",
          padding: "8px 12px",
          border: "1px solid #ddd",
          borderRadius: "4px",
          backgroundColor: "#fafafa",
          marginBottom: "20px",
          alignItems: "center",
        }}
      >
        {data.phone && (
          <div style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "10px", color: "#444" }}>
            <span style={{ display: "inline-flex", width: "18px", height: "18px", borderRadius: "50%", backgroundColor: "#e0e0e0", alignItems: "center", justifyContent: "center", fontSize: "9px" }}>📞</span>
            {data.phone}
          </div>
        )}
        {data.address && (
          <div style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "10px", color: "#444" }}>
            <span style={{ display: "inline-flex", width: "18px", height: "18px", borderRadius: "50%", backgroundColor: "#e0e0e0", alignItems: "center", justifyContent: "center", fontSize: "9px" }}>📍</span>
            {data.address}
          </div>
        )}
        {data.website && (
          <div style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "10px", color: "#444" }}>
            <span style={{ display: "inline-flex", width: "18px", height: "18px", borderRadius: "50%", backgroundColor: "#e0e0e0", alignItems: "center", justifyContent: "center", fontSize: "9px" }}>🌐</span>
            {data.website}
          </div>
        )}
        {data.email && (
          <div style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "10px", color: "#444" }}>
            <span style={{ display: "inline-flex", width: "18px", height: "18px", borderRadius: "50%", backgroundColor: "#e0e0e0", alignItems: "center", justifyContent: "center", fontSize: "9px" }}>✉</span>
            {data.email}
          </div>
        )}
      </div>

      {/* About Me */}
      {data.about && (
        <>
          <div
            style={{
              display: "inline-block",
              backgroundColor: "#e8e8e8",
              padding: "4px 12px",
              fontSize: "11px",
              fontWeight: "700",
              color: "#111",
              marginBottom: "8px",
              borderRadius: "2px",
            }}
          >
            ABOUT ME
          </div>
          <div style={{ borderBottom: "1.5px solid #ccc", marginBottom: "10px" }} />
          <p style={{ fontSize: "10.5px", color: "#444", lineHeight: "1.65", textAlign: "justify", marginBottom: "20px" }}>
            {data.about}
          </p>
        </>
      )}

      {/* Education */}
      {(data.education || []).length > 0 && (
        <div style={{ marginBottom: "20px" }}>
          <div
            style={{
              display: "inline-block",
              backgroundColor: "#e8e8e8",
              padding: "4px 12px",
              fontSize: "11px",
              fontWeight: "700",
              color: "#111",
              marginBottom: "8px",
              borderRadius: "2px",
            }}
          >
            EDUCATION
          </div>
          <div style={{ borderBottom: "1.5px solid #ccc", marginBottom: "12px" }} />
          {(data.education || []).map((edu, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
              <div>
                <div style={{ fontWeight: "700", fontSize: "11px", color: "#1a1a1a" }}>{edu.institution.toUpperCase()}</div>
                <div style={{ fontSize: "10px", color: "#555" }}>{edu.degree}</div>
              </div>
              <div style={{ fontSize: "10px", color: "#555", whiteSpace: "nowrap", marginLeft: "16px" }}>
                {edu.startYear}{edu.startYear && edu.endYear ? "-" : ""}{edu.endYear}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Skills */}
      {(data.skills || []).length > 0 && (
        <div style={{ marginBottom: "20px" }}>
          <div
            style={{
              display: "inline-block",
              backgroundColor: "#e8e8e8",
              padding: "4px 12px",
              fontSize: "11px",
              fontWeight: "700",
              color: "#111",
              marginBottom: "8px",
              borderRadius: "2px",
            }}
          >
            SKILL
          </div>
          <div style={{ borderBottom: "1.5px solid #ccc", marginBottom: "12px" }} />
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 32px" }}>
            {(data.skills || []).map((skill, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "10.5px", color: "#444", minWidth: "160px" }}>
                <span style={{ fontSize: "7px", color: "#555" }}>●</span>
                {skill}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Work Experience */}
      {(data.workExperience || []).length > 0 && (
        <div style={{ marginBottom: "20px" }}>
          <div
            style={{
              display: "inline-block",
              backgroundColor: "#e8e8e8",
              padding: "4px 12px",
              fontSize: "11px",
              fontWeight: "700",
              color: "#111",
              marginBottom: "8px",
              borderRadius: "2px",
            }}
          >
            WORK EXPERIENCE
          </div>
          <div style={{ borderBottom: "1.5px solid #ccc", marginBottom: "16px" }} />
          {(data.workExperience || []).map((exp, i) => (
            <div key={i} style={{ marginBottom: "18px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "4px" }}>
                <div style={{ fontWeight: "700", fontSize: "11px", color: "#1a1a1a" }}>
                  {exp.company} - {exp.role}
                </div>
                <div style={{ fontSize: "10px", fontWeight: "700", color: "#3a5a8a", whiteSpace: "nowrap", marginLeft: "12px" }}>
                  {exp.startYear}{exp.startYear && exp.endYear ? "-" : ""}{exp.endYear}
                </div>
              </div>
              {(exp.bullets || []).filter(b => b.trim()).length > 0 && (
                <>
                  <p style={{ fontSize: "10px", color: "#444", lineHeight: "1.6", textAlign: "justify", margin: "4px 0" }}>
                    {(exp.bullets || []).filter(b => b.trim()).slice(0, 1).join("")}
                  </p>
                  {(exp.bullets || []).filter(b => b.trim()).slice(1).map((b, j) => (
                    <div key={j} style={{ display: "flex", gap: "6px", alignItems: "flex-start", margin: "3px 0" }}>
                      <span style={{ fontSize: "7px", color: "#555", marginTop: "4px" }}>●</span>
                      <span style={{ fontSize: "10px", color: "#444", lineHeight: "1.5" }}>{b}</span>
                    </div>
                  ))}
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Template3;

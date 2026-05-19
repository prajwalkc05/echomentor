import React from "react";
import { ResumeData } from "../types/resume";

interface Props {
  data: ResumeData;
}

const Template1: React.FC<Props> = ({ data }) => {
  return (
    <div
      className="w-full bg-white flex"
      style={{ fontFamily: "Georgia, serif", minHeight: "297mm" }}
    >
      {/* Left Dark Sidebar */}
      <div
        className="shrink-0 flex flex-col items-center"
        style={{ width: "220px", backgroundColor: "#2d2d2d", padding: "24px 16px" }}
      >
        {/* Photo */}
        <div
          style={{
            width: "140px",
            height: "140px",
            borderRadius: "50%",
            overflow: "hidden",
            border: "3px solid #555",
            marginBottom: "28px",
            flexShrink: 0,
          }}
        >
          {data.photo ? (
            <img
              src={data.photo}
              alt="Profile"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <div
              style={{
                width: "100%",
                height: "100%",
                backgroundColor: "#888",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#ccc",
                fontSize: "12px",
              }}
            >
              Photo
            </div>
          )}
        </div>

        {/* Contact Me */}
        <div style={{ width: "100%", marginBottom: "24px" }}>
          <div
            style={{
              backgroundColor: "#444",
              borderRadius: "20px",
              padding: "6px 16px",
              textAlign: "center",
              color: "white",
              fontWeight: "700",
              fontSize: "11px",
              letterSpacing: "1px",
              marginBottom: "12px",
            }}
          >
            CONTACT ME
          </div>
          <div style={{ color: "#ccc", fontSize: "10px", lineHeight: "1.8" }}>
            {data.phone && (
              <div style={{ display: "flex", alignItems: "flex-start", gap: "6px", marginBottom: "4px" }}>
                <span style={{ color: "#aaa", marginTop: "1px" }}>📞</span>
                <span>{data.phone}</span>
              </div>
            )}
            {data.email && (
              <div style={{ display: "flex", alignItems: "flex-start", gap: "6px", marginBottom: "4px" }}>
                <span style={{ color: "#aaa", marginTop: "1px" }}>✉</span>
                <span style={{ wordBreak: "break-all" }}>{data.email}</span>
              </div>
            )}
            {data.website && (
              <div style={{ display: "flex", alignItems: "flex-start", gap: "6px", marginBottom: "4px" }}>
                <span style={{ color: "#aaa", marginTop: "1px" }}>🌐</span>
                <span style={{ wordBreak: "break-all" }}>{data.website}</span>
              </div>
            )}
            {data.address && (
              <div style={{ display: "flex", alignItems: "flex-start", gap: "6px", marginBottom: "4px" }}>
                <span style={{ color: "#aaa", marginTop: "1px" }}>📍</span>
                <span>{data.address}</span>
              </div>
            )}
          </div>
        </div>

        {/* Education */}
        <div style={{ width: "100%", marginBottom: "24px" }}>
          <div
            style={{
              backgroundColor: "#444",
              borderRadius: "20px",
              padding: "6px 16px",
              textAlign: "center",
              color: "white",
              fontWeight: "700",
              fontSize: "11px",
              letterSpacing: "1px",
              marginBottom: "12px",
            }}
          >
            EDUCATION
          </div>
          {(data.education || []).map((edu, i) => (
            <div key={i} style={{ color: "#ccc", fontSize: "10px", marginBottom: "10px" }}>
              <div style={{ fontWeight: "700", color: "#d4a843", fontSize: "10px" }}>{edu.institution}</div>
              <div>{edu.degree}</div>
              {(edu.startYear || edu.endYear) && (
                <div style={{ color: "#aaa" }}>
                  {edu.startYear}{edu.startYear && edu.endYear ? " - " : ""}{edu.endYear}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Skills */}
        <div style={{ width: "100%", marginBottom: "24px" }}>
          <div
            style={{
              backgroundColor: "#444",
              borderRadius: "20px",
              padding: "6px 16px",
              textAlign: "center",
              color: "white",
              fontWeight: "700",
              fontSize: "11px",
              letterSpacing: "1px",
              marginBottom: "12px",
            }}
          >
            SKILLS
          </div>
          <ul style={{ color: "#ccc", fontSize: "10px", paddingLeft: "0", listStyle: "none" }}>
            {(data.skills || []).map((skill, i) => (
              <li key={i} style={{ marginBottom: "6px", display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ color: "#999", fontSize: "8px" }}>●</span>
                {skill}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Right Content */}
      <div style={{ flex: 1, padding: "32px 28px" }}>
        {/* Name & Title */}
        <div style={{ marginBottom: "28px" }}>
          <div style={{ fontSize: "36px", color: "#222", lineHeight: "1", fontWeight: "400", fontFamily: "Arial, sans-serif" }}>
            {data.firstName}
          </div>
          <div
            style={{
              fontSize: "42px",
              fontWeight: "900",
              color: "#111",
              lineHeight: "1.05",
              fontFamily: "Arial, sans-serif",
              letterSpacing: "-1px",
            }}
          >
            {data.lastName.toUpperCase()}
          </div>
          <div style={{ fontSize: "16px", color: "#555", marginTop: "4px", fontFamily: "Arial, sans-serif" }}>
            {data.jobTitle}
          </div>
        </div>

        {/* About Me */}
        {data.about && (
          <div style={{ marginBottom: "24px" }}>
            <div
              style={{
                fontSize: "14px",
                fontWeight: "700",
                color: "#111",
                letterSpacing: "1px",
                marginBottom: "8px",
                fontFamily: "Arial, sans-serif",
                textTransform: "uppercase",
              }}
            >
              ABOUT ME
            </div>
            <p style={{ fontSize: "10.5px", color: "#444", lineHeight: "1.65", textAlign: "justify", fontFamily: "Arial, sans-serif" }}>
              {data.about}
            </p>
          </div>
        )}

        {/* Work Experience */}
        {(data.workExperience || []).length > 0 && (
          <div style={{ marginBottom: "24px" }}>
            <div
              style={{
                fontSize: "14px",
                fontWeight: "700",
                color: "#111",
                letterSpacing: "1px",
                marginBottom: "12px",
                fontFamily: "Arial, sans-serif",
                textTransform: "uppercase",
              }}
            >
              WORK EXPERIENCE
            </div>
            {(data.workExperience || []).map((exp, i) => (
              <div key={i} style={{ marginBottom: "16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div
                    style={{ fontWeight: "700", fontSize: "12px", color: "#111", fontFamily: "Arial, sans-serif" }}
                  >
                    {exp.company}
                  </div>
                  <div style={{ fontSize: "10px", fontWeight: "700", color: "#333", fontFamily: "Arial, sans-serif", whiteSpace: "nowrap", marginLeft: "8px" }}>
                    {exp.startYear}{exp.startYear && exp.endYear ? " – " : ""}{exp.endYear}
                  </div>
                </div>
                <div style={{ fontSize: "10.5px", color: "#555", fontFamily: "Arial, sans-serif", marginBottom: "4px" }}>
                  {exp.role}
                </div>
                {(exp.bullets || []).filter(b => b.trim()).length > 0 && (
                  <ul style={{ paddingLeft: "14px", margin: "4px 0 0 0" }}>
                    {(exp.bullets || []).filter(b => b.trim()).map((b, j) => (
                      <li key={j} style={{ fontSize: "10px", color: "#444", lineHeight: "1.5", fontFamily: "Arial, sans-serif" }}>
                        {b}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}

        {/* References */}
        {(data.references || []).length > 0 && (
          <div style={{ marginBottom: "24px" }}>
            <div
              style={{
                fontSize: "14px",
                fontWeight: "700",
                color: "#111",
                letterSpacing: "1px",
                marginBottom: "12px",
                fontFamily: "Arial, sans-serif",
                textTransform: "uppercase",
              }}
            >
              REFERENCES
            </div>
            <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
              {(data.references || []).map((ref, i) => (
                <div key={i} style={{ minWidth: "160px" }}>
                  <div style={{ fontWeight: "700", fontSize: "11px", color: "#111", fontFamily: "Arial, sans-serif" }}>
                    {ref.name}
                  </div>
                  <div style={{ fontSize: "10px", color: "#555", fontFamily: "Arial, sans-serif", marginBottom: "4px" }}>
                    {ref.company}
                  </div>
                  {ref.phone && (
                    <div style={{ fontSize: "10px", color: "#444", fontFamily: "Arial, sans-serif" }}>
                      <span style={{ fontWeight: "700" }}>Phone: </span>{ref.phone}
                    </div>
                  )}
                  {ref.email && (
                    <div style={{ fontSize: "10px", color: "#444", fontFamily: "Arial, sans-serif" }}>
                      <span style={{ fontWeight: "700" }}>Email: </span>{ref.email}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Template1;

import { ResumeData } from "../types/resume";

export const defaultResumeData: ResumeData = {
  firstName: "Olivia",
  lastName: "Schumacher",
  jobTitle: "Marketing Manager",
  phone: "+123-456-7890",
  email: "hello@reallygreatsite.com",
  website: "www.reallygreatsite.com",
  address: "123 Anywhere St., Any City, ST 12345",
  photo: "",
  about:
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
  workExperience: [
    {
      company: "Ginyard International Co.",
      role: "Product Design Manager",
      startYear: "2020",
      endYear: "2023",
      bullets: [
        "Working with the wider development team.",
        "Manage website design, content, and SEO Marketing, Branding and Logo Design",
      ],
    },
    {
      company: "Arowwai Industries",
      role: "Product Design Manager",
      startYear: "2019",
      endYear: "2020",
      bullets: [
        "Working with the wider development team.",
        "Manage website design, content, and SEO Marketing, Branding and Logo Design",
      ],
    },
    {
      company: "Ginyard International Co.",
      role: "Product Design Manager",
      startYear: "2017",
      endYear: "2019",
      bullets: [
        "Working with the wider development team.",
        "Manage website design, content, and SEO Marketing, Branding and Logo Design",
      ],
    },
  ],
  education: [
    {
      institution: "Borcelle Business School",
      degree: "Bachelor of Business Management",
      startYear: "",
      endYear: "",
    },
    {
      institution: "Larana Business School",
      degree: "Certificate in Digital Marketing",
      startYear: "2006",
      endYear: "2008",
    },
    {
      institution: "Borcelle Business School",
      degree: "Certificate in Digital Marketing",
      startYear: "2006",
      endYear: "2008",
    },
  ],
  skills: [
    "Management Skills",
    "Digital Marketing",
    "Negotiation",
    "Critical Thinking",
    "Communication Skills",
    "Process Flows",
  ],
  languages: ["Hindi", "English"],
  references: [
    {
      name: "Harumi Kobayashi",
      company: "Wardiere Inc. / CEO",
      phone: "123-456-7890",
      email: "hello@reallygreatsite.com",
    },
    {
      name: "Bailey Dupont",
      company: "Wardiere Inc. / CEO",
      phone: "123-456-7890",
      email: "hello@reallygreatsite.com",
    },
  ],
  professionalSkills: [
    "SEO and Google Analytics",
    "Social media strategy",
    "Marketing",
    "Web content development",
    "Photo editing",
    "Market research",
  ],
  personalSkills: [
    "Market Strategy",
    "Accounting",
    "Communication",
    "Technical",
    "Problem Solving",
  ],
  achievements: [
    {
      award: "Borcelle Award",
      title: "Best Graphic Designer - 2020",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    },
  ],
};

export interface WorkExperience {
  company: string;
  role: string;
  startYear: string;
  endYear: string;
  bullets: string[];
}

export interface Education {
  institution: string;
  degree: string;
  startYear: string;
  endYear: string;
}

export interface Reference {
  name: string;
  company: string;
  phone: string;
  email: string;
}

export interface ResumeData {
  firstName: string;
  lastName: string;
  jobTitle: string;
  phone: string;
  email: string;
  website: string;
  address: string;
  about: string;
  photo: string;
  workExperience: WorkExperience[];
  education: Education[];
  skills: string[];
  languages: string[];
  references: Reference[];
  professionalSkills: string[];
  personalSkills: string[];
  achievements: {
    award: string;
    title: string;
    description: string;
  }[];
}

export type TemplateId = 1 | 2 | 3 | 4;

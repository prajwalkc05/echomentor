import { ResumeData } from '../types/resume';
import { storage } from '../../utils/storage';

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const formatDate = (date: string): string => {
  if (!date) return '';
  return date;
};

export const validateEmail = (email: string): boolean => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePhone = (phone: string): boolean => {
  const re = /^[\d\s\-\+\(\)]+$/;
  return phone.length >= 10 && re.test(phone);
};

export const saveToLocalStorage = (data: ResumeData): void => {
  try {
    storage.setJSON('resumeData', data);
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
  }
};

export const loadFromLocalStorage = (): ResumeData | null => {
  try {
    return storage.getJSON<ResumeData>('resumeData');
  } catch (error) {
    console.error('Failed to load from localStorage:', error);
    return null;
  }
};

export const clearLocalStorage = (): void => {
  try {
    storage.remove('resumeData');
  } catch (error) {
    console.error('Failed to clear localStorage:', error);
  }
};

export const exportToPDF = async (elementId: string): Promise<void> => {
  // This is a placeholder for PDF export functionality
  // In production, you would use a library like jsPDF or html2pdf
  const element = document.getElementById(elementId);
  if (!element) {
    console.error('Element not found');
    return;
  }
  
  // For now, trigger print dialog
  window.print();
};

export const calculateCompleteness = (data: ResumeData): number => {
  let total = 6;
  let filled = 0;
  if (data.firstName) filled++;
  if (data.email) filled++;
  if (data.phone) filled++;
  if (data.address) filled++;
  if (data.jobTitle) filled++;
  if (data.about) filled++;
  total += 1; if ((data.education || []).length > 0) filled++;
  total += 1; if ((data.workExperience || []).length > 0) filled++;
  total += 1; if ((data.skills || []).length >= 3) filled++;
  return Math.round((filled / total) * 100);
};

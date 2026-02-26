import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function sanitizeString(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .slice(0, 5000); // Hard limit
}

export function sanitizeArray(arr: string[]): string[] {
  return arr.map(sanitizeString).filter(Boolean).slice(0, 20);
}

export const ACADEMIC_FIELDS = [
  'Artificial Intelligence', 'Biology', 'Biomedical Engineering', 'Business Administration',
  'Chemistry', 'Civil Engineering', 'Climate Science', 'Cognitive Science',
  'Communication', 'Computer Science', 'Data Science', 'Economics',
  'Education', 'Electrical Engineering', 'Environmental Science', 'Geography',
  'History', 'Law', 'Linguistics', 'Literature', 'Mathematics',
  'Mechanical Engineering', 'Medicine', 'Neuroscience', 'Philosophy',
  'Physics', 'Political Science', 'Psychology', 'Public Health',
  'Sociology', 'Statistics', 'Urban Studies',
];

export const COLLABORATION_INTERESTS = [
  'Co-authoring papers', 'Grant applications', 'Student exchange',
  'Joint laboratories', 'Data sharing', 'Workshops & conferences',
  'Mentorship', 'Startup / Tech transfer', 'Policy advising',
  'International projects', 'Open science', 'Teaching collaboration',
];

export const COUNTRIES = [
  'Argentina', 'Australia', 'Austria', 'Belgium', 'Brazil', 'Canada',
  'Chile', 'China', 'Colombia', 'Czech Republic', 'Denmark', 'Finland',
  'France', 'Germany', 'Greece', 'India', 'Ireland', 'Israel', 'Italy',
  'Japan', 'Mexico', 'Netherlands', 'New Zealand', 'Norway', 'Peru',
  'Poland', 'Portugal', 'Russia', 'South Africa', 'South Korea', 'Spain',
  'Sweden', 'Switzerland', 'Turkey', 'United Kingdom', 'United States',
];

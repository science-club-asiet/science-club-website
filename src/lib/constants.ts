export type DepartmentOption = {
  code: string;
  name: string;
};

export const DEPARTMENTS: readonly DepartmentOption[] = [
  { code: "AI", name: "Artificial Intelligence" },
  { code: "CE", name: "Civil Engineering" },
  { code: "CSE", name: "Computer Science & Engineering" },
  { code: "DS", name: "Data Science" },
  { code: "EBE", name: "Electronics & Biomedical Engineering" },
  { code: "EEE", name: "Electrical & Electronics Engineering" },
  { code: "ECE", name: "Electronics & Communication Engineering" },
  { code: "ME", name: "Mechanical Engineering" },
  { code: "RAE", name: "Robotics & Automation Engineering" },
] as const;

export const YEARS = [
  "1st Year",
  "2nd Year",
  "3rd Year",
  "4th Year",
] as const;

export type AcademicYear = (typeof YEARS)[number];

export function getSemesterFromYear(year?: string | null): string {
  if (!year) return "S1 / S2";
  if (year.includes("1") || year.toLowerCase().includes("first")) return "S1 / S2";
  if (year.includes("2") || year.toLowerCase().includes("second")) return "S3 / S4";
  if (year.includes("3") || year.toLowerCase().includes("third")) return "S5 / S6";
  if (year.includes("4") || year.toLowerCase().includes("fourth")) return "S7 / S8";
  return year;
}

export type DepartmentOption = {
  code: string;
  name: string;
};

export const DEPARTMENTS: readonly DepartmentOption[] = [
  { code: "AI", name: "Artificial Intelligence" },
  { code: "CE", name: "Civil Engineering" },
  { code: "CSE", name: "Computer Science & Engineering" },
  { code: "DS", name: "Data Science" },
  { code: "EEE", name: "Electrical & Electronics Engineering" },
  { code: "EBE", name: "Electronics & Biomedical Engineering" },
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

/**
 * Automatically calculates current Semester from Year of Study and Month:
 * - Jan to May (Months 1-5): Even Semesters (S2, S4, S6, S8)
 * - June to July (Months 6-7): Odd Semesters (S3, S5, S7)
 * - August to Dec (Months 8-12): Odd Semesters (S1, S3, S5, S7)
 */
export function getSemesterFromYear(year: string | null | undefined, date: Date = new Date()): string {
  if (!year) return "";

  const month = date.getMonth() + 1; // 1 to 12

  if (month >= 1 && month <= 5) {
    switch (year) {
      case "1st Year": return "Semester 2 (S2)";
      case "2nd Year": return "Semester 4 (S4)";
      case "3rd Year": return "Semester 6 (S6)";
      case "4th Year": return "Semester 8 (S8)";
      default: return "";
    }
  } else if (month >= 6 && month <= 7) {
    switch (year) {
      case "1st Year": return "Semester 1 (S1) - Joining Aug";
      case "2nd Year": return "Semester 3 (S3)";
      case "3rd Year": return "Semester 5 (S5)";
      case "4th Year": return "Semester 7 (S7)";
      default: return "";
    }
  } else {
    // August to December (Months 8 to 12)
    switch (year) {
      case "1st Year": return "Semester 1 (S1)";
      case "2nd Year": return "Semester 3 (S3)";
      case "3rd Year": return "Semester 5 (S5)";
      case "4th Year": return "Semester 7 (S7)";
      default: return "";
    }
  }
}

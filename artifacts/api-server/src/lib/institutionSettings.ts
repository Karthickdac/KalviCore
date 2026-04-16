import { db, institutionSettingsTable } from "@workspace/db";

interface InstitutionInfo {
  collegeName: string;
  collegeCode: string;
  affiliatedUniversity: string;
  location: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  principalName: string;
  currentAcademicYear: string;
  currentSemester: string;
  attendanceThreshold: number;
  gradingSystem: string;
  passPercentage: number;
}

const DEFAULTS: Record<string, string> = {
  institution_name: "",
  institution_code: "",
  affiliated_university: "Madurai Kamaraj University",
  institution_location: "Tamil Nadu, India",
  institution_address: "",
  institution_phone: "",
  institution_email: "",
  institution_website: "",
  principal_name: "",
  current_academic_year: "2025-2026",
  current_semester: "Odd",
  attendance_threshold: "75",
  grading_system: "CGPA",
  pass_percentage: "40",
};

let cache: { data: Record<string, string>; ts: number } | null = null;
const CACHE_TTL = 30_000;

async function loadSettings(): Promise<Record<string, string>> {
  if (cache && Date.now() - cache.ts < CACHE_TTL) return cache.data;
  try {
    const rows = await db.select().from(institutionSettingsTable);
    const map: Record<string, string> = { ...DEFAULTS };
    for (const r of rows) map[r.key] = r.value;
    cache = { data: map, ts: Date.now() };
    return map;
  } catch {
    return { ...DEFAULTS };
  }
}

export function clearInstitutionCache() {
  cache = null;
}

export async function getInstitutionInfo(): Promise<InstitutionInfo> {
  const s = await loadSettings();
  return {
    collegeName: s.institution_name || `${s.affiliated_university || "University"} Affiliated College`,
    collegeCode: s.institution_code || "",
    affiliatedUniversity: s.affiliated_university || "Madurai Kamaraj University",
    location: s.institution_location || "Tamil Nadu, India",
    address: s.institution_address || "",
    phone: s.institution_phone || "",
    email: s.institution_email || "",
    website: s.institution_website || "",
    principalName: s.principal_name || "",
    currentAcademicYear: s.current_academic_year || "2025-2026",
    currentSemester: s.current_semester || "Odd",
    attendanceThreshold: Number(s.attendance_threshold || 75),
    gradingSystem: s.grading_system || "CGPA",
    passPercentage: Number(s.pass_percentage || 40),
  };
}

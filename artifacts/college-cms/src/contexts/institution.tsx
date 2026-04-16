import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { useAuth } from "@/contexts/auth";

const API_BASE = import.meta.env.VITE_API_URL || "";

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
}

interface InstitutionContextType {
  info: InstitutionInfo;
  refresh: () => void;
}

const DEFAULT_INFO: InstitutionInfo = {
  collegeName: "",
  collegeCode: "",
  affiliatedUniversity: "Madurai Kamaraj University",
  location: "Tamil Nadu, India",
  address: "",
  phone: "",
  email: "",
  website: "",
  principalName: "",
  currentAcademicYear: "2025-2026",
};

const InstitutionContext = createContext<InstitutionContextType>({ info: DEFAULT_INFO, refresh: () => {} });

export function InstitutionProvider({ children }: { children: ReactNode }) {
  const { token } = useAuth();
  const [info, setInfo] = useState<InstitutionInfo>(DEFAULT_INFO);

  const fetchInfo = useCallback(() => {
    if (!token) return;
    fetch(`${API_BASE}/api/institution-info`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data) setInfo(data); })
      .catch(() => {});
  }, [token]);

  useEffect(() => { fetchInfo(); }, [fetchInfo]);

  return (
    <InstitutionContext.Provider value={{ info, refresh: fetchInfo }}>
      {children}
    </InstitutionContext.Provider>
  );
}

export function useInstitution() {
  return useContext(InstitutionContext);
}

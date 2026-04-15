import { useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth";
import { useListStudents, useListStaff } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Printer, Search, Users, Briefcase, User } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "";

export default function IDCardsPage() {
  const { token } = useAuth();
  const headers = { Authorization: `Bearer ${token}` };
  const [tab, setTab] = useState("students");
  const [selectedId, setSelectedId] = useState("");
  const [search, setSearch] = useState("");
  const printRef = useRef<HTMLDivElement>(null);

  const { data: students = [] } = useListStudents();
  const { data: staff = [] } = useListStaff();

  const { data: idCard } = useQuery({
    queryKey: ["id-card", tab, selectedId],
    queryFn: async () => {
      const type = tab === "students" ? "student" : "staff";
      const res = await fetch(`${API_BASE}/api/id-cards/${type}/${selectedId}`, { headers });
      if (!res.ok) return null;
      const data = await res.json();
      return data.idCard;
    },
    enabled: !!selectedId,
  });

  const filteredStudents = (students as any[]).filter((s: any) => {
    if (!search) return true;
    const name = `${s.firstName} ${s.lastName}`.toLowerCase();
    return name.includes(search.toLowerCase()) || s.rollNumber?.toLowerCase().includes(search.toLowerCase());
  });

  const filteredStaff = (staff as any[]).filter((s: any) => {
    if (!search) return true;
    const name = `${s.firstName} ${s.lastName}`.toLowerCase();
    return name.includes(search.toLowerCase()) || s.staffId?.toLowerCase().includes(search.toLowerCase());
  });

  const handlePrint = () => {
    const content = printRef.current;
    if (!content) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`
      <html><head><title>ID Card</title>
      <style>
        @page { size: 86mm 54mm; margin: 0; }
        body { font-family: Arial, sans-serif; margin: 0; padding: 0; }
        .id-card-print { width: 86mm; margin: auto; }
      </style></head><body>
      ${content.innerHTML}
      </body></html>
    `);
    w.document.close();
    w.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">ID Cards</h1>
          <p className="text-muted-foreground">Generate and print student & staff ID cards.</p>
        </div>
        {idCard && <Button onClick={handlePrint}><Printer className="mr-2 h-4 w-4" />Print ID Card</Button>}
      </div>

      <Tabs value={tab} onValueChange={(v) => { setTab(v); setSelectedId(""); setSearch(""); }}>
        <TabsList>
          <TabsTrigger value="students" className="flex items-center gap-2"><Users className="w-4 h-4" />Student ID</TabsTrigger>
          <TabsTrigger value="staff" className="flex items-center gap-2"><Briefcase className="w-4 h-4" />Staff ID</TabsTrigger>
        </TabsList>

        <TabsContent value="students" className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Select Student</CardTitle></CardHeader>
            <CardContent>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search by name or roll number..." value={search} onChange={e => setSearch(e.target.value)} className="pl-8" />
              </div>
              {search && (
                <div className="mt-2 max-h-48 overflow-y-auto border rounded-md">
                  {filteredStudents.slice(0, 10).map((s: any) => (
                    <button key={s.id} className={`w-full text-left px-3 py-2 hover:bg-accent text-sm ${String(s.id) === selectedId ? "bg-accent" : ""}`}
                      onClick={() => { setSelectedId(String(s.id)); setSearch(""); }}>
                      <span className="font-medium">{s.rollNumber}</span> — {s.firstName} {s.lastName}
                    </button>
                  ))}
                </div>
              )}
              {selectedId && !search && (
                <div className="mt-2">
                  <Badge variant="secondary">{(() => { const st = (students as any[]).find(s => String(s.id) === selectedId); return st ? `${st.firstName} ${st.lastName}` : ""; })()}</Badge>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="staff" className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Select Staff</CardTitle></CardHeader>
            <CardContent>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search by name or staff ID..." value={search} onChange={e => setSearch(e.target.value)} className="pl-8" />
              </div>
              {search && (
                <div className="mt-2 max-h-48 overflow-y-auto border rounded-md">
                  {filteredStaff.slice(0, 10).map((s: any) => (
                    <button key={s.id} className={`w-full text-left px-3 py-2 hover:bg-accent text-sm ${String(s.id) === selectedId ? "bg-accent" : ""}`}
                      onClick={() => { setSelectedId(String(s.id)); setSearch(""); }}>
                      <span className="font-medium">{s.staffId}</span> — {s.firstName} {s.lastName}
                    </button>
                  ))}
                </div>
              )}
              {selectedId && !search && (
                <div className="mt-2">
                  <Badge variant="secondary">{(() => { const st = (staff as any[]).find(s => String(s.id) === selectedId); return st ? `${st.firstName} ${st.lastName}` : ""; })()}</Badge>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {idCard && (
        <div ref={printRef}>
          <div className="max-w-sm mx-auto">
            {/* Front Side */}
            <div className="rounded-xl overflow-hidden shadow-xl border-2 border-blue-200 mb-4">
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 text-white px-4 py-3 text-center">
                <h2 className="text-sm font-bold tracking-wide">ANNA UNIVERSITY AFFILIATED COLLEGE</h2>
                <p className="text-[10px] opacity-80">Tamil Nadu, India</p>
                <div className="mt-1 inline-block bg-white/20 rounded-full px-3 py-0.5">
                  <span className="text-xs font-bold">{idCard.type === "Student" ? "STUDENT" : "STAFF"} IDENTITY CARD</span>
                </div>
              </div>

              {/* Body */}
              <div className="bg-white p-4">
                <div className="flex gap-4">
                  {/* Photo placeholder */}
                  <div className="w-24 h-28 bg-gray-100 border-2 border-gray-300 rounded-lg flex items-center justify-center shrink-0">
                    <User className="w-10 h-10 text-gray-400" />
                  </div>
                  {/* Info */}
                  <div className="flex-1 text-xs space-y-1.5">
                    <div>
                      <p className="text-[10px] text-gray-500 uppercase">Name</p>
                      <p className="font-bold text-sm text-gray-900">{idCard.name}</p>
                    </div>
                    {idCard.type === "Student" ? (
                      <>
                        <div>
                          <p className="text-[10px] text-gray-500 uppercase">Roll Number</p>
                          <p className="font-semibold text-gray-800">{idCard.rollNumber}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-1">
                          <div>
                            <p className="text-[10px] text-gray-500 uppercase">Year</p>
                            <p className="font-medium text-gray-800">{idCard.year}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-gray-500 uppercase">Semester</p>
                            <p className="font-medium text-gray-800">{idCard.semester}</p>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <p className="text-[10px] text-gray-500 uppercase">Staff ID</p>
                          <p className="font-semibold text-gray-800">{idCard.staffId}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-500 uppercase">Designation</p>
                          <p className="font-medium text-gray-800">{idCard.designation}</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-gray-200 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase">Department</p>
                    <p className="font-medium text-gray-800">{idCard.department}</p>
                  </div>
                  {idCard.type === "Student" ? (
                    <div>
                      <p className="text-[10px] text-gray-500 uppercase">Course</p>
                      <p className="font-medium text-gray-800">{idCard.course}</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-[10px] text-gray-500 uppercase">Qualification</p>
                      <p className="font-medium text-gray-800">{idCard.qualification}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase">Blood Group</p>
                    <p className="font-medium text-gray-800">{idCard.bloodGroup || "-"}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase">Phone</p>
                    <p className="font-medium text-gray-800">{idCard.phone}</p>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="bg-gradient-to-r from-blue-700 to-indigo-700 px-4 py-2 flex justify-between items-center">
                <div className="text-[9px] text-white/70">
                  Valid: {new Date().getFullYear()}-{new Date().getFullYear() + 1}
                </div>
                <div className="text-[9px] text-white/70">
                  {idCard.type === "Student" ? `Admitted: ${idCard.admissionDate || "-"}` : `Joined: ${idCard.joiningDate || "-"}`}
                </div>
              </div>
            </div>

            {/* Back Side */}
            <div className="rounded-xl overflow-hidden shadow-xl border-2 border-blue-200">
              <div className="bg-white p-4 text-xs">
                <h3 className="text-center font-bold text-sm mb-3 text-gray-800">IMPORTANT INFORMATION</h3>

                <div className="space-y-2 mb-4">
                  <div className="flex gap-2">
                    <span className="text-gray-500 min-w-[60px]">Email:</span>
                    <span className="font-medium text-gray-800">{idCard.email}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-gray-500 min-w-[60px]">Address:</span>
                    <span className="font-medium text-gray-800">{idCard.address}</span>
                  </div>
                  {idCard.type === "Student" && (
                    <div className="flex gap-2">
                      <span className="text-gray-500 min-w-[60px]">Guardian:</span>
                      <span className="font-medium text-gray-800">{idCard.guardianPhone}</span>
                    </div>
                  )}
                </div>

                <div className="border-t border-gray-200 pt-3 space-y-1 text-[10px] text-gray-600">
                  <p>1. This card is non-transferable and must be carried at all times on campus.</p>
                  <p>2. Loss of card must be reported immediately to the administration.</p>
                  <p>3. If found, please return to the college office.</p>
                </div>

                <div className="flex justify-between items-end mt-6 pt-2">
                  <div className="text-center">
                    <div className="w-24 border-t border-gray-400 pt-1 text-[10px] text-gray-500">Card Holder</div>
                  </div>
                  <div className="text-center">
                    <div className="w-24 border-t border-gray-400 pt-1 text-[10px] text-gray-500">Principal</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const BASE = "http://localhost:8080/api";
let TOKEN = "";

async function login() {
  const r = await fetch(`${BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: "college_admin", password: "Admin@123" }),
  });
  const j = await r.json();
  TOKEN = j.token;
  console.log("Logged in as admin");
}

async function post(path, data) {
  const r = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${TOKEN}` },
    body: JSON.stringify(data),
  });
  if (!r.ok) {
    const t = await r.text();
    console.error(`  FAIL ${path}: ${r.status} ${t.substring(0, 150)}`);
    return null;
  }
  return r.json();
}

async function get(path) {
  const r = await fetch(`${BASE}${path}`, {
    headers: { Authorization: `Bearer ${TOKEN}` },
  });
  return r.json();
}

async function seed() {
  await login();

  const depts = await get("/departments");
  const courses = await get("/courses");
  const subjects = await get("/subjects");
  const existingStaff = await get("/staff");
  const existingStudents = await get("/students");

  const deptById = {};
  const deptByCode = {};
  for (const d of depts) { deptById[d.id] = d; deptByCode[d.code] = d; }

  const courseByCode = {};
  for (const c of courses) courseByCode[c.code] = c;

  const staffIds = existingStaff.map(s => s.id);
  const studentIds = existingStudents.map(s => s.id);

  console.log(`Existing: ${depts.length} depts, ${courses.length} courses, ${subjects.length} subjects, ${staffIds.length} staff, ${studentIds.length} students`);

  // ── STAFF ──
  if (existingStaff.length < 15) {
    const newStaff = [
      { staffId: "FAC007", firstName: "Dr. Anitha", lastName: "R", email: "anitha.r@kalvicore.edu", phone: "9876543101", gender: "Female", dateOfBirth: "1978-05-12", departmentId: 6, designation: "Associate Professor", qualification: "Ph.D Computer Science", specialization: "Machine Learning", experience: 15, joiningDate: "2010-06-15", employmentType: "Regular", salary: 85000 },
      { staffId: "FAC008", firstName: "Prof. Karthik", lastName: "S", email: "karthik.s@kalvicore.edu", phone: "9876543102", gender: "Male", dateOfBirth: "1982-08-20", departmentId: 2, designation: "Assistant Professor", qualification: "M.A. English Literature", specialization: "Victorian Literature", experience: 10, joiningDate: "2014-07-01", employmentType: "Regular", salary: 65000 },
      { staffId: "FAC009", firstName: "Dr. Meena", lastName: "K", email: "meena.k@kalvicore.edu", phone: "9876543103", gender: "Female", dateOfBirth: "1975-12-03", departmentId: 3, designation: "Professor", qualification: "Ph.D Mathematics", specialization: "Number Theory", experience: 20, joiningDate: "2005-08-10", employmentType: "Regular", salary: 95000 },
      { staffId: "FAC010", firstName: "Mr. Rajesh", lastName: "V", email: "rajesh.v@kalvicore.edu", phone: "9876543104", gender: "Male", dateOfBirth: "1985-03-25", departmentId: 4, designation: "Assistant Professor", qualification: "M.Sc Physics", specialization: "Optics", experience: 8, joiningDate: "2016-06-20", employmentType: "Regular", salary: 55000 },
      { staffId: "FAC011", firstName: "Dr. Lakshmi", lastName: "P", email: "lakshmi.p@kalvicore.edu", phone: "9876543105", gender: "Female", dateOfBirth: "1980-07-15", departmentId: 5, designation: "Associate Professor", qualification: "Ph.D Organic Chemistry", specialization: "Polymer Chemistry", experience: 14, joiningDate: "2011-01-10", employmentType: "Regular", salary: 78000 },
      { staffId: "FAC012", firstName: "Mr. Senthil", lastName: "M", email: "senthil.m@kalvicore.edu", phone: "9876543106", gender: "Male", dateOfBirth: "1988-11-08", departmentId: 7, designation: "Assistant Professor", qualification: "M.Com, CA Inter", specialization: "Financial Accounting", experience: 6, joiningDate: "2018-07-15", employmentType: "Contract", salary: 45000 },
      { staffId: "FAC013", firstName: "Dr. Priya", lastName: "N", email: "priya.n@kalvicore.edu", phone: "9876543107", gender: "Female", dateOfBirth: "1979-02-28", departmentId: 8, designation: "Associate Professor", qualification: "Ph.D Economics", specialization: "Development Economics", experience: 16, joiningDate: "2009-03-01", employmentType: "Regular", salary: 82000 },
      { staffId: "FAC014", firstName: "Mr. Kumar", lastName: "A", email: "kumar.a@kalvicore.edu", phone: "9876543108", gender: "Male", dateOfBirth: "1990-06-10", departmentId: 6, designation: "Assistant Professor", qualification: "M.Sc Computer Science", specialization: "Web Technologies", experience: 4, joiningDate: "2020-08-01", employmentType: "Contract", salary: 42000 },
      { staffId: "FAC015", firstName: "Ms. Divya", lastName: "S", email: "divya.s@kalvicore.edu", phone: "9876543109", gender: "Female", dateOfBirth: "1987-09-18", departmentId: 9, designation: "Assistant Professor", qualification: "M.A. History", specialization: "Indian History", experience: 7, joiningDate: "2017-06-15", employmentType: "Regular", salary: 52000 },
    ];
    for (const s of newStaff) {
      if (!s.status) s.status = "Active";
      const r = await post("/staff", s);
      if (r) { staffIds.push(r.id); console.log(`  + Staff: ${s.firstName} ${s.lastName} (dept ${s.departmentId})`); }
    }
  }
  console.log(`✓ Staff: ${staffIds.length} total`);

  // ── STUDENTS ──
  if (existingStudents.length < 20) {
    const newStudents = [
      { rollNumber: "22CS001", firstName: "Arun", lastName: "Kumar", email: "arun.k@student.edu", phone: "9876500001", dateOfBirth: "2004-03-15", gender: "Male", community: "OC", religion: "Hindu", nationality: "Indian", motherTongue: "Tamil", bloodGroup: "O+", address: "12, Gandhi Street", city: "Madurai", district: "Madurai", state: "Tamil Nadu", pincode: "625001", fatherName: "Murugan K", motherName: "Lakshmi M", guardianPhone: "9876600001", guardianOccupation: "Business", annualIncome: 450000, departmentId: 6, courseId: 19, year: 2, semester: 3, batch: "2022-2025", admissionDate: "2022-08-01", admissionType: "Counselling", firstGraduate: false, status: "Active" },
      { rollNumber: "22CS002", firstName: "Divya", lastName: "Shankar", email: "divya.sh@student.edu", phone: "9876500002", dateOfBirth: "2004-07-22", gender: "Female", community: "BC", religion: "Hindu", nationality: "Indian", motherTongue: "Tamil", bloodGroup: "A+", address: "45, Nehru Road", city: "Madurai", district: "Madurai", state: "Tamil Nadu", pincode: "625002", fatherName: "Selvaraj S", motherName: "Rani S", guardianPhone: "9876600002", guardianOccupation: "Teacher", annualIncome: 360000, departmentId: 6, courseId: 19, year: 2, semester: 3, batch: "2022-2025", admissionDate: "2022-08-01", admissionType: "Counselling", firstGraduate: true, status: "Active" },
      { rollNumber: "22CS003", firstName: "Ravi", lastName: "Shankar", email: "ravi.s@student.edu", phone: "9876500003", dateOfBirth: "2004-01-10", gender: "Male", community: "MBC", religion: "Hindu", nationality: "Indian", motherTongue: "Tamil", bloodGroup: "B+", address: "78, Anna Nagar", city: "Madurai", district: "Madurai", state: "Tamil Nadu", pincode: "625020", fatherName: "Shankar R", motherName: "Uma R", guardianPhone: "9876600003", guardianOccupation: "Farmer", annualIncome: 200000, departmentId: 6, courseId: 20, year: 2, semester: 3, batch: "2022-2025", admissionDate: "2022-08-01", admissionType: "Management", firstGraduate: true, scholarshipStatus: "First Graduate", status: "Active" },
      { rollNumber: "22ENG01", firstName: "Priya", lastName: "Mohan", email: "priya.m@student.edu", phone: "9876500004", dateOfBirth: "2004-05-18", gender: "Female", community: "OC", religion: "Hindu", nationality: "Indian", motherTongue: "Tamil", bloodGroup: "AB+", address: "23, Lake View", city: "Madurai", district: "Madurai", state: "Tamil Nadu", pincode: "625007", fatherName: "Mohan M", motherName: "Saroja M", guardianPhone: "9876600004", guardianOccupation: "Engineer", annualIncome: 800000, departmentId: 2, courseId: 11, year: 2, semester: 3, batch: "2022-2025", admissionDate: "2022-08-01", admissionType: "Counselling", status: "Active" },
      { rollNumber: "22ENG02", firstName: "Vignesh", lastName: "R", email: "vignesh.r@student.edu", phone: "9876500005", dateOfBirth: "2004-09-05", gender: "Male", community: "BC", religion: "Hindu", nationality: "Indian", motherTongue: "Tamil", bloodGroup: "O-", address: "56, KK Nagar", city: "Madurai", district: "Madurai", state: "Tamil Nadu", pincode: "625020", fatherName: "Rajan R", motherName: "Geetha R", guardianPhone: "9876600005", guardianOccupation: "Doctor", annualIncome: 1200000, departmentId: 2, courseId: 11, year: 2, semester: 3, batch: "2022-2025", admissionDate: "2022-08-01", admissionType: "Counselling", status: "Active" },
      { rollNumber: "22MAT01", firstName: "Suresh", lastName: "P", email: "suresh.p@student.edu", phone: "9876500006", dateOfBirth: "2003-12-20", gender: "Male", community: "SC", religion: "Hindu", nationality: "Indian", motherTongue: "Tamil", bloodGroup: "A-", address: "34, TVS Nagar", city: "Madurai", district: "Madurai", state: "Tamil Nadu", pincode: "625003", fatherName: "Palani P", motherName: "Mala P", guardianPhone: "9876600006", guardianOccupation: "Worker", annualIncome: 150000, departmentId: 3, courseId: 13, year: 3, semester: 5, batch: "2021-2024", admissionDate: "2021-08-01", admissionType: "Counselling", firstGraduate: true, scholarshipStatus: "SC/ST Scholarship", status: "Active" },
      { rollNumber: "22PHY01", firstName: "Kavitha", lastName: "D", email: "kavitha.d@student.edu", phone: "9876500007", dateOfBirth: "2004-04-12", gender: "Female", community: "OC", religion: "Christian", nationality: "Indian", motherTongue: "Tamil", bloodGroup: "B-", address: "89, Ellis Nagar", city: "Madurai", district: "Madurai", state: "Tamil Nadu", pincode: "625010", fatherName: "David D", motherName: "Mary D", guardianPhone: "9876600007", guardianOccupation: "Lawyer", annualIncome: 900000, departmentId: 4, courseId: 15, year: 2, semester: 3, batch: "2022-2025", admissionDate: "2022-08-01", admissionType: "Management", status: "Active" },
      { rollNumber: "22COM01", firstName: "Keerthana", lastName: "V", email: "keerthana.v@student.edu", phone: "9876500008", dateOfBirth: "2004-08-30", gender: "Female", community: "BC", religion: "Hindu", nationality: "Indian", motherTongue: "Tamil", bloodGroup: "O+", address: "12, Bypass Road", city: "Madurai", district: "Madurai", state: "Tamil Nadu", pincode: "625016", fatherName: "Vijay V", motherName: "Bhuvana V", guardianPhone: "9876600008", guardianOccupation: "Shopkeeper", annualIncome: 300000, departmentId: 7, courseId: 23, year: 1, semester: 1, batch: "2024-2027", admissionDate: "2024-08-01", admissionType: "Counselling", firstGraduate: true, status: "Active" },
      { rollNumber: "22COM02", firstName: "Harish", lastName: "B", email: "harish.b@student.edu", phone: "9876500009", dateOfBirth: "2004-02-14", gender: "Male", community: "MBC", religion: "Hindu", nationality: "Indian", motherTongue: "Tamil", bloodGroup: "AB-", address: "67, Alagappa Street", city: "Madurai", district: "Madurai", state: "Tamil Nadu", pincode: "625001", fatherName: "Bala B", motherName: "Sundari B", guardianPhone: "9876600009", guardianOccupation: "Auto Driver", annualIncome: 180000, departmentId: 7, courseId: 24, year: 1, semester: 1, batch: "2024-2027", admissionDate: "2024-08-01", admissionType: "Counselling", firstGraduate: true, status: "Active" },
      { rollNumber: "22ECO01", firstName: "Nithya", lastName: "R", email: "nithya.r@student.edu", phone: "9876500010", dateOfBirth: "2004-06-25", gender: "Female", community: "OC", religion: "Hindu", nationality: "Indian", motherTongue: "Tamil", bloodGroup: "A+", address: "90, Jawahar Nagar", city: "Madurai", district: "Madurai", state: "Tamil Nadu", pincode: "625005", fatherName: "Ramesh R", motherName: "Vasanthi R", guardianPhone: "9876600010", guardianOccupation: "Bank Manager", annualIncome: 700000, departmentId: 8, courseId: 26, year: 2, semester: 3, batch: "2022-2025", admissionDate: "2022-08-01", admissionType: "Counselling", status: "Active" },
      { rollNumber: "23CS001", firstName: "Tharun", lastName: "G", email: "tharun.g@student.edu", phone: "9876500012", dateOfBirth: "2005-01-20", gender: "Male", community: "OC", religion: "Hindu", nationality: "Indian", motherTongue: "Tamil", bloodGroup: "O+", address: "15, Simmakkal", city: "Madurai", district: "Madurai", state: "Tamil Nadu", pincode: "625001", fatherName: "Ganesh G", motherName: "Deepa G", guardianPhone: "9876600012", guardianOccupation: "Software Engineer", annualIncome: 1000000, departmentId: 6, courseId: 19, year: 1, semester: 1, batch: "2024-2027", admissionDate: "2024-08-01", admissionType: "Counselling", status: "Active" },
      { rollNumber: "23CS002", firstName: "Swetha", lastName: "L", email: "swetha.l@student.edu", phone: "9876500013", dateOfBirth: "2005-04-08", gender: "Female", community: "MBC", religion: "Hindu", nationality: "Indian", motherTongue: "Tamil", bloodGroup: "A+", address: "28, Villapuram", city: "Madurai", district: "Madurai", state: "Tamil Nadu", pincode: "625012", fatherName: "Lingam L", motherName: "Malar L", guardianPhone: "9876600013", guardianOccupation: "Electrician", annualIncome: 240000, departmentId: 6, courseId: 20, year: 1, semester: 1, batch: "2024-2027", admissionDate: "2024-08-01", admissionType: "Management", firstGraduate: true, status: "Active" },
      { rollNumber: "23BOT01", firstName: "Gowtham", lastName: "N", email: "gowtham.n@student.edu", phone: "9876500014", dateOfBirth: "2005-07-12", gender: "Male", community: "BC", religion: "Hindu", nationality: "Indian", motherTongue: "Tamil", bloodGroup: "B+", address: "55, Teppakulam", city: "Madurai", district: "Madurai", state: "Tamil Nadu", pincode: "625002", fatherName: "Narayanan N", motherName: "Shanthi N", guardianPhone: "9876600014", guardianOccupation: "Merchant", annualIncome: 550000, departmentId: 10, courseId: 30, year: 1, semester: 1, batch: "2024-2027", admissionDate: "2024-08-01", admissionType: "Counselling", status: "Active" },
      { rollNumber: "23ZOO01", firstName: "Deepak", lastName: "T", email: "deepak.t@student.edu", phone: "9876500015", dateOfBirth: "2005-10-30", gender: "Male", community: "SC", religion: "Hindu", nationality: "Indian", motherTongue: "Tamil", bloodGroup: "O-", address: "33, Pasumalai", city: "Madurai", district: "Madurai", state: "Tamil Nadu", pincode: "625004", fatherName: "Thangaraj T", motherName: "Parvathi T", guardianPhone: "9876600015", guardianOccupation: "Tailor", annualIncome: 160000, departmentId: 11, courseId: 32, year: 1, semester: 1, batch: "2024-2027", admissionDate: "2024-08-01", admissionType: "Counselling", firstGraduate: true, scholarshipStatus: "SC/ST Scholarship", status: "Active" },
      { rollNumber: "22HIS01", firstName: "Mithun", lastName: "A", email: "mithun.a@student.edu", phone: "9876500016", dateOfBirth: "2003-03-18", gender: "Male", community: "OC", religion: "Hindu", nationality: "Indian", motherTongue: "Tamil", bloodGroup: "AB+", address: "71, Tallakulam", city: "Madurai", district: "Madurai", state: "Tamil Nadu", pincode: "625002", fatherName: "Aravind A", motherName: "Revathi A", guardianPhone: "9876600016", guardianOccupation: "Professor", annualIncome: 950000, departmentId: 9, courseId: 28, year: 3, semester: 5, batch: "2021-2024", admissionDate: "2021-08-01", admissionType: "Counselling", status: "Active" },
      { rollNumber: "22POL01", firstName: "Ananya", lastName: "S", email: "ananya.s@student.edu", phone: "9876500017", dateOfBirth: "2004-11-15", gender: "Female", community: "BC", religion: "Hindu", nationality: "Indian", motherTongue: "Tamil", bloodGroup: "A+", address: "42, Thiruparankundram", city: "Madurai", district: "Madurai", state: "Tamil Nadu", pincode: "625005", fatherName: "Sundar S", motherName: "Devi S", guardianPhone: "9876600017", guardianOccupation: "Accountant", annualIncome: 480000, departmentId: 12, courseId: 34, year: 2, semester: 3, batch: "2022-2025", admissionDate: "2022-08-01", admissionType: "Counselling", status: "Active" },
    ];
    for (const s of newStudents) {
      if (s.firstGraduate === undefined) s.firstGraduate = false;
      const r = await post("/students", s);
      if (r) { studentIds.push(r.id); console.log(`  + Student: ${s.firstName} ${s.lastName} (${s.rollNumber})`); }
    }
  }
  console.log(`✓ Students: ${studentIds.length} total`);

  // ── ATTENDANCE (batch format) ──
  console.log("\n── Attendance ──");
  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
  const sub1 = subjects[0]?.id || 11;
  const sub2 = subjects[1]?.id || 12;
  const records1 = studentIds.slice(0, 10).map(sid => ({ studentId: sid, status: Math.random() > 0.15 ? "Present" : "Absent" }));
  const records2 = studentIds.slice(0, 10).map(sid => ({ studentId: sid, status: Math.random() > 0.2 ? "Present" : "Absent" }));
  await post("/attendance", { subjectId: sub1, date: today, records: records1 });
  await post("/attendance", { subjectId: sub2, date: yesterday, records: records2 });
  console.log("✓ Attendance seeded (2 batch entries)");

  // ── TIMETABLE ──
  console.log("\n── Timetable ──");
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const timeSlots = [
    { s: "09:00", e: "10:00" }, { s: "10:00", e: "11:00" }, { s: "11:15", e: "12:15" },
    { s: "13:00", e: "14:00" }, { s: "14:00", e: "15:00" },
  ];
  let ttCount = 0;
  for (let d = 0; d < 5; d++) {
    for (let t = 0; t < 5; t++) {
      const subIdx = (d * 5 + t) % subjects.length;
      const sub = subjects[subIdx];
      if (sub) {
        const r = await post("/timetable", {
          subjectId: sub.id, staffId: staffIds[t % staffIds.length],
          departmentId: sub.departmentId || 6,
          dayOfWeek: days[d], periodNumber: t + 1,
          startTime: timeSlots[t].s, endTime: timeSlots[t].e,
          room: `Room ${100 + d * 10 + t}`, semester: sub.semester || 1,
          section: "A", academicYear: "2024-25",
        });
        if (r) ttCount++;
      }
    }
  }
  console.log(`✓ Timetable seeded (${ttCount} slots)`);

  // ── EXAMS ──
  console.log("\n── Exams ──");
  const examIds = [];
  const examData = [
    { subjectId: subjects[0]?.id, type: "Internal Assessment 1", maxMarks: 25, passMarks: 10, date: "2025-02-15", startTime: "09:00", endTime: "10:30", duration: 90, venue: "Exam Hall A", semester: 1, academicYear: "2024-25", status: "Completed" },
    { subjectId: subjects[1]?.id, type: "Internal Assessment 1", maxMarks: 25, passMarks: 10, date: "2025-02-16", startTime: "09:00", endTime: "10:30", duration: 90, venue: "Exam Hall B", semester: 1, academicYear: "2024-25", status: "Completed" },
    { subjectId: subjects[2]?.id, type: "Internal Assessment 2", maxMarks: 25, passMarks: 10, date: "2025-04-10", startTime: "09:00", endTime: "10:30", duration: 90, venue: "Exam Hall A", semester: 2, academicYear: "2024-25", status: "Scheduled" },
    { subjectId: subjects[3]?.id, type: "Semester Exam", maxMarks: 100, passMarks: 40, date: "2025-05-15", startTime: "09:00", endTime: "12:00", duration: 180, venue: "Main Hall", semester: 2, academicYear: "2024-25", status: "Scheduled" },
    { subjectId: subjects[4]?.id, type: "Semester Exam", maxMarks: 100, passMarks: 40, date: "2025-05-17", startTime: "09:00", endTime: "12:00", duration: 180, venue: "Main Hall", semester: 2, academicYear: "2024-25", status: "Scheduled" },
  ];
  for (const e of examData) {
    if (!e.subjectId) continue;
    const r = await post("/exams", e);
    if (r) examIds.push(r.id);
  }
  console.log(`✓ Exams seeded (${examIds.length})`);

  // ── EXAM RESULTS ──
  if (examIds.length > 0) {
    for (const sid of studentIds.slice(0, 8)) {
      const marks = Math.floor(Math.random() * 15) + 10;
      await post("/exam-results", { examId: examIds[0], studentId: sid, marksObtained: marks, grade: marks >= 20 ? "A" : marks >= 15 ? "B" : "C", status: "Published" });
    }
  }
  console.log("✓ Exam Results seeded");

  // ── ASSIGNMENTS ──
  console.log("\n── Assignments ──");
  const assignmentIds = [];
  const assignData = [
    { title: "Data Structures - Linked List Implementation", description: "Implement singly and doubly linked lists with all operations", subjectId: subjects[16]?.id || subjects[0]?.id, staffId: staffIds[0], maxMarks: 50, dueDate: "2025-03-15", type: "Assignment", status: "Active" },
    { title: "British Literature Essay", description: "Write a critical analysis of a Shakespeare play", subjectId: subjects[3]?.id || subjects[0]?.id, staffId: staffIds[1], maxMarks: 30, dueDate: "2025-03-20", type: "Essay", status: "Active" },
    { title: "Calculus Problem Set 3", description: "Solve problems 1-20 from Chapter 5 on Integration", subjectId: subjects[7]?.id || subjects[0]?.id, staffId: staffIds[2], maxMarks: 25, dueDate: "2025-03-25", type: "Problem Set", status: "Active" },
    { title: "Physics Lab Report - Optics", description: "Write the lab report for Experiment 5: Refraction", subjectId: subjects[9]?.id || subjects[0]?.id, staffId: staffIds[3 % staffIds.length], maxMarks: 40, dueDate: "2025-04-01", type: "Lab Report", status: "Active" },
    { title: "Commerce Case Study - GST Impact", description: "Analyze the impact of GST on Indian small businesses", subjectId: subjects[20]?.id || subjects[0]?.id, staffId: staffIds[4 % staffIds.length], maxMarks: 100, dueDate: "2025-04-05", type: "Case Study", status: "Active" },
  ];
  for (const a of assignData) {
    const r = await post("/assignments", a);
    if (r) assignmentIds.push(r.id);
  }
  if (assignmentIds.length > 0) {
    for (const sid of studentIds.slice(0, 6)) {
      await post("/assignment-submissions", { assignmentId: assignmentIds[0], studentId: sid, submissionDate: "2025-03-14", marksObtained: Math.floor(Math.random() * 20) + 30, grade: "A", status: "Graded" });
    }
  }
  console.log(`✓ Assignments seeded (${assignmentIds.length})`);

  // ── HOSTELS ──
  console.log("\n── Hostels ──");
  const hostelData = [
    { name: "Vivekananda Boys Hostel", type: "Boys", totalBlocks: 3, totalRooms: 60, wardenName: "Mr. Rajan S", wardenPhone: "9876540001", address: "Campus North Block", facilities: "WiFi, Water Cooler, Study Hall, TV Room", status: "Active" },
    { name: "Sarojini Girls Hostel", type: "Girls", totalBlocks: 2, totalRooms: 40, wardenName: "Ms. Kamala D", wardenPhone: "9876540002", address: "Campus South Block", facilities: "WiFi, Water Cooler, Study Hall, Gym", status: "Active" },
    { name: "International Hostel", type: "Co-ed", totalBlocks: 1, totalRooms: 20, wardenName: "Dr. Thomas J", wardenPhone: "9876540003", address: "Campus East Wing", facilities: "WiFi, AC, Attached Bathroom, Pantry", status: "Active" },
  ];
  const hostelIds = [];
  for (const h of hostelData) {
    const r = await post("/hostels", h);
    if (r) hostelIds.push(r.id);
  }
  const roomIds = [];
  if (hostelIds.length > 0) {
    const rooms = [
      { hostelId: hostelIds[0], roomNumber: "A-101", floor: 1, block: "A", roomType: "Double", capacity: 2, occupancy: 2, amenities: "Fan, Table, Chair", status: "Occupied" },
      { hostelId: hostelIds[0], roomNumber: "A-102", floor: 1, block: "A", roomType: "Triple", capacity: 3, occupancy: 1, amenities: "Fan, Table, Chair", status: "Available" },
      { hostelId: hostelIds[0], roomNumber: "B-201", floor: 2, block: "B", roomType: "Single", capacity: 1, occupancy: 0, amenities: "Fan, Table, Chair, Bookshelf", status: "Available" },
      { hostelId: hostelIds[1], roomNumber: "A-101", floor: 1, block: "A", roomType: "Double", capacity: 2, occupancy: 1, amenities: "Fan, Table, Chair", status: "Available" },
      { hostelId: hostelIds[1], roomNumber: "A-201", floor: 2, block: "A", roomType: "Triple", capacity: 3, occupancy: 3, amenities: "Fan, Table, Chair", status: "Occupied" },
    ];
    for (const rm of rooms) {
      const r = await post("/hostel-rooms", rm);
      if (r) roomIds.push(r.id);
    }
    if (roomIds.length > 0 && studentIds.length > 2) {
      await post("/hostel-allocations", { studentId: studentIds[0], hostelId: hostelIds[0], roomId: roomIds[0], academicYear: "2024-25", allocationDate: "2024-08-15", messType: "Veg", status: "Active" });
      await post("/hostel-allocations", { studentId: studentIds[2], hostelId: hostelIds[0], roomId: roomIds[0], academicYear: "2024-25", allocationDate: "2024-08-15", messType: "Non-Veg", status: "Active" });
      await post("/hostel-complaints", { studentId: studentIds[0], hostelId: hostelIds[0], category: "Maintenance", subject: "Water leakage in bathroom", description: "There is a continuous water leak from the bathroom tap", priority: "High", status: "Open" });
    }
  }
  console.log(`✓ Hostels seeded (${hostelIds.length} hostels, ${roomIds.length} rooms)`);

  // ── TRANSPORT ──
  console.log("\n── Transport ──");
  const routeData = [
    { routeName: "Madurai Central - College", routeNumber: "R01", startPoint: "Madurai Central Bus Stand", endPoint: "KalviCore Campus", distance: "12 km", estimatedTime: "35 min", fare: "1500", status: "Active" },
    { routeName: "Periyar Bus Stand - College", routeNumber: "R02", startPoint: "Periyar Bus Stand", endPoint: "KalviCore Campus", distance: "8 km", estimatedTime: "25 min", fare: "1200", status: "Active" },
    { routeName: "Thiruparankundram - College", routeNumber: "R03", startPoint: "Thiruparankundram", endPoint: "KalviCore Campus", distance: "6 km", estimatedTime: "20 min", fare: "1000", status: "Active" },
    { routeName: "Melur - College", routeNumber: "R04", startPoint: "Melur", endPoint: "KalviCore Campus", distance: "30 km", estimatedTime: "55 min", fare: "2500", status: "Active" },
  ];
  const routeIds = [];
  for (const rt of routeData) {
    const r = await post("/transport-routes", rt);
    if (r) routeIds.push(r.id);
  }
  if (routeIds.length > 0) {
    const vehicles = [
      { vehicleNumber: "TN-59-AB-1234", vehicleType: "Bus", capacity: 52, driverName: "Muthu R", driverPhone: "9876549001", driverLicense: "TN-DL-2020-0001", routeId: routeIds[0], insuranceExpiry: "2025-12-31", fitnessExpiry: "2025-06-30", status: "Active" },
      { vehicleNumber: "TN-59-CD-5678", vehicleType: "Bus", capacity: 48, driverName: "Raju K", driverPhone: "9876549002", driverLicense: "TN-DL-2019-0002", routeId: routeIds[1], insuranceExpiry: "2025-11-30", fitnessExpiry: "2025-08-15", status: "Active" },
      { vehicleNumber: "TN-59-EF-9012", vehicleType: "Mini Bus", capacity: 30, driverName: "Selvam M", driverPhone: "9876549003", driverLicense: "TN-DL-2021-0003", routeId: routeIds[2], insuranceExpiry: "2026-03-31", fitnessExpiry: "2025-10-20", status: "Active" },
      { vehicleNumber: "TN-59-GH-3456", vehicleType: "Bus", capacity: 52, driverName: "Pandian S", driverPhone: "9876549004", driverLicense: "TN-DL-2018-0004", routeId: routeIds[3], insuranceExpiry: "2025-09-30", fitnessExpiry: "2025-05-15", status: "Under Maintenance" },
    ];
    for (const v of vehicles) await post("/transport-vehicles", v);
    const stops = [
      { routeId: routeIds[0], stopName: "Madurai Central", stopOrder: 1, pickupTime: "07:30", dropTime: "17:30", landmark: "Near Central Bus Stand" },
      { routeId: routeIds[0], stopName: "Goripalayam", stopOrder: 2, pickupTime: "07:45", dropTime: "17:15", landmark: "Near Goripalayam Junction" },
      { routeId: routeIds[0], stopName: "Anna Nagar", stopOrder: 3, pickupTime: "08:00", dropTime: "17:00", landmark: "Anna Nagar Bus Stop" },
      { routeId: routeIds[1], stopName: "Periyar Bus Stand", stopOrder: 1, pickupTime: "07:40", dropTime: "17:20", landmark: "Periyar Gate" },
      { routeId: routeIds[1], stopName: "KK Nagar", stopOrder: 2, pickupTime: "07:55", dropTime: "17:05", landmark: "KK Nagar Main Road" },
      { routeId: routeIds[2], stopName: "Thiruparankundram Temple", stopOrder: 1, pickupTime: "08:00", dropTime: "17:00", landmark: "Near Temple Entrance" },
    ];
    const stopIds = [];
    for (const st of stops) {
      const r = await post("/transport-stops", st);
      if (r) stopIds.push(r.id);
    }
    if (stopIds.length > 0 && studentIds.length > 3) {
      await post("/transport-allocations", { studentId: studentIds[2], routeId: routeIds[0], stopId: stopIds[0], academicYear: "2024-25", status: "Active" });
      await post("/transport-allocations", { studentId: studentIds[3], routeId: routeIds[1], stopId: stopIds[3], academicYear: "2024-25", status: "Active" });
    }
  }
  console.log(`✓ Transport seeded (${routeIds.length} routes)`);

  // ── LIBRARY ──
  console.log("\n── Library ──");
  const books = [
    { isbn: "978-0-13-468599-1", title: "Introduction to Algorithms", author: "Thomas H. Cormen", publisher: "MIT Press", edition: "4th", category: "Computer Science", subject: "Algorithms", shelfLocation: "CS-A-01", totalCopies: 10, availableCopies: 7, price: "850", yearOfPublication: "2022" },
    { isbn: "978-0-07-340255-5", title: "Data Communications and Networking", author: "Behrouz A. Forouzan", publisher: "McGraw Hill", edition: "5th", category: "Computer Science", subject: "Networking", shelfLocation: "CS-A-02", totalCopies: 8, availableCopies: 5, price: "750" },
    { isbn: "978-0-19-953980-0", title: "Oxford Advanced Learner's Dictionary", author: "A.S. Hornby", publisher: "Oxford University Press", edition: "10th", category: "English", subject: "Language", shelfLocation: "EN-A-01", totalCopies: 20, availableCopies: 18, price: "1200" },
    { isbn: "978-81-203-4550-8", title: "Engineering Mathematics", author: "B.S. Grewal", publisher: "Khanna Publishers", edition: "44th", category: "Mathematics", subject: "Calculus", shelfLocation: "MA-A-01", totalCopies: 25, availableCopies: 20, price: "480" },
    { isbn: "978-0-07-060068-8", title: "Physical Chemistry", author: "Peter Atkins", publisher: "Oxford", edition: "12th", category: "Chemistry", subject: "Physical Chemistry", shelfLocation: "CH-A-01", totalCopies: 8, availableCopies: 6, price: "920" },
    { isbn: "978-0-321-85656-2", title: "University Physics", author: "Hugh D. Young", publisher: "Pearson", edition: "15th", category: "Physics", subject: "Classical Physics", shelfLocation: "PH-A-01", totalCopies: 10, availableCopies: 8, price: "780" },
    { isbn: "978-81-7319-786-5", title: "Cost Accounting", author: "T.S. Reddy", publisher: "Margham Publications", edition: "12th", category: "Commerce", subject: "Accounting", shelfLocation: "CO-A-01", totalCopies: 15, availableCopies: 13, price: "350" },
    { isbn: "978-0-13-601416-5", title: "Java: The Complete Reference", author: "Herbert Schildt", publisher: "Oracle Press", edition: "12th", category: "Computer Science", subject: "Programming", shelfLocation: "CS-B-01", totalCopies: 12, availableCopies: 8, price: "650" },
    { isbn: "978-0-07-338309-5", title: "Indian Economy", author: "Ramesh Singh", publisher: "McGraw Hill", edition: "15th", category: "Economics", subject: "Indian Economy", shelfLocation: "EC-A-01", totalCopies: 10, availableCopies: 7, price: "550" },
    { isbn: "978-81-250-4650-3", title: "History of Modern India", author: "Bipan Chandra", publisher: "Orient Longman", edition: "1st", category: "History", subject: "Modern History", shelfLocation: "HI-A-01", totalCopies: 8, availableCopies: 6, price: "420" },
  ];
  const bookIds = [];
  for (const b of books) {
    const r = await post("/library-books", b);
    if (r) bookIds.push(r.id);
  }
  if (bookIds.length > 0 && studentIds.length > 4) {
    await post("/library-issued", { bookId: bookIds[0], memberId: studentIds[0], memberType: "Student", issueDate: "2025-03-01", dueDate: "2025-03-15", status: "Issued" });
    await post("/library-issued", { bookId: bookIds[1], memberId: studentIds[1], memberType: "Student", issueDate: "2025-02-20", dueDate: "2025-03-06", returnDate: "2025-03-05", status: "Returned" });
    await post("/library-issued", { bookId: bookIds[3], memberId: studentIds[3], memberType: "Student", issueDate: "2025-03-10", dueDate: "2025-03-24", status: "Issued" });
    await post("/library-issued", { bookId: bookIds[7], memberId: staffIds[0], memberType: "Staff", issueDate: "2025-02-15", dueDate: "2025-04-15", status: "Issued" });
    await post("/library-issued", { bookId: bookIds[2], memberId: studentIds[4], memberType: "Student", issueDate: "2025-01-20", dueDate: "2025-02-03", returnDate: "2025-02-10", fineAmount: "70", fineStatus: "Paid", status: "Returned" });
  }
  console.log(`✓ Library seeded (${bookIds.length} books)`);

  // ── FEE STRUCTURES & PAYMENTS ──
  console.log("\n── Fees ──");
  const feeStructureIds = [];
  const feeStructures = [
    { courseId: 19, academicYear: "2024-25", tuitionFee: 15000, labFee: 2000, libraryFee: 500, examFee: 1500, transportFee: 0, hostelFee: 0, otherFee: 1000, totalFee: 20000 },
    { courseId: 20, academicYear: "2024-25", tuitionFee: 18000, labFee: 3000, libraryFee: 500, examFee: 1500, transportFee: 0, hostelFee: 0, otherFee: 1000, totalFee: 24000 },
    { courseId: 11, academicYear: "2024-25", tuitionFee: 12000, labFee: 0, libraryFee: 500, examFee: 1000, transportFee: 0, hostelFee: 0, otherFee: 500, totalFee: 14000 },
    { courseId: 13, academicYear: "2024-25", tuitionFee: 13000, labFee: 1000, libraryFee: 500, examFee: 1200, transportFee: 0, hostelFee: 0, otherFee: 800, totalFee: 16500 },
    { courseId: 23, academicYear: "2024-25", tuitionFee: 14000, labFee: 500, libraryFee: 500, examFee: 1000, transportFee: 0, hostelFee: 0, otherFee: 500, totalFee: 16500 },
  ];
  for (const f of feeStructures) {
    const r = await post("/fee-structures", f);
    if (r) feeStructureIds.push(r.id);
  }
  if (feeStructureIds.length > 0) {
    let receiptNum = 1;
    for (const sid of studentIds.slice(0, 8)) {
      const paid = Math.random() > 0.3;
      await post("/fee-payments", {
        studentId: sid,
        feeStructureId: feeStructureIds[0],
        amountPaid: paid ? 20000 : 10000,
        paymentDate: "2024-09-15",
        paymentMode: paid ? "Online" : "Cash",
        receiptNumber: `RCP-2024-${String(receiptNum++).padStart(4, "0")}`,
        semester: 1,
        academicYear: "2024-25",
        status: paid ? "Paid" : "Partial",
        remarks: paid ? "Full payment" : "First installment",
      });
    }
  }
  console.log(`✓ Fees seeded (${feeStructureIds.length} structures)`);

  // ── CERTIFICATES ──
  console.log("\n── Certificates ──");
  if (studentIds.length >= 5) {
    const certData = [
      { studentId: studentIds[0], type: "Bonafide Certificate", requestDate: "2025-03-01", issueDate: "2025-03-03", certificateNumber: "BON-2025-001", purpose: "Bank Loan", status: "Issued", approvedBy: "Principal" },
      { studentId: studentIds[1], type: "Transfer Certificate", requestDate: "2025-02-20", purpose: "Higher Studies", status: "Pending" },
      { studentId: studentIds[2], type: "Conduct Certificate", requestDate: "2025-03-05", issueDate: "2025-03-07", certificateNumber: "CON-2025-001", purpose: "Job Application", status: "Issued", approvedBy: "HOD" },
      { studentId: studentIds[3], type: "Study Certificate", requestDate: "2025-03-10", purpose: "Passport Application", status: "Processing" },
      { studentId: studentIds[4], type: "Bonafide Certificate", requestDate: "2025-02-15", issueDate: "2025-02-17", certificateNumber: "BON-2025-002", purpose: "Scholarship", status: "Issued", approvedBy: "Principal" },
    ];
    for (const c of certData) await post("/certificates", c);
  }
  console.log("✓ Certificates seeded");

  // ── SCHOLARSHIPS ──
  console.log("\n── Scholarships ──");
  if (studentIds.length >= 8) {
    const scholarData = [
      { studentId: studentIds[2], scholarshipName: "First Graduate Scholarship", type: "Government", amount: "15000", academicYear: "2024-25", awardDate: "2024-11-15", status: "Awarded", approvedBy: "State Govt" },
      { studentId: studentIds[5], scholarshipName: "SC/ST Scholarship", type: "Government", amount: "25000", academicYear: "2024-25", awardDate: "2024-10-20", status: "Awarded", approvedBy: "Central Govt" },
      { studentId: studentIds[7], scholarshipName: "Merit Scholarship", type: "Institution", amount: "10000", academicYear: "2024-25", status: "Applied" },
      { studentId: studentIds[0], scholarshipName: "Sports Quota Scholarship", type: "Institution", amount: "12000", academicYear: "2024-25", awardDate: "2025-01-10", status: "Awarded" },
    ];
    for (const s of scholarData) await post("/scholarships", s);
  }
  console.log("✓ Scholarships seeded");

  // ── EVENTS ──
  console.log("\n── Events ──");
  const eventData = [
    { title: "Techfest 2025", type: "Technical", description: "Annual technical festival with coding competitions and paper presentations", departmentId: 6, venue: "Main Auditorium", startDate: "2025-03-20", endDate: "2025-03-22", coordinatorName: "Dr. Anitha R", coordinatorPhone: "9876543101", maxParticipants: 500, budget: "200000", status: "Upcoming" },
    { title: "Cultural Night - Kalai Vizha", type: "Cultural", description: "Annual cultural event celebrating art, music, and dance", venue: "Open Air Theatre", startDate: "2025-04-05", endDate: "2025-04-06", coordinatorName: "Prof. Rajesh V", coordinatorPhone: "9876543104", maxParticipants: 1000, budget: "150000", status: "Upcoming" },
    { title: "Sports Day 2025", type: "Sports", description: "Annual inter-departmental sports competition", venue: "College Ground", startDate: "2025-02-28", endDate: "2025-03-01", coordinatorName: "Mr. Arun Kumar", maxParticipants: 800, budget: "100000", status: "Completed" },
    { title: "Guest Lecture - AI in Education", type: "Seminar", description: "Guest lecture by Dr. Ramesh from IIT Madras on AI applications in education", departmentId: 6, venue: "Seminar Hall", startDate: "2025-03-15", coordinatorName: "Dr. Anitha R", maxParticipants: 150, status: "Completed" },
    { title: "Blood Donation Camp", type: "Social Service", description: "Annual blood donation drive in collaboration with Red Cross", venue: "College Health Centre", startDate: "2025-04-15", coordinatorName: "Dr. Sundar", maxParticipants: 200, budget: "30000", status: "Upcoming" },
    { title: "Alumni Meet 2025", type: "Alumni", description: "Annual alumni gathering and networking event", venue: "Conference Hall", startDate: "2025-01-25", coordinatorName: "Principal", maxParticipants: 300, budget: "80000", status: "Completed" },
  ];
  const eventIds = [];
  for (const e of eventData) {
    const r = await post("/events", e);
    if (r) eventIds.push(r.id);
  }
  if (eventIds.length > 0) {
    for (const sid of studentIds.slice(0, 6)) {
      await post("/event-participants", { eventId: eventIds[0], studentId: sid, role: Math.random() > 0.7 ? "Coordinator" : "Participant", registrationDate: "2025-03-10" });
    }
  }
  console.log(`✓ Events seeded (${eventIds.length})`);

  // ── ANNOUNCEMENTS & GRIEVANCES ──
  console.log("\n── Communications ──");
  const announcements = [
    { title: "Semester Exam Schedule Released", content: "The semester examination schedule for April 2025 has been published. Students can download the timetable from the exam section.", type: "Academic", priority: "High", targetAudience: "Students", publishDate: "2025-03-10", postedBy: "Controller of Examinations", status: "Active" },
    { title: "Library Timing Extended", content: "Library will remain open until 9 PM during exam season (April 1 - May 15).", type: "General", priority: "Normal", targetAudience: "All", publishDate: "2025-03-25", expiryDate: "2025-05-15", postedBy: "Librarian", status: "Active" },
    { title: "Fee Payment Deadline", content: "Last date for semester fee payment is March 31, 2025. Late fee of Rs.500 will be charged after the deadline.", type: "Administrative", priority: "Urgent", targetAudience: "Students", publishDate: "2025-03-15", expiryDate: "2025-03-31", postedBy: "Accounts Department", status: "Active" },
    { title: "Campus WiFi Maintenance", content: "Campus WiFi will be unavailable on March 30 from 6 AM to 12 PM for maintenance.", type: "General", priority: "Normal", targetAudience: "All", publishDate: "2025-03-28", expiryDate: "2025-03-30", postedBy: "IT Department", status: "Active" },
    { title: "Placement Drive by TCS", content: "TCS will conduct an on-campus drive on April 10, 2025. Eligible students should register before April 5.", type: "Placement", priority: "High", targetAudience: "Students", departmentId: 6, publishDate: "2025-03-20", postedBy: "Placement Officer", status: "Active" },
  ];
  for (const a of announcements) await post("/announcements", a);
  const grievances = [
    { submittedBy: "Arun Kumar", submitterType: "Student", category: "Infrastructure", subject: "Broken projector in Room 201", description: "The projector in Room 201 has not been working for 2 weeks. It affects our lab sessions.", priority: "High", status: "Open" },
    { submittedBy: "Divya Shankar", submitterType: "Student", category: "Hostel", subject: "Hot water not available", description: "The hot water system in Girls Hostel Block A is not functioning since last week.", priority: "Medium", status: "In Progress", assignedTo: "Hostel Warden" },
    { submittedBy: "Prof. Karthik S", submitterType: "Faculty", category: "Academic", subject: "Need updated textbooks", description: "Current textbooks for Computer Science are outdated. Request procurement of latest edition.", priority: "Medium", status: "Open" },
  ];
  for (const g of grievances) await post("/grievances", g);
  console.log("✓ Communications seeded");

  // ── INVENTORY ──
  console.log("\n── Inventory ──");
  const assets = [
    { assetTag: "AST-2024-001", name: "Dell OptiPlex Desktop", category: "IT Equipment", departmentId: 6, location: "Computer Lab I", purchaseDate: "2024-06-15", purchasePrice: "55000", vendor: "Dell India", warrantyExpiry: "2027-06-15", condition: "Good", status: "Active" },
    { assetTag: "AST-2024-002", name: "BenQ Projector", category: "Audio Visual", departmentId: 6, location: "Seminar Hall", purchaseDate: "2024-03-20", purchasePrice: "75000", vendor: "BenQ India", warrantyExpiry: "2026-03-20", condition: "Good", status: "Active" },
    { assetTag: "AST-2024-003", name: "Microscope Set (10 units)", category: "Lab Equipment", departmentId: 10, location: "Botany Lab", purchaseDate: "2023-08-10", purchasePrice: "120000", vendor: "Olympus India", warrantyExpiry: "2025-08-10", condition: "Good", status: "Active" },
    { assetTag: "AST-2024-004", name: "Library AC Unit (5 Ton)", category: "HVAC", location: "Main Library", purchaseDate: "2022-05-01", purchasePrice: "180000", vendor: "Daikin India", warrantyExpiry: "2025-05-01", condition: "Good", status: "Active" },
    { assetTag: "AST-2024-005", name: "CCTV System 32 Channel", category: "Security", location: "Security Room", purchaseDate: "2023-11-10", purchasePrice: "250000", vendor: "Hikvision", warrantyExpiry: "2026-11-10", condition: "Good", status: "Active" },
    { assetTag: "AST-2024-006", name: "Chemistry Lab Fume Hood", category: "Lab Equipment", departmentId: 5, location: "Chemistry Lab", purchaseDate: "2020-01-15", purchasePrice: "350000", vendor: "Lab Solutions", condition: "Fair", status: "Active" },
  ];
  for (const a of assets) await post("/assets", a);
  const storeItems = [
    { itemCode: "STR-001", name: "A4 Paper Ream (500 sheets)", category: "Stationery", unit: "Reams", currentStock: 150, minimumStock: 50, unitPrice: "250", lastRestockDate: "2025-03-01", supplier: "Sri Vinayaka Papers", status: "Active" },
    { itemCode: "STR-002", name: "Whiteboard Marker (Box of 10)", category: "Stationery", unit: "Boxes", currentStock: 30, minimumStock: 10, unitPrice: "180", lastRestockDate: "2025-02-15", supplier: "Kores India", status: "Active" },
    { itemCode: "STR-003", name: "Printer Toner HP 05A", category: "IT Supplies", unit: "Pieces", currentStock: 8, minimumStock: 5, unitPrice: "3500", lastRestockDate: "2025-01-20", supplier: "HP India", status: "Active" },
    { itemCode: "STR-004", name: "Lab Coat (White)", category: "Lab Supplies", unit: "Pieces", currentStock: 45, minimumStock: 20, unitPrice: "350", supplier: "Uniforms India", status: "Active" },
    { itemCode: "STR-005", name: "Chemical Reagent - HCl", category: "Lab Chemicals", unit: "Litres", currentStock: 5, minimumStock: 3, unitPrice: "450", lastRestockDate: "2025-02-01", supplier: "Merck India", status: "Low Stock" },
  ];
  for (const s of storeItems) await post("/store-items", s);
  console.log("✓ Inventory seeded");

  // ── STAFF LEAVES ──
  console.log("\n── Staff Leaves ──");
  const leaveData = [
    { staffId: staffIds[0], leaveType: "Casual Leave", startDate: "2025-03-10", endDate: "2025-03-11", totalDays: 2, reason: "Personal work", status: "Approved", approvedBy: "HOD" },
    { staffId: staffIds[1], leaveType: "Medical Leave", startDate: "2025-02-20", endDate: "2025-02-24", totalDays: 5, reason: "Viral fever and rest recommended by doctor", status: "Approved", approvedBy: "Principal" },
    { staffId: staffIds[2], leaveType: "Casual Leave", startDate: "2025-04-01", endDate: "2025-04-01", totalDays: 1, reason: "Family function", status: "Pending" },
    { staffId: staffIds[3 % staffIds.length], leaveType: "On Duty", startDate: "2025-03-25", endDate: "2025-03-27", totalDays: 3, reason: "Attending conference at Anna University, Chennai", status: "Approved", approvedBy: "Principal" },
    { staffId: staffIds[4 % staffIds.length], leaveType: "Earned Leave", startDate: "2025-04-15", endDate: "2025-04-20", totalDays: 6, reason: "Annual vacation", status: "Pending" },
  ];
  for (const l of leaveData) await post("/staff-leaves", l);
  console.log("✓ Staff Leaves seeded");

  // ── PAYROLL (month is integer, fields: basicSalary, netSalary) ──
  console.log("\n── Payroll ──");
  for (let i = 0; i < Math.min(6, staffIds.length); i++) {
    const sid = staffIds[i];
    const basic = 45000 + i * 5000;
    const hra = Math.round(basic * 0.2);
    const da = Math.round(basic * 0.3);
    const ta = 3000;
    const pf = Math.round(basic * 0.12);
    const tax = Math.round(basic * 0.05);
    await post("/payroll", { staffId: sid, month: 3, year: 2025, basicSalary: String(basic), hra: String(hra), da: String(da), ta: String(ta), otherAllowances: "0", pf: String(pf), tax: String(tax), otherDeductions: "500", remarks: "March 2025 salary" });
  }
  console.log("✓ Payroll seeded");

  // ── ACADEMIC CALENDAR (timestamps) ──
  console.log("\n── Academic Calendar ──");
  const calendarEvents = [
    { title: "College Reopening", eventType: "Academic", startDate: "2024-08-01T00:00:00.000Z", endDate: "2024-08-01T23:59:59.000Z", description: "Start of academic year 2024-25" },
    { title: "Orientation Program", eventType: "Academic", startDate: "2024-08-02T00:00:00.000Z", endDate: "2024-08-03T23:59:59.000Z", description: "Orientation for first year students" },
    { title: "Pongal Holidays", eventType: "Holiday", startDate: "2025-01-14T00:00:00.000Z", endDate: "2025-01-17T23:59:59.000Z", description: "Pongal festival holidays", isHoliday: "Yes" },
    { title: "Republic Day", eventType: "Holiday", startDate: "2025-01-26T00:00:00.000Z", endDate: "2025-01-26T23:59:59.000Z", description: "Republic Day celebration", isHoliday: "Yes" },
    { title: "Internal Assessment 1", eventType: "Exam", startDate: "2025-02-15T00:00:00.000Z", endDate: "2025-02-22T23:59:59.000Z", description: "First internal assessment for all departments" },
    { title: "Internal Assessment 2", eventType: "Exam", startDate: "2025-04-10T00:00:00.000Z", endDate: "2025-04-17T23:59:59.000Z", description: "Second internal assessment" },
    { title: "Annual Sports Day", eventType: "Event", startDate: "2025-02-28T00:00:00.000Z", endDate: "2025-03-01T23:59:59.000Z", description: "Inter-departmental sports meet" },
    { title: "Semester Exams Begin", eventType: "Exam", startDate: "2025-05-01T00:00:00.000Z", endDate: "2025-05-20T23:59:59.000Z", description: "End semester examinations" },
    { title: "Summer Vacation", eventType: "Holiday", startDate: "2025-05-21T00:00:00.000Z", endDate: "2025-06-30T23:59:59.000Z", description: "Summer break", isHoliday: "Yes" },
    { title: "Tamil New Year", eventType: "Holiday", startDate: "2025-04-14T00:00:00.000Z", endDate: "2025-04-14T23:59:59.000Z", description: "Tamil New Year celebration", isHoliday: "Yes" },
  ];
  for (const c of calendarEvents) await post("/academic-calendar", c);
  console.log("✓ Academic Calendar seeded");

  // ── VISITORS ──
  console.log("\n── Visitors ──");
  const visitorData = [
    { visitorName: "Mr. Rajendran K", phone: "9876548001", purpose: "Parent Meeting", personToMeet: "Dr. Anitha R", department: "Computer Science", numberOfVisitors: 1, status: "Checked In" },
    { visitorName: "Ms. Shalini R", phone: "9876548002", idProofType: "Aadhar", idProofNumber: "XXXX-XXXX-1234", purpose: "Admission Enquiry", personToMeet: "Office Staff", department: "Admissions", numberOfVisitors: 2, vehicleNumber: "TN-59-XY-4567", status: "Checked In" },
    { visitorName: "Mr. Venkat S", phone: "9876548003", purpose: "Guest Lecture", personToMeet: "HOD CS", department: "Computer Science", numberOfVisitors: 1, visitorBadge: "VIP-001", status: "Checked In" },
    { visitorName: "Mr. Kumar M", phone: "9876548004", purpose: "Vendor Meeting", personToMeet: "Purchase Officer", department: "Administration", numberOfVisitors: 1, status: "Checked Out" },
    { visitorName: "Mrs. Lakshmi P", phone: "9876548005", purpose: "Student Pickup", personToMeet: "Security", numberOfVisitors: 1, vehicleNumber: "TN-59-AB-9999", status: "Checked In" },
  ];
  for (const v of visitorData) await post("/visitors", v);
  console.log("✓ Visitors seeded");

  // ── PLACEMENTS ──
  console.log("\n── Placements ──");
  const companies = [
    { name: "Tata Consultancy Services (TCS)", industry: "IT Services", website: "https://www.tcs.com", contactPerson: "Priya Sharma", contactEmail: "placement@tcs.com", contactPhone: "9876547001", address: "ELCOT SEZ, Madurai", status: "Active" },
    { name: "Infosys Ltd", industry: "IT Services", website: "https://www.infosys.com", contactPerson: "Rahul Verma", contactEmail: "campus@infosys.com", contactPhone: "9876547002", status: "Active" },
    { name: "Zoho Corporation", industry: "Software Products", website: "https://www.zoho.com", contactPerson: "Karthik Raman", contactEmail: "recruit@zoho.com", contactPhone: "9876547003", address: "Chennai", status: "Active" },
    { name: "L&T Infotech", industry: "IT Services", contactPerson: "Deepa M", contactEmail: "placement@lti.com", status: "Active" },
    { name: "TVS Motors", industry: "Automobile", website: "https://www.tvsmotor.com", contactPerson: "Suresh K", contactEmail: "hr@tvs.com", address: "Hosur", status: "Active" },
  ];
  const companyIds = [];
  for (const c of companies) {
    const r = await post("/companies", c);
    if (r) companyIds.push(r.id);
  }
  if (companyIds.length > 0) {
    const drives = [
      { companyId: companyIds[0], title: "TCS Campus Recruitment 2025", driveDate: "2025-04-10", packageMin: "350000", packageMax: "700000", eligibilityCriteria: "60% aggregate, No active backlogs", rolesOffered: "Systems Engineer, Digital Engineer", location: "College Campus", driveType: "On-Campus", status: "Upcoming", departmentsEligible: "CS, Mathematics, Commerce" },
      { companyId: companyIds[1], title: "Infosys Power Programmer", driveDate: "2025-04-20", packageMin: "500000", packageMax: "900000", eligibilityCriteria: "70% aggregate in CS/IT", rolesOffered: "Power Programmer", driveType: "On-Campus", status: "Upcoming", departmentsEligible: "CS" },
      { companyId: companyIds[2], title: "Zoho Off-Campus Drive", driveDate: "2025-03-15", packageMin: "600000", packageMax: "1200000", eligibilityCriteria: "Strong problem solving skills", rolesOffered: "Software Developer", driveType: "Off-Campus", status: "Completed", departmentsEligible: "All" },
      { companyId: companyIds[4], title: "TVS Motors Internship", driveDate: "2025-04-25", packageMin: "200000", packageMax: "400000", rolesOffered: "Intern - Data Analytics", driveType: "On-Campus", status: "Upcoming", departmentsEligible: "CS, Commerce, Economics" },
    ];
    const driveIds = [];
    for (const d of drives) {
      const r = await post("/placement-drives", d);
      if (r) driveIds.push(r.id);
    }
    if (driveIds.length > 0) {
      for (const sid of studentIds.slice(0, 5)) {
        await post("/placement-applications", { driveId: driveIds[0], studentId: sid, status: "Applied" });
      }
      if (driveIds.length > 1) {
        await post("/placement-applications", { driveId: driveIds[1], studentId: studentIds[0], status: "Shortlisted", roundsCleared: 1 });
      }
    }
    const training = [
      { title: "Aptitude & Soft Skills Training", trainer: "Mr. Prakash M", trainerOrg: "CareerPoint Academy", startDate: "2025-02-01", endDate: "2025-03-15", duration: "6 weeks", type: "Soft Skills", mode: "Offline", maxParticipants: 100, description: "Comprehensive training covering aptitude, verbal, GD, and interview skills", status: "In Progress" },
      { title: "Python for Data Science", trainer: "Dr. Suresh K", trainerOrg: "NPTEL/IIT Madras", startDate: "2025-03-01", endDate: "2025-04-30", duration: "8 weeks", type: "Technical", mode: "Online", maxParticipants: 50, description: "Python programming with focus on data analysis", status: "In Progress" },
      { title: "AWS Cloud Fundamentals", trainer: "Ms. Deepa R", trainerOrg: "AWS Academy", startDate: "2025-04-15", endDate: "2025-05-15", duration: "4 weeks", type: "Technical", mode: "Hybrid", maxParticipants: 40, status: "Upcoming" },
    ];
    const trainingIds = [];
    for (const t of training) {
      const r = await post("/training-programs", t);
      if (r) trainingIds.push(r.id);
    }
    if (trainingIds.length > 0) {
      for (const sid of studentIds.slice(0, 8)) {
        await post("/training-enrollments", { programId: trainingIds[0], studentId: sid, status: "Enrolled" });
      }
    }
  }
  console.log(`✓ Placements seeded (${companyIds.length} companies)`);

  // ── FUNDRAISING ──
  console.log("\n── Fundraising ──");
  const campaigns = [
    { title: "Smart Classroom Fund", description: "Raise funds to convert 10 traditional classrooms to smart classrooms with interactive boards", goalAmount: "500000", raisedAmount: "325000", startDate: "2024-12-01", endDate: "2025-06-30", category: "Infrastructure", status: "Active", createdBy: "Principal" },
    { title: "Student Welfare Fund", description: "Support economically weaker students with scholarships and study materials", goalAmount: "200000", raisedAmount: "145000", startDate: "2025-01-01", category: "Scholarship", status: "Active", createdBy: "Dean" },
    { title: "Annual Sports Fund", description: "Fund for sports equipment and tournament participation", goalAmount: "100000", raisedAmount: "100000", startDate: "2024-10-01", endDate: "2025-02-28", category: "Sports", status: "Completed", createdBy: "Sports Director" },
  ];
  const campaignIds = [];
  for (const c of campaigns) {
    const r = await post("/fundraising/campaigns", c);
    if (r) campaignIds.push(r.id);
  }
  if (campaignIds.length > 0) {
    const donations = [
      { campaignId: campaignIds[0], donorName: "Alumni Association", donorType: "Organization", donorEmail: "alumni@kalvicore.edu", amount: "200000", paymentMode: "Bank Transfer", transactionId: "ALM-2025-001", donationDate: "2025-01-15", purpose: "Smart Classroom", receiptNumber: "RCP-D-001", status: "Received" },
      { campaignId: campaignIds[0], donorName: "Mr. Ramesh Patel", donorType: "Individual", donorPhone: "9876546001", donorRelation: "Parent", amount: "50000", paymentMode: "Cheque", donationDate: "2025-02-10", purpose: "Smart Classroom", receiptNumber: "RCP-D-002", status: "Received" },
      { campaignId: campaignIds[1], donorName: "Rotary Club Madurai", donorType: "Organization", amount: "75000", paymentMode: "Bank Transfer", donationDate: "2025-01-20", purpose: "Student welfare", receiptNumber: "RCP-D-003", status: "Received" },
      { campaignId: campaignIds[1], donorName: "Dr. Kavitha S", donorType: "Individual", donorRelation: "Faculty", amount: "10000", paymentMode: "UPI", transactionId: "UPI-202502-123", donationDate: "2025-02-28", purpose: "Student support", receiptNumber: "RCP-D-004", status: "Received" },
    ];
    for (const d of donations) await post("/fundraising/donations", d);
  }
  console.log("✓ Fundraising seeded");

  // ── SPORTS ──
  console.log("\n── Sports ──");
  const existingActivities = await get("/sports-activities");
  if (existingActivities.length > 0 && studentIds.length > 5) {
    for (let i = 0; i < Math.min(8, studentIds.length); i++) {
      const act = existingActivities[i % existingActivities.length];
      await post("/sports-enrollments", { activityId: act.id, studentId: studentIds[i], role: i === 0 ? "Captain" : "Member", joinDate: "2024-08-15", bloodGroup: ["A+","B+","O+","AB+"][i%4], medicalFitness: "Fit", status: "Active" });
    }
    await post("/sports-achievements", { activityId: existingActivities[0].id, studentId: studentIds[0], title: "District Cricket Championship - Winner", level: "District", position: "1st Place", eventName: "Madurai District Inter-College Cricket", eventDate: "2025-01-20", venue: "Madurai District Stadium" });
    await post("/sports-achievements", { activityId: existingActivities[2 % existingActivities.length].id, studentId: studentIds[2], title: "NCC Best Cadet Award", level: "State", position: "Best Cadet", eventName: "Tamil Nadu NCC Annual Camp", eventDate: "2025-02-10", venue: "Chennai" });
    await post("/sports-achievements", { activityId: existingActivities[4 % existingActivities.length].id, studentId: studentIds[4], title: "100m Sprint - Gold Medal", level: "State", position: "1st Place", eventName: "TN State Athletic Meet", eventDate: "2025-01-28", venue: "Jawaharlal Nehru Stadium, Chennai" });
  }
  console.log("✓ Sports seeded");

  // ── LAB ──
  console.log("\n── Lab ──");
  const existingLabs = await get("/laboratories");
  if (existingLabs.length > 0) {
    const labSchedules = [
      { labId: existingLabs[0].id, day: "Monday", startTime: "09:00", endTime: "12:00", subjectName: "Physics Practical", batchInfo: "II Year BSc Physics - Batch A", staffName: "Mr. Senthil M", semester: 3, academicYear: "2024-25", status: "Active" },
      { labId: existingLabs[1 % existingLabs.length].id, day: "Monday", startTime: "14:00", endTime: "17:00", subjectName: "Programming Lab", batchInfo: "I Year BSc CS - Batch A", staffName: "Mr. Kumar A", semester: 1, academicYear: "2024-25", status: "Active" },
      { labId: existingLabs[1 % existingLabs.length].id, day: "Tuesday", startTime: "09:00", endTime: "12:00", subjectName: "Data Structures Lab", batchInfo: "II Year BCA - Batch B", staffName: "Dr. Anitha R", semester: 3, academicYear: "2024-25", status: "Active" },
      { labId: existingLabs[2 % existingLabs.length].id, day: "Wednesday", startTime: "09:00", endTime: "12:00", subjectName: "Chemistry Practical", batchInfo: "I Year BSc Chemistry", staffName: "Dr. Priya N", semester: 1, academicYear: "2024-25", status: "Active" },
      { labId: existingLabs[3 % existingLabs.length].id, day: "Thursday", startTime: "14:00", endTime: "17:00", subjectName: "Botany Lab", batchInfo: "II Year BSc Botany", staffName: "Prof. Arumugam P", semester: 3, academicYear: "2024-25", status: "Active" },
      { labId: existingLabs[0].id, day: "Friday", startTime: "09:00", endTime: "12:00", subjectName: "Physics Practical", batchInfo: "I Year BSc Physics", staffName: "Mr. Senthil M", semester: 1, academicYear: "2024-25", status: "Active" },
    ];
    for (const ls of labSchedules) await post("/lab-schedules", ls);
    const moreEquipment = [
      { labId: existingLabs[0].id, name: "Digital Voltmeter", model: "DVM-400", serialNumber: "DVM-2024-001", quantity: 10, condition: "Working", vendor: "Scientific Corp", cost: "8500", status: "Available" },
      { labId: existingLabs[1 % existingLabs.length].id, name: "Network Switch 24-Port", model: "Cisco SG250", serialNumber: "CS-2024-001", quantity: 2, condition: "Working", vendor: "Cisco Systems", cost: "35000", status: "Available" },
      { labId: existingLabs[2 % existingLabs.length].id, name: "Analytical Balance", model: "AB-220", serialNumber: "AB-2024-001", quantity: 4, condition: "Working", vendor: "Mettler Toledo", cost: "65000", status: "Available" },
      { labId: existingLabs[3 % existingLabs.length].id, name: "Compound Microscope", model: "CM-300", serialNumber: "CM-2024-001", quantity: 15, condition: "Working", vendor: "Olympus India", cost: "25000", status: "Available" },
    ];
    for (const eq of moreEquipment) await post("/lab-equipment", eq);
  }
  console.log("✓ Lab seeded");

  // ── DISCIPLINARY ──
  console.log("\n── Disciplinary ──");
  if (studentIds.length > 8) {
    await post("/disciplinary-records", { studentId: studentIds[5], incidentDate: "2025-02-15", category: "Attendance", description: "Continuous absence for 10 days without prior intimation", severity: "Moderate", actionTaken: "Warning letter issued", status: "Resolved", reportedBy: "HOD", remarks: "Student submitted medical certificate later" });
    await post("/disciplinary-records", { studentId: studentIds[8], incidentDate: "2025-03-01", category: "Academic Misconduct", description: "Caught using mobile phone during internal exam", severity: "Serious", actionTaken: "Exam cancelled, re-exam scheduled", status: "Resolved", reportedBy: "Invigilator" });
  }
  console.log("✓ Disciplinary seeded");

  // ── NOTIFICATIONS (subject not title) ──
  console.log("\n── Notifications ──");
  const notifications = [
    { type: "fee", channel: "in-app", subject: "Fee Payment Reminder", message: "Your semester fee payment is pending. Please pay before March 31, 2025.", recipients: "all" },
    { type: "exam", channel: "in-app", subject: "Exam Schedule Published", message: "Internal Assessment 2 schedule has been published. Check the exam section.", recipients: "all" },
    { type: "general", channel: "in-app", subject: "Holiday Notice", message: "College will remain closed on April 14 for Tamil New Year.", recipients: "all" },
    { type: "placement", channel: "in-app", subject: "Placement Drive Registration", message: "TCS campus drive on April 10. Register before April 5.", recipients: "all", departmentId: 6 },
  ];
  for (const n of notifications) await post("/notifications/send", n);
  console.log("✓ Notifications seeded");

  console.log("\n══════════════════════════════════════");
  console.log("✅ ALL MODULES SEEDED SUCCESSFULLY!");
  console.log("══════════════════════════════════════");
}

seed().catch(console.error);

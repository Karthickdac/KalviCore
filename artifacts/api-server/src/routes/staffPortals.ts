import { Router, type IRouter } from "express";
import { db, staffTable, departmentsTable, usersTable, libraryBooksTable, libraryIssuedBooksTable, hostelsTable, hostelRoomsTable, hostelAllocationsTable, hostelComplaintsTable, transportRoutesTable, transportVehiclesTable, transportStopsTable, transportAllocationsTable, studentsTable } from "@workspace/db";
import { eq, and, sql } from "drizzle-orm";
import bcrypt from "bcryptjs";

const router: IRouter = Router();

async function verifyStaffAccess(staffId: string, phone: string): Promise<any | null> {
  if (!staffId || !phone) return null;
  const [staff] = await db.select().from(staffTable).where(
    and(eq(staffTable.staffId, staffId), eq(staffTable.phone, phone))
  );
  return staff || null;
}

function staffResponse(staff: any, dept: any) {
  return {
    id: staff.id,
    staffId: staff.staffId,
    name: `${staff.firstName} ${staff.lastName}`,
    email: staff.email,
    phone: staff.phone,
    designation: staff.designation,
    department: dept?.name || "-",
    departmentId: staff.departmentId,
  };
}

router.post("/staff-portal/login", async (req, res): Promise<void> => {
  try {
    const { staffId, phone } = req.body;
    if (!staffId || !phone) {
      res.status(400).json({ error: "Staff ID and phone are required" });
      return;
    }
    const staff = await verifyStaffAccess(staffId, phone);
    if (!staff) {
      res.status(401).json({ error: "Invalid staff ID or phone number" });
      return;
    }
    const [dept] = staff.departmentId
      ? await db.select().from(departmentsTable).where(eq(departmentsTable.id, staff.departmentId))
      : [null];
    res.json({ staff: staffResponse(staff, dept) });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/portal/login", async (req, res): Promise<void> => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      res.status(400).json({ error: "Username and password are required" });
      return;
    }
    const [user] = await db.select().from(usersTable).where(eq(usersTable.username, username));
    if (!user || !user.isActive) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }
    const staffRecords = await db.select().from(staffTable).where(eq(staffTable.email, user.email));
    const staffRecord = staffRecords[0] || null;
    const studentRecords = await db.select().from(studentsTable).where(eq(studentsTable.email, user.email));
    const studentRecord = studentRecords[0] || null;
    let departmentName = "-";
    const deptId = staffRecord?.departmentId || user.departmentId;
    if (deptId) {
      const [dept] = await db.select().from(departmentsTable).where(eq(departmentsTable.id, deptId));
      if (dept) departmentName = dept.name;
    }
    res.json({
      user: {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        departmentId: user.departmentId,
        department: departmentName,
        staffId: staffRecord?.staffId || null,
        staffRecordId: staffRecord?.id || null,
        studentRecordId: studentRecord?.id || null,
        rollNumber: studentRecord?.rollNumber || null,
        studentName: studentRecord ? `${studentRecord.firstName} ${studentRecord.lastName}` : null,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/librarian-portal/books", async (_req, res): Promise<void> => {
  try {
    const books = await db.select().from(libraryBooksTable);
    res.json(books);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/librarian-portal/issued", async (_req, res): Promise<void> => {
  try {
    const issued = await db.select().from(libraryIssuedBooksTable);
    const enriched = await Promise.all(issued.map(async (i) => {
      const [book] = i.bookId ? await db.select().from(libraryBooksTable).where(eq(libraryBooksTable.id, i.bookId)) : [null];
      const [student] = i.memberId ? await db.select().from(studentsTable).where(eq(studentsTable.id, i.memberId)) : [null];
      return {
        ...i,
        bookTitle: book?.title || "-",
        bookAuthor: book?.author || "-",
        memberName: student ? `${student.firstName} ${student.lastName}` : "-",
        memberRoll: student?.rollNumber || "-",
      };
    }));
    res.json(enriched);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/librarian-portal/stats", async (_req, res): Promise<void> => {
  try {
    const books = await db.select().from(libraryBooksTable);
    const issued = await db.select().from(libraryIssuedBooksTable);
    const totalBooks = books.reduce((s, b) => s + (b.totalCopies || 0), 0);
    const availableBooks = books.reduce((s, b) => s + (b.availableCopies || 0), 0);
    const activeIssued = issued.filter(i => i.status === "Issued").length;
    const overdueCount = issued.filter(i => i.status === "Issued" && i.dueDate && new Date(i.dueDate) < new Date()).length;
    res.json({ totalTitles: books.length, totalBooks, availableBooks, activeIssued, overdueCount, totalFines: issued.reduce((s, i) => s + Number(i.fineAmount || 0), 0) });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/warden-portal/hostels", async (_req, res): Promise<void> => {
  try {
    const hostels = await db.select().from(hostelsTable);
    res.json(hostels);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/warden-portal/rooms", async (_req, res): Promise<void> => {
  try {
    const rooms = await db.select().from(hostelRoomsTable);
    const hostels = await db.select().from(hostelsTable);
    const hostelMap = Object.fromEntries(hostels.map(h => [h.id, h.name]));
    res.json(rooms.map(r => ({ ...r, hostelName: hostelMap[r.hostelId] || "-" })));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/warden-portal/allocations", async (_req, res): Promise<void> => {
  try {
    const allocations = await db.select().from(hostelAllocationsTable);
    const enriched = await Promise.all(allocations.map(async (a) => {
      const [student] = a.studentId ? await db.select().from(studentsTable).where(eq(studentsTable.id, a.studentId)) : [null];
      const [room] = a.roomId ? await db.select().from(hostelRoomsTable).where(eq(hostelRoomsTable.id, a.roomId)) : [null];
      const [hostel] = room?.hostelId ? await db.select().from(hostelsTable).where(eq(hostelsTable.id, room.hostelId)) : [null];
      return {
        ...a,
        studentName: student ? `${student.firstName} ${student.lastName}` : "-",
        rollNumber: student?.rollNumber || "-",
        roomNumber: room?.roomNumber || "-",
        hostelName: hostel?.name || "-",
      };
    }));
    res.json(enriched);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/warden-portal/complaints", async (_req, res): Promise<void> => {
  try {
    const complaints = await db.select().from(hostelComplaintsTable);
    const enriched = await Promise.all(complaints.map(async (c) => {
      const [student] = c.studentId ? await db.select().from(studentsTable).where(eq(studentsTable.id, c.studentId)) : [null];
      return {
        ...c,
        studentName: student ? `${student.firstName} ${student.lastName}` : "-",
        rollNumber: student?.rollNumber || "-",
      };
    }));
    res.json(enriched);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/warden-portal/stats", async (_req, res): Promise<void> => {
  try {
    const hostels = await db.select().from(hostelsTable);
    const rooms = await db.select().from(hostelRoomsTable);
    const allocations = await db.select().from(hostelAllocationsTable);
    const complaints = await db.select().from(hostelComplaintsTable);
    const totalBeds = rooms.reduce((s, r) => s + (r.capacity || 0), 0);
    const occupiedBeds = allocations.filter(a => a.status === "Active").length;
    const pendingComplaints = complaints.filter(c => c.status === "Pending").length;
    res.json({ totalHostels: hostels.length, totalRooms: rooms.length, totalBeds, occupiedBeds, vacantBeds: totalBeds - occupiedBeds, totalAllocations: allocations.length, pendingComplaints });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/transport-portal/routes", async (_req, res): Promise<void> => {
  try {
    const routes = await db.select().from(transportRoutesTable);
    res.json(routes);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/transport-portal/vehicles", async (_req, res): Promise<void> => {
  try {
    const vehicles = await db.select().from(transportVehiclesTable);
    const routes = await db.select().from(transportRoutesTable);
    const routeMap = Object.fromEntries(routes.map(r => [r.id, r.routeName]));
    res.json(vehicles.map(v => ({ ...v, routeName: routeMap[v.routeId] || "-" })));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/transport-portal/stops", async (_req, res): Promise<void> => {
  try {
    const stops = await db.select().from(transportStopsTable);
    const routes = await db.select().from(transportRoutesTable);
    const routeMap = Object.fromEntries(routes.map(r => [r.id, r.routeName]));
    res.json(stops.map(s => ({ ...s, routeName: routeMap[s.routeId] || "-" })));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/transport-portal/allocations", async (_req, res): Promise<void> => {
  try {
    const allocations = await db.select().from(transportAllocationsTable);
    const enriched = await Promise.all(allocations.map(async (a) => {
      const [student] = a.studentId ? await db.select().from(studentsTable).where(eq(studentsTable.id, a.studentId)) : [null];
      const [route] = a.routeId ? await db.select().from(transportRoutesTable).where(eq(transportRoutesTable.id, a.routeId)) : [null];
      return {
        ...a,
        studentName: student ? `${student.firstName} ${student.lastName}` : "-",
        rollNumber: student?.rollNumber || "-",
        routeName: route?.routeName || "-",
      };
    }));
    res.json(enriched);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/transport-portal/stats", async (_req, res): Promise<void> => {
  try {
    const routes = await db.select().from(transportRoutesTable);
    const vehicles = await db.select().from(transportVehiclesTable);
    const stops = await db.select().from(transportStopsTable);
    const allocations = await db.select().from(transportAllocationsTable);
    const activeRoutes = routes.filter(r => r.status === "Active").length;
    const activeVehicles = vehicles.filter(v => v.status === "Active").length;
    res.json({ totalRoutes: routes.length, activeRoutes, totalVehicles: vehicles.length, activeVehicles, totalStops: stops.length, totalAllocations: allocations.length });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

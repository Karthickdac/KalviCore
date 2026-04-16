export default function ModulesSlide() {
  return (
    <div className="w-screen h-screen overflow-hidden relative" style={{ background: "linear-gradient(160deg, #f7faf9 0%, #e6f5f0 100%)" }}>
      <div className="absolute top-0 right-0 w-[30vw] h-full" style={{ background: "linear-gradient(270deg, rgba(13,148,136,0.04) 0%, transparent 100%)" }} />

      <div className="absolute top-[5vh] left-[5vw]">
        <div className="flex items-center gap-[1vw] mb-[1.5vh]">
          <div className="w-[3vw] h-[0.35vh] bg-primary rounded-full" />
          <span className="font-display text-[1.2vw] font-semibold text-primary tracking-widest uppercase">Platform Modules</span>
        </div>
        <h2 className="font-display text-[3.8vw] font-extrabold text-teal-dark leading-[1] tracking-tight">
          Everything a College Needs
        </h2>
      </div>

      <div className="absolute top-[24vh] left-[5vw] right-[5vw] flex gap-[2vw]">
        <div className="flex-1">
          <div className="bg-teal-dark rounded-[0.8vw] p-[1.8vw] mb-[1.5vh]">
            <h3 className="font-display text-[1.4vw] font-bold text-warm mb-[1.5vh]">Academics</h3>
            <p className="font-body text-[1.2vw] text-teal-light/80 leading-relaxed">Departments, Courses, Subjects, Timetable, Assignments, Examinations, CGPA Tracking</p>
          </div>
          <div className="bg-white rounded-[0.8vw] p-[1.8vw] border border-primary/10">
            <h3 className="font-display text-[1.4vw] font-bold text-teal-dark mb-[1.5vh]">Finance</h3>
            <p className="font-body text-[1.2vw] text-muted leading-relaxed">Fee Management, Razorpay Payments, Payroll, Scholarships, Fundraising</p>
          </div>
        </div>

        <div className="flex-1">
          <div className="bg-white rounded-[0.8vw] p-[1.8vw] border border-primary/10 mb-[1.5vh]">
            <h3 className="font-display text-[1.4vw] font-bold text-teal-dark mb-[1.5vh]">People</h3>
            <p className="font-body text-[1.2vw] text-muted leading-relaxed">Students, Staff, Attendance, Leave Management, Student Portal, Parent Portal</p>
          </div>
          <div className="bg-teal-dark rounded-[0.8vw] p-[1.8vw]">
            <h3 className="font-display text-[1.4vw] font-bold text-warm mb-[1.5vh]">Campus</h3>
            <p className="font-body text-[1.2vw] text-teal-light/80 leading-relaxed">Hostels, Transport, Library, Visitors, Inventory, Events</p>
          </div>
        </div>

        <div className="flex-1">
          <div className="bg-white rounded-[0.8vw] p-[1.8vw] border border-primary/10 mb-[1.5vh]">
            <h3 className="font-display text-[1.4vw] font-bold text-teal-dark mb-[1.5vh]">Documents</h3>
            <p className="font-body text-[1.2vw] text-muted leading-relaxed">Hall Tickets, ID Cards, Certificates, Print Templates, Mark Statements</p>
          </div>
          <div className="bg-white rounded-[0.8vw] p-[1.8vw] border border-primary/10">
            <h3 className="font-display text-[1.4vw] font-bold text-teal-dark mb-[1.5vh]">Administration</h3>
            <p className="font-body text-[1.2vw] text-muted leading-relaxed">RBAC, Bulk Import, Data Backup, Audit Logs, Notifications, Communications</p>
          </div>
        </div>
      </div>

      <div className="absolute bottom-[5vh] left-[5vw] right-[5vw] flex items-center gap-[1.5vw]">
        <div className="flex-1 h-[0.3vh] bg-primary/15 rounded-full" />
        <p className="font-display text-[1.3vw] font-semibold text-primary whitespace-nowrap">Built for MKU-affiliated Arts and Science Colleges</p>
        <div className="flex-1 h-[0.3vh] bg-primary/15 rounded-full" />
      </div>
    </div>
  );
}

import { Router, type IRouter } from "express";
import { db, notificationTemplatesTable } from "@workspace/db";
import { eq, and, asc } from "drizzle-orm";
import { requireAuth, requirePermission } from "../middleware/auth";

const router: IRouter = Router();

// SYSTEM TEMPLATES — Comprehensive library of pre-built templates per channel
// Variables use {{name}} placeholders that get substituted at send time.
const SYSTEM_TEMPLATES: Array<{
  code: string; name: string; category: string; channel: string;
  subject: string; body: string; variables: string[]; description?: string;
}> = [
  // ─────────────── ACADEMICS ───────────────
  { code: "exam_schedule_email", name: "Exam Schedule Released", category: "Academic", channel: "email",
    subject: "{{exam_name}} Schedule Released — {{college_name}}",
    body: "Dear {{student_name}},\n\nThe schedule for {{exam_name}} has been released. Please find the details below:\n\nStart Date: {{start_date}}\nEnd Date: {{end_date}}\nReporting Time: {{reporting_time}}\n\nDownload your hall ticket from the student portal at least 3 days prior to the exam. Carry your ID card and hall ticket on every exam day.\n\nFor any clarifications, contact the Examination Cell.\n\nRegards,\nController of Examinations\n{{college_name}}",
    variables: ["student_name", "exam_name", "start_date", "end_date", "reporting_time", "college_name"],
    description: "Sent when a new exam schedule is published" },
  { code: "exam_schedule_whatsapp", name: "Exam Schedule Released", category: "Academic", channel: "whatsapp",
    subject: "Exam Schedule — {{exam_name}}",
    body: "*{{college_name}}*\n\nHi {{student_name}}, the {{exam_name}} schedule is out.\n\n📅 {{start_date}} → {{end_date}}\n⏰ Reporting: {{reporting_time}}\n\nDownload your hall ticket from the student portal.\n\n— Examination Cell",
    variables: ["student_name", "exam_name", "start_date", "end_date", "reporting_time", "college_name"] },
  { code: "exam_schedule_sms", name: "Exam Schedule Released", category: "Academic", channel: "sms",
    subject: "Exam Schedule",
    body: "{{college_name}}: {{exam_name}} starts {{start_date}}. Reporting {{reporting_time}}. Download hall ticket from portal.",
    variables: ["student_name", "exam_name", "start_date", "reporting_time", "college_name"] },

  { code: "hall_ticket_email", name: "Hall Ticket Generated", category: "Academic", channel: "email",
    subject: "Hall Ticket Ready — {{exam_name}}",
    body: "Dear {{student_name}} ({{roll_number}}),\n\nYour hall ticket for {{exam_name}} is now available for download from the student portal.\n\nExam Centre: {{exam_centre}}\nFirst Paper: {{first_paper_date}}\n\nPlease carry the printed hall ticket along with a valid ID proof on every exam day.\n\nRegards,\nController of Examinations\n{{college_name}}",
    variables: ["student_name", "roll_number", "exam_name", "exam_centre", "first_paper_date", "college_name"] },
  { code: "hall_ticket_whatsapp", name: "Hall Ticket Generated", category: "Academic", channel: "whatsapp",
    subject: "Hall Ticket Ready", body: "Hi {{student_name}}, your hall ticket for {{exam_name}} is ready. Download from the student portal. Exam Centre: {{exam_centre}}.",
    variables: ["student_name", "exam_name", "exam_centre"] },

  { code: "result_published_email", name: "Semester Result Published", category: "Academic", channel: "email",
    subject: "Semester {{semester}} Results Published",
    body: "Dear {{student_name}},\n\nThe results for Semester {{semester}} have been published. Please log in to the student portal to view your detailed mark statement.\n\nResult Summary:\nSGPA: {{sgpa}}\nCGPA: {{cgpa}}\nStatus: {{result_status}}\n\nFor any discrepancy, raise a re-evaluation request before {{revaluation_deadline}}.\n\nRegards,\nController of Examinations\n{{college_name}}",
    variables: ["student_name", "semester", "sgpa", "cgpa", "result_status", "revaluation_deadline", "college_name"] },
  { code: "result_published_whatsapp", name: "Semester Result Published", category: "Academic", channel: "whatsapp",
    subject: "Result Out", body: "🎓 Hi {{student_name}}, Sem {{semester}} results are out!\nSGPA: *{{sgpa}}* | CGPA: *{{cgpa}}*\nStatus: {{result_status}}\n\nLog in to the portal for the full mark statement.",
    variables: ["student_name", "semester", "sgpa", "cgpa", "result_status"] },
  { code: "result_published_sms", name: "Semester Result Published", category: "Academic", channel: "sms",
    subject: "Result", body: "{{college_name}}: Sem {{semester}} result published. SGPA {{sgpa}}, CGPA {{cgpa}}. Check portal.",
    variables: ["semester", "sgpa", "cgpa", "college_name"] },

  { code: "internal_marks_email", name: "Internal Marks Published", category: "Academic", channel: "email",
    subject: "Internal Assessment Marks — {{subject_name}}",
    body: "Dear {{student_name}},\n\nThe internal assessment marks for {{subject_name}} have been published.\n\nMarks Obtained: {{marks_obtained}} / {{max_marks}}\nFaculty: {{faculty_name}}\n\nIf you find any discrepancy, please contact your subject faculty within 3 working days.\n\nRegards,\n{{department_name}}\n{{college_name}}",
    variables: ["student_name", "subject_name", "marks_obtained", "max_marks", "faculty_name", "department_name", "college_name"] },

  { code: "class_cancelled_whatsapp", name: "Class Cancellation", category: "Academic", channel: "whatsapp",
    subject: "Class Cancelled",
    body: "📢 *Class Cancelled*\n\nSubject: {{subject_name}}\nDate: {{class_date}}\nTime: {{class_time}}\nReason: {{reason}}\n\nA make-up class will be intimated shortly.\n— {{faculty_name}}",
    variables: ["subject_name", "class_date", "class_time", "reason", "faculty_name"] },
  { code: "class_cancelled_sms", name: "Class Cancellation", category: "Academic", channel: "sms",
    subject: "Class Cancelled", body: "Class cancelled: {{subject_name}} on {{class_date}} at {{class_time}}. Reason: {{reason}}. Make-up TBA.",
    variables: ["subject_name", "class_date", "class_time", "reason"] },

  { code: "assignment_due_email", name: "Assignment Due Reminder", category: "Academic", channel: "email",
    subject: "Reminder: {{assignment_title}} due {{due_date}}",
    body: "Dear {{student_name}},\n\nThis is a reminder that the assignment \"{{assignment_title}}\" for {{subject_name}} is due on {{due_date}} by {{due_time}}.\n\nLate submissions will not be accepted unless prior approval is obtained from the faculty.\n\nRegards,\n{{faculty_name}}",
    variables: ["student_name", "assignment_title", "subject_name", "due_date", "due_time", "faculty_name"] },

  // ─────────────── ATTENDANCE ───────────────
  { code: "low_attendance_email", name: "Low Attendance Warning", category: "Attendance", channel: "email",
    subject: "Attendance Warning — {{student_name}} ({{roll_number}})",
    body: "Dear {{student_name}},\n\nYour current attendance percentage is {{attendance_percent}}%, which is below the institutional minimum of 75%.\n\nDepartment: {{department_name}}\nSemester: {{semester}}\nClasses Attended: {{classes_attended}} / {{total_classes}}\n\nYou are required to maintain at least 75% attendance to be eligible for the end-semester examinations. Kindly take immediate corrective action and meet your mentor for guidance.\n\nThis is a system-generated warning. Parents have also been notified.\n\nRegards,\n{{department_name}}\n{{college_name}}",
    variables: ["student_name", "roll_number", "attendance_percent", "department_name", "semester", "classes_attended", "total_classes", "college_name"] },
  { code: "low_attendance_whatsapp", name: "Low Attendance Warning", category: "Attendance", channel: "whatsapp",
    subject: "Attendance Warning",
    body: "⚠️ *Attendance Warning*\n\n{{student_name}} ({{roll_number}})\nCurrent Attendance: *{{attendance_percent}}%*\n(Min required: 75%)\n\nClasses: {{classes_attended}}/{{total_classes}}\n\nKindly meet your mentor immediately.\n— {{college_name}}",
    variables: ["student_name", "roll_number", "attendance_percent", "classes_attended", "total_classes", "college_name"] },
  { code: "low_attendance_sms", name: "Low Attendance Warning", category: "Attendance", channel: "sms",
    subject: "Attendance Warning", body: "{{college_name}}: {{student_name}} ({{roll_number}}) attendance is {{attendance_percent}}% (below 75%). Take immediate action.",
    variables: ["student_name", "roll_number", "attendance_percent", "college_name"] },

  { code: "absent_today_whatsapp", name: "Daily Absent Alert (Parent)", category: "Attendance", channel: "whatsapp",
    subject: "Absent Today",
    body: "Dear Parent,\n\nYour ward *{{student_name}}* ({{roll_number}}) was marked absent on {{date}}.\n\nIf this is a planned leave, please submit a leave letter to the class mentor.\n\n— {{college_name}}",
    variables: ["student_name", "roll_number", "date", "college_name"] },
  { code: "absent_today_sms", name: "Daily Absent Alert (Parent)", category: "Attendance", channel: "sms",
    subject: "Absent", body: "{{college_name}}: Your ward {{student_name}} ({{roll_number}}) was absent on {{date}}.",
    variables: ["student_name", "roll_number", "date", "college_name"] },

  { code: "detention_email", name: "Detention List Notice", category: "Attendance", channel: "email",
    subject: "Detention Notice — {{exam_name}}",
    body: "Dear {{student_name}},\n\nDue to insufficient attendance ({{attendance_percent}}%), you have been placed on the detention list for {{exam_name}}.\n\nYou will not be permitted to write the upcoming end-semester examinations.\n\nFor condonation, submit the prescribed application form along with valid supporting documents to the HOD before {{condonation_deadline}}.\n\nRegards,\nController of Examinations\n{{college_name}}",
    variables: ["student_name", "attendance_percent", "exam_name", "condonation_deadline", "college_name"] },

  // ─────────────── FEES ───────────────
  { code: "fee_due_email", name: "Fee Due Reminder", category: "Fees", channel: "email",
    subject: "Fee Payment Due — ₹{{amount}} by {{due_date}}",
    body: "Dear {{student_name}},\n\nThis is a reminder that your {{fee_type}} payment of ₹{{amount}} is due on {{due_date}}.\n\nStudent ID: {{roll_number}}\nFee Head: {{fee_type}}\nAmount: ₹{{amount}}\nDue Date: {{due_date}}\n\nYou can pay online through the student portal or visit the accounts office during working hours. A late fee of ₹{{late_fee}} per day will apply after the due date.\n\nFor receipts and payment history, log in to the student portal.\n\nRegards,\nAccounts Office\n{{college_name}}",
    variables: ["student_name", "roll_number", "fee_type", "amount", "due_date", "late_fee", "college_name"] },
  { code: "fee_due_whatsapp", name: "Fee Due Reminder", category: "Fees", channel: "whatsapp",
    subject: "Fee Reminder",
    body: "💰 *Fee Reminder*\n\nDear {{student_name}},\nYour *{{fee_type}}* of ₹{{amount}} is due on *{{due_date}}*.\n\nPay online: {{payment_link}}\n\n— {{college_name}}",
    variables: ["student_name", "fee_type", "amount", "due_date", "payment_link", "college_name"] },
  { code: "fee_due_sms", name: "Fee Due Reminder", category: "Fees", channel: "sms",
    subject: "Fee Due", body: "{{college_name}}: {{fee_type}} of Rs.{{amount}} due on {{due_date}} for {{roll_number}}. Pay via portal.",
    variables: ["fee_type", "amount", "due_date", "roll_number", "college_name"] },

  { code: "fee_overdue_email", name: "Fee Overdue Notice", category: "Fees", channel: "email",
    subject: "URGENT: Fee Overdue — ₹{{amount}}",
    body: "Dear {{student_name}},\n\nYour {{fee_type}} payment of ₹{{amount}} was due on {{due_date}} and has not been received as of today.\n\nA late fee of ₹{{late_fee_total}} has been added. Please clear the dues immediately to avoid further penalties, including detention from upcoming examinations and revocation of hostel/transport facilities.\n\nTotal Payable: ₹{{total_payable}}\n\nFor any difficulty, please contact the accounts office.\n\nRegards,\nAccounts Office\n{{college_name}}",
    variables: ["student_name", "fee_type", "amount", "due_date", "late_fee_total", "total_payable", "college_name"] },

  { code: "fee_paid_email", name: "Fee Payment Confirmation", category: "Fees", channel: "email",
    subject: "Payment Received — ₹{{amount}} ({{receipt_number}})",
    body: "Dear {{student_name}},\n\nWe have received your {{fee_type}} payment.\n\nReceipt No: {{receipt_number}}\nAmount: ₹{{amount}}\nMode: {{payment_mode}}\nDate: {{payment_date}}\nTransaction ID: {{transaction_id}}\n\nDownload your receipt from the student portal.\n\nThank you,\nAccounts Office\n{{college_name}}",
    variables: ["student_name", "fee_type", "receipt_number", "amount", "payment_mode", "payment_date", "transaction_id", "college_name"] },
  { code: "fee_paid_whatsapp", name: "Fee Payment Confirmation", category: "Fees", channel: "whatsapp",
    subject: "Payment Received",
    body: "✅ Payment Received\n\nDear {{student_name}},\n₹{{amount}} for {{fee_type}}.\nReceipt: {{receipt_number}}\nDate: {{payment_date}}\n\nThank you!\n— {{college_name}}",
    variables: ["student_name", "amount", "fee_type", "receipt_number", "payment_date", "college_name"] },
  { code: "fee_paid_sms", name: "Fee Payment Confirmation", category: "Fees", channel: "sms",
    subject: "Payment Received", body: "{{college_name}}: Rs.{{amount}} received for {{fee_type}}. Receipt {{receipt_number}}. Thank you.",
    variables: ["amount", "fee_type", "receipt_number", "college_name"] },

  { code: "scholarship_approved_email", name: "Scholarship Approved", category: "Fees", channel: "email",
    subject: "Congratulations — Scholarship Approved",
    body: "Dear {{student_name}},\n\nWe are pleased to inform you that your application for the *{{scholarship_name}}* has been approved.\n\nAmount: ₹{{scholarship_amount}}\nDisbursement: {{disbursement_date}}\nCredited via: {{disbursement_mode}}\n\nThis amount will be credited to your registered bank account / adjusted against your fees.\n\nRegards,\nScholarship Cell\n{{college_name}}",
    variables: ["student_name", "scholarship_name", "scholarship_amount", "disbursement_date", "disbursement_mode", "college_name"] },

  // ─────────────── ADMISSION ───────────────
  { code: "application_received_email", name: "Application Received", category: "Admission", channel: "email",
    subject: "Application Received — {{application_id}}",
    body: "Dear {{applicant_name}},\n\nThank you for applying to {{college_name}}.\n\nApplication ID: {{application_id}}\nProgramme: {{programme}}\nApplied On: {{applied_date}}\n\nYour application is currently under review. Please retain your application ID for all future correspondence. You will receive a status update within {{review_days}} working days.\n\nFor any queries, contact the Admissions Office.\n\nRegards,\nAdmissions Office\n{{college_name}}",
    variables: ["applicant_name", "application_id", "programme", "applied_date", "review_days", "college_name"] },

  { code: "admission_confirmed_email", name: "Admission Confirmed", category: "Admission", channel: "email",
    subject: "Admission Confirmed — Welcome to {{college_name}}",
    body: "Dear {{applicant_name}},\n\nCongratulations! Your admission to *{{programme}}* at {{college_name}} for the academic year {{academic_year}} has been confirmed.\n\nApplication ID: {{application_id}}\nAdmission No: {{admission_number}}\nReporting Date: {{reporting_date}}\nReporting Venue: {{reporting_venue}}\n\nPlease bring the following documents in original along with two photocopies each: 10th & 12th mark sheets, transfer certificate, conduct certificate, community certificate (if applicable), and passport-size photographs.\n\nWelcome aboard!\n\nRegards,\nAdmissions Office\n{{college_name}}",
    variables: ["applicant_name", "programme", "college_name", "academic_year", "application_id", "admission_number", "reporting_date", "reporting_venue"] },
  { code: "admission_confirmed_whatsapp", name: "Admission Confirmed", category: "Admission", channel: "whatsapp",
    subject: "Admission Confirmed",
    body: "🎉 *Welcome to {{college_name}}!*\n\nDear {{applicant_name}}, your admission to *{{programme}}* is confirmed.\n\nAdmission No: {{admission_number}}\nReport on: {{reporting_date}}\nVenue: {{reporting_venue}}\n\nBring all originals + 2 photocopies.",
    variables: ["college_name", "applicant_name", "programme", "admission_number", "reporting_date", "reporting_venue"] },

  { code: "counselling_schedule_email", name: "Counselling Schedule", category: "Admission", channel: "email",
    subject: "Counselling Schedule — {{programme}}",
    body: "Dear {{applicant_name}},\n\nYou are invited to attend the counselling session for {{programme}}.\n\nDate: {{counselling_date}}\nTime: {{counselling_time}}\nVenue: {{venue}}\n\nDocuments to bring (original + photocopy):\n- Application acknowledgement\n- 10th & 12th mark sheets\n- Transfer certificate\n- Community / EWS certificate (if applicable)\n- Aadhaar card\n- 4 passport size photographs\n\nLate arrivals will not be entertained.\n\nRegards,\nAdmissions Office\n{{college_name}}",
    variables: ["applicant_name", "programme", "counselling_date", "counselling_time", "venue", "college_name"] },

  // ─────────────── LIBRARY ───────────────
  { code: "book_issued_whatsapp", name: "Book Issue Confirmation", category: "Library", channel: "whatsapp",
    subject: "Book Issued",
    body: "📚 Book Issued\n\nMember: {{member_name}}\nBook: *{{book_title}}*\nAuthor: {{book_author}}\nIssue Date: {{issue_date}}\nDue Date: *{{due_date}}*\n\nLate return fine: ₹{{fine_per_day}}/day.\n— Library, {{college_name}}",
    variables: ["member_name", "book_title", "book_author", "issue_date", "due_date", "fine_per_day", "college_name"] },
  { code: "book_due_reminder_email", name: "Book Return Reminder", category: "Library", channel: "email",
    subject: "Reminder: Return \"{{book_title}}\" by {{due_date}}",
    body: "Dear {{member_name}},\n\nThis is a friendly reminder that the following book is due for return:\n\nTitle: {{book_title}}\nAuthor: {{book_author}}\nDue Date: {{due_date}}\n\nKindly return it on or before the due date to avoid a fine of ₹{{fine_per_day}} per day.\n\nRegards,\nLibrary\n{{college_name}}",
    variables: ["member_name", "book_title", "book_author", "due_date", "fine_per_day", "college_name"] },
  { code: "book_overdue_whatsapp", name: "Overdue Book Notice", category: "Library", channel: "whatsapp",
    subject: "Overdue Book",
    body: "⚠️ Overdue: *{{book_title}}*\n\nDue: {{due_date}}\nOverdue by: {{days_overdue}} day(s)\nFine so far: ₹{{fine_amount}}\n\nKindly return immediately.\n— Library, {{college_name}}",
    variables: ["book_title", "due_date", "days_overdue", "fine_amount", "college_name"] },
  { code: "library_fine_email", name: "Library Fine Imposed", category: "Library", channel: "email",
    subject: "Library Fine — ₹{{fine_amount}}",
    body: "Dear {{member_name}},\n\nA library fine of ₹{{fine_amount}} has been imposed on your account.\n\nReason: {{reason}}\nBook: {{book_title}}\nFine Date: {{fine_date}}\n\nKindly settle the fine at the library counter at the earliest. Borrowing privileges are suspended until the fine is cleared.\n\nRegards,\nLibrary\n{{college_name}}",
    variables: ["member_name", "fine_amount", "reason", "book_title", "fine_date", "college_name"] },

  // ─────────────── HOSTEL ───────────────
  { code: "hostel_allocation_email", name: "Hostel Allocation", category: "Hostel", channel: "email",
    subject: "Hostel Room Allocated — {{hostel_name}} / {{room_number}}",
    body: "Dear {{student_name}},\n\nYour hostel accommodation has been confirmed.\n\nHostel: {{hostel_name}}\nBlock: {{block}}\nRoom No: {{room_number}}\nRoom Type: {{room_type}}\nWarden: {{warden_name}} ({{warden_phone}})\n\nReporting Date: {{reporting_date}}\nMess Type: {{mess_type}}\nMonthly Hostel Fee: ₹{{monthly_fee}}\n\nKindly bring the following at the time of joining: bedding, lock & key, toiletries, ID proof, and the joining acknowledgement form.\n\nHostel rules and regulations are available on the student portal. Strict adherence is mandatory.\n\nRegards,\nHostel Office\n{{college_name}}",
    variables: ["student_name", "hostel_name", "block", "room_number", "room_type", "warden_name", "warden_phone", "reporting_date", "mess_type", "monthly_fee", "college_name"] },
  { code: "hostel_allocation_whatsapp", name: "Hostel Allocation", category: "Hostel", channel: "whatsapp",
    subject: "Hostel Allocated",
    body: "🏠 *Hostel Allocated*\n\n{{student_name}}\nHostel: {{hostel_name}}\nRoom: {{room_number}} ({{room_type}})\nWarden: {{warden_name}} — {{warden_phone}}\nReport on: {{reporting_date}}",
    variables: ["student_name", "hostel_name", "room_number", "room_type", "warden_name", "warden_phone", "reporting_date"] },

  { code: "mess_bill_email", name: "Mess Bill Generated", category: "Hostel", channel: "email",
    subject: "Mess Bill — {{billing_month}} (₹{{amount}})",
    body: "Dear {{student_name}},\n\nYour mess bill for {{billing_month}} has been generated.\n\nDays Availed: {{days_availed}}\nRate per day: ₹{{rate_per_day}}\nExtras: ₹{{extras}}\nTotal Amount: ₹{{amount}}\nDue Date: {{due_date}}\n\nDownload the detailed bill from the student portal.\n\nRegards,\nMess Committee\n{{college_name}}",
    variables: ["student_name", "billing_month", "days_availed", "rate_per_day", "extras", "amount", "due_date", "college_name"] },

  { code: "hostel_inspection_whatsapp", name: "Hostel Inspection Notice", category: "Hostel", channel: "whatsapp",
    subject: "Inspection Notice",
    body: "🔍 *Hostel Inspection*\n\nDate: {{inspection_date}}\nTime: {{inspection_time}}\n\nKindly keep your room clean and be present. Visitors will not be allowed during inspection hours.\n— {{warden_name}}",
    variables: ["inspection_date", "inspection_time", "warden_name"] },

  // ─────────────── TRANSPORT ───────────────
  { code: "route_allocation_email", name: "Transport Route Allocated", category: "Transport", channel: "email",
    subject: "Bus Route Allocated — Route {{route_number}}",
    body: "Dear {{student_name}},\n\nYour transport allocation is confirmed.\n\nRoute No: {{route_number}}\nRoute: {{route_name}}\nBoarding Point: {{pickup_point}}\nPickup Time: {{pickup_time}}\nDrop Time: {{drop_time}}\nVehicle: {{vehicle_number}}\nDriver: {{driver_name}} ({{driver_phone}})\n\nMonthly Transport Fee: ₹{{monthly_fee}}\n\nPlease be at the boarding point 5 minutes prior to the scheduled pickup time. The bus will not wait for late comers.\n\nRegards,\nTransport Office\n{{college_name}}",
    variables: ["student_name", "route_number", "route_name", "pickup_point", "pickup_time", "drop_time", "vehicle_number", "driver_name", "driver_phone", "monthly_fee", "college_name"] },
  { code: "route_allocation_whatsapp", name: "Transport Route Allocated", category: "Transport", channel: "whatsapp",
    subject: "Route Allocated",
    body: "🚌 *Route Allocated*\n\n{{student_name}}\nRoute: {{route_number}} — {{route_name}}\nPickup: {{pickup_point}} at {{pickup_time}}\nDrop: {{drop_time}}\nDriver: {{driver_name}} ({{driver_phone}})",
    variables: ["student_name", "route_number", "route_name", "pickup_point", "pickup_time", "drop_time", "driver_name", "driver_phone"] },

  { code: "bus_delay_whatsapp", name: "Bus Delay Notice", category: "Transport", channel: "whatsapp",
    subject: "Bus Delay",
    body: "⏰ *Bus Delay Alert*\n\nRoute {{route_number}} ({{route_name}}) is running approximately {{delay_minutes}} minutes late today.\nReason: {{reason}}\n\nNew expected pickup at {{pickup_point}}: {{new_pickup_time}}.\n— Transport Office",
    variables: ["route_number", "route_name", "delay_minutes", "reason", "pickup_point", "new_pickup_time"] },
  { code: "bus_delay_sms", name: "Bus Delay Notice", category: "Transport", channel: "sms",
    subject: "Bus Delay", body: "{{college_name}}: Route {{route_number}} delayed by {{delay_minutes}} min. New pickup at {{pickup_point}}: {{new_pickup_time}}.",
    variables: ["route_number", "delay_minutes", "pickup_point", "new_pickup_time", "college_name"] },

  // ─────────────── PLACEMENT ───────────────
  { code: "placement_drive_email", name: "Placement Drive Announcement", category: "Placement", channel: "email",
    subject: "Placement Drive — {{company_name}} on {{drive_date}}",
    body: "Dear Students,\n\nWe are pleased to announce a campus recruitment drive.\n\nCompany: {{company_name}}\nRole: {{job_role}}\nCTC: {{ctc}}\nLocation: {{job_location}}\nEligibility: {{eligibility}}\nDrive Date: {{drive_date}}\nReporting Time: {{reporting_time}}\nVenue: {{venue}}\nProcess: {{selection_process}}\n\nInterested and eligible students must register by {{registration_deadline}} through the placement portal. Carry an updated resume, college ID, and writing materials.\n\nRegards,\nPlacement Cell\n{{college_name}}",
    variables: ["company_name", "job_role", "ctc", "job_location", "eligibility", "drive_date", "reporting_time", "venue", "selection_process", "registration_deadline", "college_name"] },
  { code: "placement_drive_whatsapp", name: "Placement Drive Announcement", category: "Placement", channel: "whatsapp",
    subject: "Placement Drive",
    body: "💼 *Placement Drive*\n\nCompany: *{{company_name}}*\nRole: {{job_role}}\nCTC: {{ctc}}\nDate: {{drive_date}} at {{reporting_time}}\nVenue: {{venue}}\n\nEligibility: {{eligibility}}\nRegister by *{{registration_deadline}}* on the placement portal.",
    variables: ["company_name", "job_role", "ctc", "drive_date", "reporting_time", "venue", "eligibility", "registration_deadline"] },

  { code: "interview_schedule_email", name: "Interview Schedule", category: "Placement", channel: "email",
    subject: "Interview Schedule — {{company_name}}",
    body: "Dear {{student_name}},\n\nYou have been shortlisted for the {{round_name}} round with {{company_name}}.\n\nDate: {{interview_date}}\nTime: {{interview_time}}\nVenue: {{venue}}\nMode: {{interview_mode}}\n\nReport 30 minutes prior with your resume, college ID, and government ID proof. Dress code: formals.\n\nBest of luck!\n\nRegards,\nPlacement Cell\n{{college_name}}",
    variables: ["student_name", "round_name", "company_name", "interview_date", "interview_time", "venue", "interview_mode", "college_name"] },

  { code: "offer_letter_email", name: "Offer Letter Issued", category: "Placement", channel: "email",
    subject: "Congratulations — Offer from {{company_name}}",
    body: "Dear {{student_name}},\n\nCongratulations on your selection by *{{company_name}}* for the role of *{{job_role}}*!\n\nCTC: ₹{{ctc}}\nLocation: {{job_location}}\nDate of Joining: {{joining_date}}\n\nThe offer letter has been uploaded to the placement portal. Kindly download, sign, and submit a scanned acceptance copy by {{acceptance_deadline}}.\n\nAll the best for your future endeavours.\n\nRegards,\nPlacement Cell\n{{college_name}}",
    variables: ["student_name", "company_name", "job_role", "ctc", "job_location", "joining_date", "acceptance_deadline", "college_name"] },

  // ─────────────── EVENTS ───────────────
  { code: "event_invite_email", name: "Event Invitation", category: "Event", channel: "email",
    subject: "You're Invited — {{event_name}}",
    body: "Dear {{recipient_name}},\n\nYou are cordially invited to *{{event_name}}*.\n\nDate: {{event_date}}\nTime: {{event_time}}\nVenue: {{venue}}\nGuest of Honour: {{guest_of_honour}}\n\n{{event_description}}\n\nRegistration: {{registration_link}}\n\nWe look forward to your participation.\n\nRegards,\n{{organising_committee}}\n{{college_name}}",
    variables: ["recipient_name", "event_name", "event_date", "event_time", "venue", "guest_of_honour", "event_description", "registration_link", "organising_committee", "college_name"] },
  { code: "event_invite_whatsapp", name: "Event Invitation", category: "Event", channel: "whatsapp",
    subject: "Event Invitation",
    body: "🎉 *{{event_name}}*\n\n📅 {{event_date}} ⏰ {{event_time}}\n📍 {{venue}}\n\n{{event_description}}\n\nRegister: {{registration_link}}",
    variables: ["event_name", "event_date", "event_time", "venue", "event_description", "registration_link"] },

  { code: "event_reminder_whatsapp", name: "Event Reminder", category: "Event", channel: "whatsapp",
    subject: "Event Reminder",
    body: "⏰ Reminder: *{{event_name}}* tomorrow!\n\n📅 {{event_date}} at {{event_time}}\n📍 {{venue}}\n\nSee you there!",
    variables: ["event_name", "event_date", "event_time", "venue"] },

  // ─────────────── ADMINISTRATIVE ───────────────
  { code: "holiday_notice_email", name: "Holiday Notice", category: "Administrative", channel: "email",
    subject: "Holiday Notice — {{holiday_name}} ({{holiday_date}})",
    body: "Dear All,\n\nThe college will remain closed on {{holiday_date}} ({{day_of_week}}) on account of *{{holiday_name}}*.\n\nClasses will resume as per regular schedule on {{resume_date}}.\n\nRegards,\nPrincipal\n{{college_name}}",
    variables: ["holiday_name", "holiday_date", "day_of_week", "resume_date", "college_name"] },
  { code: "holiday_notice_whatsapp", name: "Holiday Notice", category: "Administrative", channel: "whatsapp",
    subject: "Holiday Notice",
    body: "🏛️ *Holiday Notice*\n\nThe college will be closed on *{{holiday_date}}* for {{holiday_name}}.\nClasses resume on {{resume_date}}.\n— {{college_name}}",
    variables: ["holiday_date", "holiday_name", "resume_date", "college_name"] },

  { code: "meeting_schedule_email", name: "Meeting Schedule", category: "Administrative", channel: "email",
    subject: "Meeting — {{meeting_title}} on {{meeting_date}}",
    body: "Dear {{recipient_name}},\n\nYou are requested to attend the following meeting:\n\nTitle: {{meeting_title}}\nDate: {{meeting_date}}\nTime: {{meeting_time}}\nVenue: {{venue}}\nAgenda: {{agenda}}\nChaired by: {{chaired_by}}\n\nKindly confirm your attendance.\n\nRegards,\n{{college_name}}",
    variables: ["recipient_name", "meeting_title", "meeting_date", "meeting_time", "venue", "agenda", "chaired_by", "college_name"] },

  { code: "document_ready_whatsapp", name: "Document Ready for Collection", category: "Administrative", channel: "whatsapp",
    subject: "Document Ready",
    body: "📄 Hi {{student_name}}, your *{{document_name}}* is ready.\n\nCollect it from {{collection_office}} during office hours ({{office_hours}}).\nCarry your ID card.\n— {{college_name}}",
    variables: ["student_name", "document_name", "collection_office", "office_hours", "college_name"] },

  { code: "id_card_renewal_email", name: "ID Card Renewal", category: "Administrative", channel: "email",
    subject: "ID Card Renewal Required",
    body: "Dear {{student_name}},\n\nYour college ID card is due for renewal. Please submit a fresh photograph along with the renewal form to the administrative office before {{renewal_deadline}}.\n\nThe renewed card will be ready within {{processing_days}} working days.\n\nRegards,\nAdministrative Office\n{{college_name}}",
    variables: ["student_name", "renewal_deadline", "processing_days", "college_name"] },

  { code: "grievance_update_email", name: "Grievance Status Update", category: "Administrative", channel: "email",
    subject: "Grievance Update — {{grievance_id}}",
    body: "Dear {{submitter_name}},\n\nThis is to inform you that the status of your grievance has been updated.\n\nGrievance ID: {{grievance_id}}\nSubject: {{subject}}\nNew Status: *{{new_status}}*\nResolution / Comments: {{resolution}}\n\nFor any further clarification, you may visit the grievance redressal cell during office hours.\n\nRegards,\nGrievance Cell\n{{college_name}}",
    variables: ["submitter_name", "grievance_id", "subject", "new_status", "resolution", "college_name"] },

  // ─────────────── EMERGENCY ───────────────
  { code: "emergency_closure_whatsapp", name: "Emergency Closure", category: "Emergency", channel: "whatsapp",
    subject: "URGENT: College Closed",
    body: "🚨 *URGENT NOTICE*\n\nThe college will remain closed on {{date}} due to *{{reason}}*.\n\nAll classes, exams and other activities scheduled for the day stand cancelled. Reschedule will be intimated separately.\n\n— Principal, {{college_name}}",
    variables: ["date", "reason", "college_name"] },
  { code: "emergency_closure_sms", name: "Emergency Closure", category: "Emergency", channel: "sms",
    subject: "URGENT", body: "URGENT: {{college_name}} closed on {{date}} due to {{reason}}. All classes/exams cancelled.",
    variables: ["date", "reason", "college_name"] },
  { code: "emergency_closure_email", name: "Emergency Closure", category: "Emergency", channel: "email",
    subject: "URGENT: College Closed on {{date}}",
    body: "Dear All,\n\nDue to {{reason}}, the college will remain closed on {{date}}.\n\nAll classes, examinations and college activities scheduled for the day stand cancelled. Rescheduling will be communicated separately.\n\nKindly stay safe and follow all advisories issued by local authorities.\n\nRegards,\nPrincipal\n{{college_name}}",
    variables: ["reason", "date", "college_name"] },

  { code: "exam_postponed_whatsapp", name: "Exam Postponed", category: "Emergency", channel: "whatsapp",
    subject: "Exam Postponed",
    body: "⚠️ *Exam Postponed*\n\nSubject: {{subject_name}}\nOriginal Date: {{original_date}}\nNew Date: *{{new_date}}* ({{new_time}})\nReason: {{reason}}\n\nAll other exams remain as per schedule.",
    variables: ["subject_name", "original_date", "new_date", "new_time", "reason"] },

  // ─────────────── STAFF / FACULTY ───────────────
  { code: "leave_approved_email", name: "Leave Application Approved", category: "Staff", channel: "email",
    subject: "Leave Approved — {{leave_dates}}",
    body: "Dear {{staff_name}},\n\nYour leave application has been approved.\n\nLeave Type: {{leave_type}}\nFrom: {{from_date}}\nTo: {{to_date}}\nNo. of days: {{num_days}}\nApproved by: {{approver_name}}\n\nKindly hand over pending work to your substitute and update your auto-responder.\n\nRegards,\nHR\n{{college_name}}",
    variables: ["staff_name", "leave_dates", "leave_type", "from_date", "to_date", "num_days", "approver_name", "college_name"] },
  { code: "leave_rejected_email", name: "Leave Application Rejected", category: "Staff", channel: "email",
    subject: "Leave Application — Status: Rejected",
    body: "Dear {{staff_name}},\n\nWith regret, we inform you that your leave request from {{from_date}} to {{to_date}} could not be approved.\n\nReason: {{rejection_reason}}\n\nKindly speak to your reporting manager for alternate arrangements.\n\nRegards,\nHR\n{{college_name}}",
    variables: ["staff_name", "from_date", "to_date", "rejection_reason", "college_name"] },

  { code: "salary_credited_email", name: "Salary Credited", category: "Staff", channel: "email",
    subject: "Salary for {{salary_month}} Credited",
    body: "Dear {{staff_name}},\n\nYour salary for {{salary_month}} has been credited to your registered bank account.\n\nGross: ₹{{gross_amount}}\nDeductions: ₹{{deductions}}\nNet Pay: *₹{{net_amount}}*\nCredited on: {{credit_date}}\n\nDownload your detailed payslip from the staff portal.\n\nRegards,\nPayroll\n{{college_name}}",
    variables: ["staff_name", "salary_month", "gross_amount", "deductions", "net_amount", "credit_date", "college_name"] },
  { code: "salary_credited_whatsapp", name: "Salary Credited", category: "Staff", channel: "whatsapp",
    subject: "Salary Credited",
    body: "💰 Salary for *{{salary_month}}* credited.\nNet: ₹{{net_amount}}\nDate: {{credit_date}}\n\nPayslip on staff portal.\n— {{college_name}}",
    variables: ["salary_month", "net_amount", "credit_date", "college_name"] },

  { code: "credentials_email", name: "Login Credentials", category: "Account", channel: "email",
    subject: "Your {{college_name}} Login Credentials",
    body: "Dear {{recipient_name}},\n\nYour login account for {{college_name}} portal has been created.\n\nUsername: {{username}}\nTemporary Password: {{password}}\nLogin URL: {{login_url}}\n\nFor security, please change your password upon first login. Do not share these credentials with anyone.\n\nIf you did not request this account, contact the IT helpdesk immediately.\n\nRegards,\nIT Helpdesk\n{{college_name}}",
    variables: ["recipient_name", "college_name", "username", "password", "login_url"] },

  { code: "password_reset_email", name: "Password Reset", category: "Account", channel: "email",
    subject: "Password Reset — {{college_name}} Portal",
    body: "Dear {{recipient_name}},\n\nA password reset has been requested for your account.\n\nUsername: {{username}}\nNew Temporary Password: {{password}}\n\nKindly log in and change your password immediately.\n\nIf you did not request this reset, contact IT helpdesk at once.\n\nRegards,\nIT Helpdesk\n{{college_name}}",
    variables: ["recipient_name", "username", "password", "college_name"] },
];

router.get("/notification-templates", requireAuth, requirePermission("notifications"), async (req, res): Promise<void> => {
  try {
    const channel = req.query.channel as string | undefined;
    const category = req.query.category as string | undefined;
    const conditions: any[] = [];
    if (channel && channel !== "all") conditions.push(eq(notificationTemplatesTable.channel, channel));
    if (category && category !== "all") conditions.push(eq(notificationTemplatesTable.category, category));
    const rows = conditions.length > 0
      ? await db.select().from(notificationTemplatesTable).where(and(...conditions)).orderBy(asc(notificationTemplatesTable.category), asc(notificationTemplatesTable.name))
      : await db.select().from(notificationTemplatesTable).orderBy(asc(notificationTemplatesTable.category), asc(notificationTemplatesTable.name));
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/notification-templates/categories", requireAuth, requirePermission("notifications"), async (_req, res): Promise<void> => {
  try {
    const rows = await db.selectDistinct({ category: notificationTemplatesTable.category }).from(notificationTemplatesTable);
    res.json(rows.map(r => r.category).sort());
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/notification-templates/:id", requireAuth, requirePermission("notifications"), async (req, res): Promise<void> => {
  const [row] = await db.select().from(notificationTemplatesTable).where(eq(notificationTemplatesTable.id, Number(req.params.id)));
  if (!row) { res.status(404).json({ error: "Not found" }); return; }
  res.json(row);
});

router.post("/notification-templates", requireAuth, requirePermission("notifications"), async (req, res): Promise<void> => {
  try {
    const { code, name, category, channel, subject, body, variables, description, isActive } = req.body;
    if (!code || !name || !category || !channel || !subject || !body) {
      res.status(400).json({ error: "Missing required fields" }); return;
    }
    const [existing] = await db.select().from(notificationTemplatesTable).where(eq(notificationTemplatesTable.code, code));
    if (existing) { res.status(409).json({ error: "Template code already exists" }); return; }
    const [row] = await db.insert(notificationTemplatesTable).values({
      code, name, category, channel, subject, body,
      variables: Array.isArray(variables) ? variables : [],
      description: description || null,
      isSystem: false,
      isActive: isActive !== undefined ? Boolean(isActive) : true,
    }).returning();
    res.status(201).json(row);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.patch("/notification-templates/:id", requireAuth, requirePermission("notifications"), async (req, res): Promise<void> => {
  try {
    const [existing] = await db.select().from(notificationTemplatesTable).where(eq(notificationTemplatesTable.id, Number(req.params.id)));
    if (!existing) { res.status(404).json({ error: "Not found" }); return; }
    const { name, category, channel, subject, body, variables, description, isActive } = req.body;
    const updates: any = { updatedAt: new Date() };

    if (existing.isSystem) {
      // System templates are immutable except for the active toggle
      if (isActive !== undefined) updates.isActive = Boolean(isActive);
      const otherFieldChanged = [name, category, channel, subject, body, variables, description].some(v => v !== undefined);
      if (otherFieldChanged) {
        res.status(403).json({ error: "System templates are read-only. Only the Active toggle can be changed." });
        return;
      }
    } else {
      if (name !== undefined) updates.name = name;
      if (category !== undefined) updates.category = category;
      if (channel !== undefined) updates.channel = channel;
      if (subject !== undefined) updates.subject = subject;
      if (body !== undefined) updates.body = body;
      if (variables !== undefined) updates.variables = variables;
      if (description !== undefined) updates.description = description;
      if (isActive !== undefined) updates.isActive = Boolean(isActive);
    }

    const [row] = await db.update(notificationTemplatesTable).set(updates).where(eq(notificationTemplatesTable.id, Number(req.params.id))).returning();
    res.json(row);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/notification-templates/:id", requireAuth, requirePermission("notifications"), async (req, res): Promise<void> => {
  try {
    const [existing] = await db.select().from(notificationTemplatesTable).where(eq(notificationTemplatesTable.id, Number(req.params.id)));
    if (!existing) { res.status(404).json({ error: "Not found" }); return; }
    if (existing.isSystem) { res.status(400).json({ error: "System templates cannot be deleted. Disable it instead." }); return; }
    await db.delete(notificationTemplatesTable).where(eq(notificationTemplatesTable.id, Number(req.params.id)));
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Re-seed/Refresh — inserts any system templates that don't exist by code
router.post("/notification-templates/seed", requireAuth, requirePermission("notifications"), async (_req, res): Promise<void> => {
  try {
    let inserted = 0;
    for (const t of SYSTEM_TEMPLATES) {
      const [existing] = await db.select().from(notificationTemplatesTable).where(eq(notificationTemplatesTable.code, t.code));
      if (!existing) {
        await db.insert(notificationTemplatesTable).values({
          code: t.code, name: t.name, category: t.category, channel: t.channel,
          subject: t.subject, body: t.body, variables: t.variables,
          description: t.description || null, isSystem: true, isActive: true,
        });
        inserted++;
      }
    }
    res.json({ inserted, total: SYSTEM_TEMPLATES.length });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export async function seedSystemTemplatesOnStartup() {
  try {
    let inserted = 0;
    for (const t of SYSTEM_TEMPLATES) {
      const [existing] = await db.select().from(notificationTemplatesTable).where(eq(notificationTemplatesTable.code, t.code));
      if (!existing) {
        await db.insert(notificationTemplatesTable).values({
          code: t.code, name: t.name, category: t.category, channel: t.channel,
          subject: t.subject, body: t.body, variables: t.variables,
          description: t.description || null, isSystem: true, isActive: true,
        });
        inserted++;
      }
    }
    if (inserted > 0) console.log(`[notification-templates] Seeded ${inserted} system templates`);
  } catch (err: any) {
    console.error("[notification-templates] Seed failed:", err.message);
  }
}

export default router;

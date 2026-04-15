import { Router, type IRouter } from "express";
import healthRouter from "./health";
import departmentsRouter from "./departments";
import studentsRouter from "./students";
import staffRouter from "./staff";
import coursesRouter from "./courses";
import subjectsRouter from "./subjects";
import attendanceRouter from "./attendance";
import feesRouter from "./fees";
import examsRouter from "./exams";
import dashboardRouter from "./dashboard";
import razorpayRouter from "./razorpay";

const router: IRouter = Router();

router.use(healthRouter);
router.use(dashboardRouter);
router.use(departmentsRouter);
router.use(studentsRouter);
router.use(staffRouter);
router.use(coursesRouter);
router.use(subjectsRouter);
router.use(attendanceRouter);
router.use(feesRouter);
router.use(examsRouter);
router.use(razorpayRouter);

export default router;

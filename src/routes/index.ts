import { Router } from "express";
import { adminRouter } from "../modules/admin/admin.routes";
import { authRouter } from "../modules/auth/auth.routes";
import { bookingRouter } from "../modules/booking/booking.routes";
import { categoryRouter } from "../modules/category/category.routes";
import { paymentRouter } from "../modules/payment/payment.routes";
import { reviewRouter } from "../modules/review/review.routes";
import { serviceRouter } from "../modules/service/service.routes";
import { publicTechnicianRouter, technicianDashboardRouter } from "../modules/technician/technician.routes";
import { userRouter } from "../modules/user/user.routes";

export const apiRouter = Router();

apiRouter.use("/auth", authRouter);
apiRouter.use("/users", userRouter);
apiRouter.use("/categories", categoryRouter);
apiRouter.use("/services", serviceRouter);
apiRouter.use("/technicians", publicTechnicianRouter);
apiRouter.use("/technician", technicianDashboardRouter);
apiRouter.use("/bookings", bookingRouter);
apiRouter.use("/payments", paymentRouter);
apiRouter.use("/reviews", reviewRouter);
apiRouter.use("/admin", adminRouter);

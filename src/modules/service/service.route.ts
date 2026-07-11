import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middlewares/auth";
import { validateRequest } from "../../middlewares/validateRequest";
import { serviceController } from "./service.controller";
import { serviceValidation } from "./service.validation";

const router = Router();

router.get("/", validateRequest(serviceValidation.query), serviceController.getAll);
router.get("/my-services", auth(Role.TECHNICIAN), serviceController.getMyServices);
router.get("/:id", validateRequest(serviceValidation.idParam), serviceController.getById);
router.post("/", auth(Role.TECHNICIAN), validateRequest(serviceValidation.create), serviceController.create);
router.patch("/:id", auth(Role.TECHNICIAN, Role.ADMIN), validateRequest(serviceValidation.update), serviceController.update);
router.delete("/:id", auth(Role.TECHNICIAN, Role.ADMIN), validateRequest(serviceValidation.idParam), serviceController.remove);

export const serviceRoutes = router;
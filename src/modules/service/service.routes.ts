import { Role } from "@prisma/client";
import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate";
import { validateRequest } from "../../middlewares/validateRequest";
import { serviceController } from "./service.controller";
import { createServiceSchema, serviceIdSchema, serviceQuerySchema, updateServiceSchema } from "./service.schemas";

export const serviceRouter = Router();
serviceRouter.get("/", validateRequest(serviceQuerySchema), serviceController.list);
serviceRouter.get("/mine", authenticate(Role.TECHNICIAN), serviceController.mine);
serviceRouter.get("/:id", validateRequest(serviceIdSchema), serviceController.getById);
serviceRouter.post("/", authenticate(Role.TECHNICIAN), validateRequest(createServiceSchema), serviceController.create);
serviceRouter.patch("/:id", authenticate(Role.TECHNICIAN, Role.ADMIN), validateRequest(updateServiceSchema), serviceController.update);
serviceRouter.delete("/:id", authenticate(Role.TECHNICIAN, Role.ADMIN), validateRequest(serviceIdSchema), serviceController.archive);

import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middlewares/auth";
import { validateRequest } from "../../middlewares/validateRequest";
import { categoryController } from "./category.controller";
import { categoryValidation } from "./category.validation";

const router = Router();

router.get("/", categoryController.getAll);
router.post("/", auth(Role.ADMIN), validateRequest(categoryValidation.create), categoryController.create);
router.patch("/:id", auth(Role.ADMIN), validateRequest(categoryValidation.update), categoryController.update);
router.delete("/:id", auth(Role.ADMIN), validateRequest(categoryValidation.idParam), categoryController.remove);

export const categoryRoutes = router;
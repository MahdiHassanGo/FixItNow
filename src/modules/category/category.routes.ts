import { Role } from "@prisma/client";
import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate";
import { validateRequest } from "../../middlewares/validateRequest";
import { categoryController } from "./category.controller";
import { categoryIdSchema, createCategorySchema, updateCategorySchema } from "./category.schemas";

export const categoryRouter = Router();
categoryRouter.get("/", categoryController.list);
categoryRouter.post("/", authenticate(Role.ADMIN), validateRequest(createCategorySchema), categoryController.create);
categoryRouter.patch("/:id", authenticate(Role.ADMIN), validateRequest(updateCategorySchema), categoryController.update);
categoryRouter.delete("/:id", authenticate(Role.ADMIN), validateRequest(categoryIdSchema), categoryController.remove);

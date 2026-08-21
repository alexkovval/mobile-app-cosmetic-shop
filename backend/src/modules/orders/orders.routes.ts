import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware";
import { asyncHandler } from "../../middleware/error.middleware";
import { validate } from "../../middleware/validate.middleware";
import { createOrderHandler, getOrderHandler, listOrdersHandler } from "./orders.controller";
import { createOrderSchema } from "./orders.schema";

const router = Router();

router.use(requireAuth);

router.post("/", validate({ body: createOrderSchema }), asyncHandler(createOrderHandler));
router.get("/", asyncHandler(listOrdersHandler));
router.get("/:id", asyncHandler(getOrderHandler));

export default router;

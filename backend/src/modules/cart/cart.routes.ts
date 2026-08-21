import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware";
import { asyncHandler } from "../../middleware/error.middleware";
import { validate } from "../../middleware/validate.middleware";
import {
  addCartItemHandler,
  getCartHandler,
  removeCartItemHandler,
  updateCartItemHandler,
} from "./cart.controller";
import { addCartItemSchema, cartItemIdParamsSchema, updateCartItemSchema } from "./cart.schema";

const router = Router();

router.use(requireAuth);

router.get("/", asyncHandler(getCartHandler));
router.post("/items", validate({ body: addCartItemSchema }), asyncHandler(addCartItemHandler));
router.patch(
  "/items/:id",
  validate({ params: cartItemIdParamsSchema, body: updateCartItemSchema }),
  asyncHandler(updateCartItemHandler)
);
router.delete(
  "/items/:id",
  validate({ params: cartItemIdParamsSchema }),
  asyncHandler(removeCartItemHandler)
);

export default router;

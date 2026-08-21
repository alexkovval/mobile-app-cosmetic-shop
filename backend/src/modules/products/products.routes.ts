import { Router } from "express";
import { asyncHandler } from "../../middleware/error.middleware";
import { validate } from "../../middleware/validate.middleware";
import {
  getProductHandler,
  listCategoriesHandler,
  listProductsHandler,
} from "./products.controller";
import { listProductsQuerySchema, productIdParamsSchema } from "./products.schema";

const router = Router();

router.get("/", validate({ query: listProductsQuerySchema }), asyncHandler(listProductsHandler));
router.get("/:id", validate({ params: productIdParamsSchema }), asyncHandler(getProductHandler));

export default router;

// Mounted separately at /categories in app.ts — a distinct top-level resource,
// not a sub-route of /products, per the API spec in ARCHITECTURE_PLAN.md §4.
export const categoriesRoutes = Router();
categoriesRoutes.get("/", asyncHandler(listCategoriesHandler));

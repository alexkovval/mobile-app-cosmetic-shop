import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware";
import { asyncHandler } from "../../middleware/error.middleware";
import { validate } from "../../middleware/validate.middleware";
import { loginHandler, meHandler, registerHandler } from "./auth.controller";
import { loginSchema, registerSchema } from "./auth.schema";

const router = Router();

router.post("/register", validate({ body: registerSchema }), asyncHandler(registerHandler));
router.post("/login", validate({ body: loginSchema }), asyncHandler(loginHandler));
router.get("/me", requireAuth, asyncHandler(meHandler));

export default router;

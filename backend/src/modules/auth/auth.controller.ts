import { Response } from "express";
import { AuthedRequest } from "../../middleware/auth.middleware";
import * as authService from "./auth.service";

export async function registerHandler(req: AuthedRequest, res: Response) {
  const result = await authService.register(req.body);
  res.status(201).json(result);
}

export async function loginHandler(req: AuthedRequest, res: Response) {
  const result = await authService.login(req.body);
  res.status(200).json(result);
}

export async function meHandler(req: AuthedRequest, res: Response) {
  const result = await authService.getMe(req.userId!);
  res.status(200).json(result);
}

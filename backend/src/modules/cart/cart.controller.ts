import { Response } from "express";
import { AuthedRequest } from "../../middleware/auth.middleware";
import * as cartService from "./cart.service";

export async function getCartHandler(req: AuthedRequest, res: Response) {
  const result = await cartService.getCart(req.userId!);
  res.status(200).json(result);
}

export async function addCartItemHandler(req: AuthedRequest, res: Response) {
  const result = await cartService.addItem(req.userId!, req.body);
  res.status(201).json(result);
}

export async function updateCartItemHandler(req: AuthedRequest, res: Response) {
  const result = await cartService.updateItem(req.userId!, req.params.id, req.body);
  res.status(200).json(result);
}

export async function removeCartItemHandler(req: AuthedRequest, res: Response) {
  const result = await cartService.removeItem(req.userId!, req.params.id);
  res.status(200).json(result);
}

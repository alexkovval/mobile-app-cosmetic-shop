import { Request, Response } from "express";
import * as productsService from "./products.service";
import { ListProductsQuery } from "./products.schema";

export async function listProductsHandler(req: Request, res: Response) {
  const result = await productsService.listProducts(req.query as unknown as ListProductsQuery);
  res.status(200).json(result);
}

export async function getProductHandler(req: Request, res: Response) {
  const result = await productsService.getProduct(req.params.id);
  res.status(200).json(result);
}

export async function listCategoriesHandler(_req: Request, res: Response) {
  const result = await productsService.listCategories();
  res.status(200).json(result);
}

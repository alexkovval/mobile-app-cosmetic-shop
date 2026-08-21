import { NotFoundError } from "../../lib/errors";
import { prisma } from "../../lib/prisma";
import { ListProductsQuery } from "./products.schema";

export async function listProducts(query: ListProductsQuery) {
  const { search, category, page, limit } = query;

  const where = {
    ...(category ? { category } : {}),
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { description: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.product.count({ where }),
  ]);

  return { items, page, limit, total };
}

export async function getProduct(id: string) {
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) {
    throw new NotFoundError("Product not found");
  }
  return { product };
}

export async function listCategories() {
  const rows = await prisma.product.findMany({
    select: { category: true },
    distinct: ["category"],
    orderBy: { category: "asc" },
  });
  return { categories: rows.map((r) => r.category) };
}

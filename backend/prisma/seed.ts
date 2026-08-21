import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

const CATEGORIES = ["Skincare", "Makeup", "Haircare", "Fragrance"] as const;

// No real per-product photography for an MVP demo, so every product in a
// category shares one representative photo. Two things were tried and
// rejected before this: picsum.photos returned a genuinely random,
// unrelated stock photo per seed (a lake, a concert crowd...) right next to
// a lipstick's name and price; a flat placehold.co color card was honestly
// a placeholder but visually flat next to real product screenshots. These
// photos are served by our OWN backend (see app.ts's /images static route
// and backend/public/images/) — no external host to go down or rate-limit
// mid-demo.
//
// API_BASE must match what the mobile client resolves to. It intentionally
// mirrors the same default the client falls back to (see mobile/app.json's
// extra.apiUrl and mobile/.env.example) — the Android-emulator
// localhost→10.0.2.2 rewrite is applied client-side (see
// mobile/src/lib/resolveImageUrl.ts), not baked into the stored URL, so one
// seeded value works for iOS Simulator, Android emulator, and a real device
// on the same network as EXPO_PUBLIC_API_URL.
const API_BASE = process.env.API_PUBLIC_URL ?? "http://localhost:4000";

const CATEGORY_IMAGE_FILE: Record<(typeof CATEGORIES)[number], string> = {
  Skincare: "skincare.jpg",
  Makeup: "makeup.jpg",
  Haircare: "haircare.jpg",
  Fragrance: "fragrance.jpg",
};

function categoryImage(category: (typeof CATEGORIES)[number]) {
  return `${API_BASE}/images/${CATEGORY_IMAGE_FILE[category]}`;
}

const PRODUCTS: Array<{
  name: string;
  description: string;
  price: number; // cents
  category: (typeof CATEGORIES)[number];
  stock: number;
}> = [
  { name: "Hydrating Glow Serum", description: "Lightweight vitamin C serum for a dewy, even-toned finish.", price: 3200, category: "Skincare", stock: 40 },
  { name: "Overnight Repair Cream", description: "Rich night cream with ceramides to restore the skin barrier while you sleep.", price: 4500, category: "Skincare", stock: 25 },
  { name: "Gentle Foaming Cleanser", description: "Sulfate-free daily cleanser that won't strip natural oils.", price: 1800, category: "Skincare", stock: 60 },
  { name: "Mineral SPF 50 Sunscreen", description: "Broad-spectrum, non-greasy mineral sunscreen for daily wear.", price: 2600, category: "Skincare", stock: 50 },
  { name: "Rose Quartz Facial Roller", description: "Chilled facial massage tool to de-puff and boost circulation.", price: 2200, category: "Skincare", stock: 30 },
  { name: "Matte Liquid Lipstick", description: "Long-wear, transfer-resistant matte lipstick in 'Terracotta'.", price: 1900, category: "Makeup", stock: 45 },
  { name: "Weightless Foundation", description: "Buildable medium coverage foundation with a natural satin finish.", price: 3800, category: "Makeup", stock: 35 },
  { name: "Volumizing Mascara", description: "Clump-free mascara that lifts and separates every lash.", price: 1600, category: "Makeup", stock: 55 },
  { name: "Everyday Eyeshadow Palette", description: "9-shade neutral palette for effortless day-to-night looks.", price: 4200, category: "Makeup", stock: 20 },
  { name: "Precision Brow Pencil", description: "Ultra-fine tip pencil for natural, feathered brows.", price: 1400, category: "Makeup", stock: 48 },
  { name: "Argan Repair Hair Oil", description: "Fast-absorbing oil that tames frizz and adds shine.", price: 2400, category: "Haircare", stock: 38 },
  { name: "Volumizing Shampoo", description: "Sulfate-free shampoo that adds body without weighing hair down.", price: 2000, category: "Haircare", stock: 42 },
  { name: "Deep Conditioning Mask", description: "Weekly treatment mask for dry or color-treated hair.", price: 2800, category: "Haircare", stock: 22 },
  { name: "Heat Protectant Spray", description: "Lightweight spray that shields hair up to 450°F.", price: 1700, category: "Haircare", stock: 33 },
  { name: "Midnight Bloom Eau de Parfum", description: "A warm floral fragrance with notes of jasmine and amber.", price: 6800, category: "Fragrance", stock: 18 },
  { name: "Citrus Grove Eau de Toilette", description: "A bright, fresh scent with bergamot and neroli.", price: 5200, category: "Fragrance", stock: 24 },
  { name: "Travel Fragrance Set", description: "Three 10ml rollerballs of our best-selling scents.", price: 3400, category: "Fragrance", stock: 15 },
];

async function main() {
  console.log("Seeding database...");

  const passwordHash = await bcrypt.hash("password123", 10);
  await prisma.user.upsert({
    where: { email: "demo@example.com" },
    update: {},
    create: {
      email: "demo@example.com",
      passwordHash,
      name: "Demo User",
    },
  });

  for (const p of PRODUCTS) {
    const existing = await prisma.product.findFirst({ where: { name: p.name } });
    const data = {
      name: p.name,
      description: p.description,
      price: p.price,
      category: p.category,
      stock: p.stock,
      imageUrl: categoryImage(p.category),
    };
    if (existing) {
      // Re-running the seed also refreshes imageUrl on already-seeded rows —
      // otherwise switching image styles (as just happened, replacing the
      // old picsum.photos placeholders) would need a full DB wipe to show up.
      await prisma.product.update({ where: { id: existing.id }, data });
    } else {
      await prisma.product.create({ data });
    }
  }

  console.log(`Seeded ${PRODUCTS.length} products and 1 demo user (demo@example.com / password123).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

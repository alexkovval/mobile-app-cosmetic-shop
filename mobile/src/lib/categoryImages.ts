// Representative photo per category, used by the Home screen's hero and
// "Shop by category" grid — mirrors cosmetics-store-web's
// src/lib/categoryImages.ts, reusing the same verified (non-Unsplash+,
// hotlinkable) photo set as that project's src/lib/productImages.ts so both
// editions of Bloom Beauty draw from the same visual language.
const PARAMS = "w=900&h=900&fit=crop&auto=format&q=80";

export const CATEGORY_IMAGE: Record<string, string> = {
  Skincare: `https://images.unsplash.com/photo-1760860992928-221d73c4c0cc?${PARAMS}`,
  Makeup: `https://images.unsplash.com/photo-1533562389935-457b1ae48a39?${PARAMS}`,
  Haircare: `https://images.unsplash.com/photo-1699373383871-4ca5636948c1?${PARAMS}`,
  Fragrance: `https://images.unsplash.com/photo-1564644411635-5ec7c9aca726?${PARAMS}`,
};

// The web homepage's hero reuses its Skincare category photo rather than a
// dedicated banner asset — same choice here.
export const HERO_IMAGE = CATEGORY_IMAGE.Skincare;

import { Platform } from "react-native";

/**
 * Product images can point at our OWN backend's static file server
 * (http://localhost:4000/images/...) — see backend/src/app.ts and
 * prisma/seed.ts, which serve the category placeholder photos. On the
 * Android emulator, "localhost" means the emulator itself, not the host
 * machine, so any such URL needs the same rewrite api/client.ts already
 * applies to the API base URL (see its comment for the full explanation).
 * External image hosts are unaffected since their URLs don't contain
 * "localhost".
 */
export function resolveImageUrl(url: string): string {
  if (Platform.OS === "android" && url.includes("localhost")) {
    return url.replace("localhost", "10.0.2.2");
  }
  return url;
}

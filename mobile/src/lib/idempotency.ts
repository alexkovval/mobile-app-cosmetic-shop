// React Native has no built-in crypto.randomUUID in Hermes without a polyfill
// (expo-crypto would be the "real" answer, but that's one more native module
// for one function) — this RFC4122-v4-shaped generator is good enough for an
// idempotency key, which only needs to be unique per checkout attempt, not
// cryptographically unguessable.
export function generateIdempotencyKey(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

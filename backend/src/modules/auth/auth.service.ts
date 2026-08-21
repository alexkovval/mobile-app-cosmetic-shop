import bcrypt from "bcrypt";
import { signToken } from "../../middleware/auth.middleware";
import { ConflictError, UnauthorizedError, NotFoundError } from "../../lib/errors";
import { prisma } from "../../lib/prisma";
import { LoginInput, RegisterInput } from "./auth.schema";

const SALT_ROUNDS = 10;

function toPublicUser(user: { id: string; email: string; name: string; createdAt: Date }) {
  // Never return passwordHash to the client.
  return { id: user.id, email: user.email, name: user.name, createdAt: user.createdAt };
}

export async function register(input: RegisterInput) {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) {
    throw new ConflictError("An account with this email already exists", { field: "email" });
  }

  const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);
  const user = await prisma.user.create({
    data: { email: input.email, passwordHash, name: input.name },
  });

  const token = signToken(user.id);
  return { user: toPublicUser(user), token };
}

export async function login(input: LoginInput) {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user) {
    throw new UnauthorizedError("Invalid email or password");
  }

  const valid = await bcrypt.compare(input.password, user.passwordHash);
  if (!valid) {
    throw new UnauthorizedError("Invalid email or password");
  }

  const token = signToken(user.id);
  return { user: toPublicUser(user), token };
}

export async function getMe(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new NotFoundError("User not found");
  }
  return { user: toPublicUser(user) };
}

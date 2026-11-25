import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { asyncHandler } from "../utils/asyncHandler";
import User from "../models/User.model";
import { signToken } from "../utils/jwt";
import { AuthRequest } from "../middleware/auth.middleware";
import { HttpError } from "../utils/httpError";

// Compared against when the email is unknown, so "no such user" and
// "wrong password" take about the same time.
const DUMMY_HASH = bcrypt.hashSync("not-a-real-password", 10);

function publicUser(user: { id: string; name: string; email: string; role: "user" | "admin" }) {
  return { id: user.id, name: user.name, email: user.email, role: user.role };
}

// POST /api/auth/register
export const register = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  const existing = await User.exists({ email });
  if (existing) {
    throw new HttpError(409, "An account with that email already exists", "EMAIL_TAKEN");
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, password: hashedPassword });

  const token = signToken({ userId: user.id, role: user.role });
  res.status(201).json({ token, user: publicUser(user) });
});

// POST /api/auth/login
export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");
  const passwordOk = await bcrypt.compare(password, user ? user.password : DUMMY_HASH);

  if (!user || !passwordOk) {
    throw new HttpError(401, "Invalid email or password", "BAD_CREDENTIALS");
  }

  const token = signToken({ userId: user.id, role: user.role });
  res.json({ token, user: publicUser(user) });
});

// GET /api/auth/me  (lets the client confirm a stored token is still good)
export const me = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await User.findById(req.user!.userId);
  if (!user) {
    throw new HttpError(401, "Account no longer exists", "NO_SUCH_USER");
  }
  res.json({ user: publicUser(user) });
});

import { Request, Response } from "express";
import { registerUser, loginUser } from "./auth.service";
import { generateToken } from "../../utils/jwt";

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    const user = await registerUser(name, email, password);

    const { password_hash, ...safeUser } = user;

    res.status(201).json({
      success: true,
      user: safeUser,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await loginUser(email, password);
    const token = generateToken(user.id, user.role);

    const { password_hash, ...safeUser } = user;

    res.status(200).json({
      success: true,
      token,
      user: safeUser,
    });
  } catch (error: any) {
    res.status(401).json({
      success: false,
      message: error.message,
    });
  }
};

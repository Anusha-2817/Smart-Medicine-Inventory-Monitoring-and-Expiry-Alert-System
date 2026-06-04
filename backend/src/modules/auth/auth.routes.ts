import { Router } from "express";
import { register, login } from "./auth.controller";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/role.middleware";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get(
  "/profile",
  authenticate,
  (req, res) => {
    res.json({
      success: true,
      user: (req as any).user,
    });
  }
);
router.get(
  "/admin",
  authenticate,
  authorize("ADMIN"),
  (req, res) => {
    res.json({
      success: true,
      message: "Welcome Admin",
    });
  }
);
export default router;


import { Router } from "express";
import { list, unreadCount, markRead, markAllRead } from "./notification.controller";
import { authenticate } from "../../middlewares/auth.middleware";

const router = Router();
router.get("/", authenticate, list);
router.get("/unread-count", authenticate, unreadCount);
router.put("/:id/read", authenticate, markRead);
router.put("/mark-all-read", authenticate, markAllRead);
export default router;

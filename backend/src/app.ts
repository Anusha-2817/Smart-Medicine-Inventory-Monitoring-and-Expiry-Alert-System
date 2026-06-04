import express from "express";
import authRoutes from "./modules/auth/auth.routes";

const app = express();

app.use(express.json());

app.get("/", (_req, res) => {
  res.send("Medicine Inventory API Running");
});

app.use("/api/auth", authRoutes);

export default app;
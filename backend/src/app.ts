import express from "express";
import authRoutes from "./modules/auth/auth.routes";
import medicineRoutes from "./modules/medicine/medicine.routes";

const app = express();

app.use(express.json());

app.get("/", (_req, res) => {
  res.send("HELLO ANUSHA TEST");
});

app.use("/api/auth", authRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/medicines", medicineRoutes);
export default app;
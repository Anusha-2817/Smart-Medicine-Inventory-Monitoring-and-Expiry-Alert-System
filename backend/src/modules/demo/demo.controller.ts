import { Request, Response } from "express";
import { generateDemoData, getDemoStatus } from "./demo.service";
import { PharmacySize } from "../../utils/dataGenerator";

const VALID_MODES: PharmacySize[] = ["small", "medium", "hospital"];

export const status = async (_req: Request, res: Response) => {
  try {
    const data = await getDemoStatus();
    res.json({ success: true, data });
  } catch (e: any) {
    res.status(500).json({ success: false, message: e.message });
  }
};

export const generate = async (req: Request, res: Response) => {
  try {
    const { mode = "medium", clearExisting = false } = req.body as {
      mode?: PharmacySize;
      clearExisting?: boolean;
    };

    if (!VALID_MODES.includes(mode)) {
      return res.status(400).json({
        success: false,
        message: `Invalid mode "${mode}". Must be one of: ${VALID_MODES.join(", ")}`,
      });
    }

    // Generation can take 30–90 s for hospital profile — respond quickly
    res.json({
      success: true,
      message: "Demo data generation started. Check /api/demo/status for progress.",
      mode,
      clearExisting,
    });

    // Run generation after response is sent
    generateDemoData(mode, !!clearExisting).catch((err) => {
      console.error("❌ Demo generation error:", err);
    });
  } catch (e: any) {
    res.status(500).json({ success: false, message: e.message });
  }
};

export const generateSync = async (req: Request, res: Response) => {
  try {
    const { mode = "medium", clearExisting = false } = req.body as {
      mode?: PharmacySize;
      clearExisting?: boolean;
    };

    if (!VALID_MODES.includes(mode)) {
      return res.status(400).json({
        success: false,
        message: `Invalid mode "${mode}". Must be one of: ${VALID_MODES.join(", ")}`,
      });
    }

    const result = await generateDemoData(mode, !!clearExisting);
    res.json({ success: true, data: result });
  } catch (e: any) {
    res.status(500).json({ success: false, message: e.message });
  }
};

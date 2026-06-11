import { Request, Response } from "express";
import { performGlobalSearch } from "./search.service";

export const searchGlobal = async (req: Request, res: Response) => {
  try {
    const query = req.query.q as string;
    
    if (!query) {
      return res.status(400).json({ error: "Search query 'q' is required" });
    }

    const results = await performGlobalSearch(query);

    return res.status(200).json(results);
  } catch (error) {
    console.error("Error in global search:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

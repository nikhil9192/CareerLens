import { Request, Response, NextFunction } from "express";
import { supabase } from "../lib/supabase";

export async function getSchools(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { data, error } = await supabase
      .from("schools")
      .select("id, name, city, state")
      .order("name");

    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }

    res.json(data);
  } catch (err) {
    next(err);
  }
}

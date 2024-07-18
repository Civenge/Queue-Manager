import { NextApiRequest, NextApiResponse } from "next";
import pool from "../../utils/postgres";
import { v4 as uuidv4 } from "uuid";
import { sanitizeInput } from "@/utils/validation";
import { error } from "console";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  let client;
  try {
    client = await pool.connect();
    console.log("Database connected");

    if (req.method === "POST") {
      const { name } = req.body;

      if (!name) {
        res.status(400).json({ error: "Page name is required." });
        return;
      }
      const sanitizedName = sanitizeInput(name);

      if (sanitizedName.length > 255) {
        res.status(400).json({ error: "Page name exceeds maximum length." });
        return;
      }
      const id = uuidv4();
      const result = await client.query(
        "INSERT INTO pages (id, name, created_at) values ($1, $2, $3) RETURNING *",
        [id, sanitizedName, new Date()]
      );
      const newPage = result.rows[0];
      res.status(201).json(newPage);
    } else {
      res.setHeader("Allow", ["POST"]);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
    client.release();
  } catch (e) {
    console.error("Error processing request: ", e);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    if (client) {
      client.release();
    }
  }
}

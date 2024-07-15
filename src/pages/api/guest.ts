// src/pages/api/guest.ts
import { NextApiRequest, NextApiResponse } from "next";
import pool from "../../utils/postgres";
import { v4 as uuidv4 } from "uuid";

function sanitizeInput(input: string): string {
  let sanitizedInput = input.trim();

  sanitizedInput = sanitizedInput.replace(/<\/?[^>]+(>|$)/g, "");

  return sanitizedInput;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const client = await pool.connect();
    console.log("Database connected");

    if (req.method === "GET") {
      const result = await client.query(
        "SELECT * FROM guest ORDER BY created_at DESC"
      );
      const data = result.rows as { id: string; guest: string }[];
      res.status(200).json(data);
    } else if (req.method === "POST") {
      const { guest } = req.body;

      if (!guest) {
        res.status(400).json({ error: "Guest name is required." });
        return;
      }

      const sanitzedGuest = sanitizeInput(guest);

      const id = uuidv4();
      const result = await client.query(
        "INSERT INTO guest (id, guest, created_at) VALUES ($1, $2, $3) RETURNING *",
        [id, sanitzedGuest, new Date()]
      );
      const newGuest = result.rows[0];
      res.status(201).json(newGuest);
    } else {
      res.setHeader("Allow", ["GET", "POST"]);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
    client.release();
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

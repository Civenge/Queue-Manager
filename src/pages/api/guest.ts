// src/pages/api/guest.ts
import { NextApiRequest, NextApiResponse } from "next";
import pool from "../../utils/postgres";
import { v4 as uuidv4 } from "uuid";

function sanitizeInput(input: string): string {
  let sanitizedInput = input.trim();
  sanitizedInput = sanitizedInput.replace(/<\/?[^>]+(>|$)/g, "");
  return sanitizedInput;
}

function validateEmail(email: string): boolean {
  const trimmedEmail = email.trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(trimmedEmail);
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
        "SELECT * FROM queue ORDER BY entered_at ASC"
      );
      const data = result.rows as {
        id: string;
        name: string;
        email: string;
        entered_at: string;
      }[];
      res.status(200).json(data);
    } else if (req.method === "POST") {
      const { name, email } = req.body;

      if (!name || !email) {
        res.status(400).json({ error: "Name and email are required." });
        return;
      }

      const sanitizedName = sanitizeInput(name);
      const sanitizedEmail = sanitizeInput(email);

      if (!validateEmail(sanitizedEmail)) {
        res.status(400).json({ error: "Invalid email format." });
        return;
      }

      if (sanitizedName.length > 75 || sanitizedEmail.length > 75) {
        res
          .status(400)
          .json({ error: "Name or email exceeds maximum length." });
        return;
      }

      const id = uuidv4();
      const result = await client.query(
        "INSERT INTO queue (id, name, email, entered_at) VALUES ($1, $2, $3, $4) RETURNING *",
        [id, sanitizedName, sanitizedEmail, new Date()]
      );
      const newEntry = result.rows[0];
      res.status(201).json(newEntry);
    } else {
      res.setHeader("Allow", ["GET", "POST"]);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
    client.release();
  } catch (e) {
    console.error("Error processing request: ", e);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

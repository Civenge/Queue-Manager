import { NextApiRequest, NextApiResponse } from "next";
import pool from "../../utils/postgres";
import { v4 as uuidv4 } from "uuid";
import { sanitizeInput } from "@/utils/validation";

// Helper function to fetch page_id based on pageName
const getPageId = async (pageName: string, client: any) => {
  try {
    const result = await client.query("SELECT id FROM pages WHERE name = $1", [
      pageName,
    ]);
    if (result.rows.length === 0) {
      throw new Error("Page not found");
    }
    return result.rows[0].id;
  } catch (error) {
    console.error(`Error in getPageId: ${(error as Error).message}`);
    throw error;
  }
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  let client;
  try {
    client = await pool.connect();
    console.log("Database connected");

    if (req.method === "GET") {
      const { pageName } = req.query;

      if (typeof pageName !== "string") {
        res.status(400).json({ error: "Invalid page name" });
        return;
      }

      console.log(`Fetching data for pageName: ${pageName}`);

      const pageId = await getPageId(pageName, client);

      const result = await client.query(
        "SELECT * FROM queue WHERE page_id = $1 ORDER BY entered_at ASC",
        [pageId]
      );
      const data = result.rows as {
        id: string;
        name: string;
        email: string;
        entered_at: string;
      }[];
      res.status(200).json(data);
    } else if (req.method === "POST") {
      const { name, email, pageName } = req.body;

      if (!name || !email || !pageName) {
        res
          .status(400)
          .json({ error: "Name, email, and page name are required." });
        return;
      }

      const sanitizedName = sanitizeInput(name);
      const sanitizedEmail = sanitizeInput(email);
      const sanitizedPageName = sanitizeInput(pageName);

      if (
        sanitizedName.length > 75 ||
        sanitizedEmail.length > 75 ||
        sanitizedPageName.length > 75
      ) {
        res.status(400).json({
          error: "Name, email, or page name exceeds maximum length.",
        });
        return;
      }

      console.log(`Inserting data with pageName: ${sanitizedPageName}`);

      const pageId = await getPageId(sanitizedPageName, client);

      const id = uuidv4();
      const result = await client.query(
        "INSERT INTO queue (id, name, email, entered_at, page_id) VALUES ($1, $2, $3, $4, $5) RETURNING *",
        [id, sanitizedName, sanitizedEmail, new Date(), pageId]
      );
      const newEntry = result.rows[0];
      res.status(201).json(newEntry);
    } else if (req.method === "DELETE") {
      const { id } = req.query;

      if (!id || typeof id !== "string") {
        res.status(400).json({ error: "Invalid ID" });
        return;
      }

      await client.query("DELETE FROM queue WHERE id = $1", [id]);
      res.status(200).json({ message: "Guest removed successfully" });
    } else {
      res.setHeader("Allow", ["GET", "POST", "DELETE"]);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (e) {
    console.error("Error processing request: ", e);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    if (client) {
      client.release();
    }
  }
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const Sidebar = () => {
  const [pages, setPages] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    const fetchPages = async () => {
      try {
        const response = await fetch("/api/page");
        if (!response.ok) {
          throw new Error("Failed to fetch pages");
        }
        const pageData = await response.json();
        setPages(pageData.pages);
      } catch (error) {
        console.error("Error fetching pages: ", error);
      }
    };

    fetchPages();
  }, []);

  return (
    <aside className="sidebar py-2 px-4 text-blue-500 rounded-md focus:outline-none">
      <h2 className="text-center text-2xl font-bold mb-4">Existing Classes:</h2>
      <ul>
        {pages.map((page) => (
          <li key={page.id} className="mb-2">
            <Link
              href={`/${page.name}`}
              className="text-blue-500 hover:underline"
            >
              {page.name}
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default Sidebar;

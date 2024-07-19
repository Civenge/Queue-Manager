"use client";

import { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";

const Home = () => {
  const [newPageName, setNewPageName] = useState<string>("");

  const router = useRouter();

  const handlePageCreation = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    if (!newPageName.trim()) {
      toast.error("Page name is required");
      return;
    }
    try {
      const response = await fetch("/api/page", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: newPageName }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        toast.error(`Error: ${errorData.error}`);
        throw new Error("Failed to create page");
      }
      const newPage = await response.json();
      router.push(`/${newPage.name}`);
      toast.success("Page created successfully");
    } catch (e) {
      console.error("Error creating page: ", e);
      toast.error("Failed to create page.");
    }
  };

  return (
    <>
      <ToastContainer />
      <main className="grid grid-cols-4 min-h-screen p-24 gap-4 bg-gray-300">
        <div className="col-span-3 flex flex-col items-center">
          <div className="py-2 px-4 text-blue-500 rounded-md focus:outline-none text-center text-4xl font-bold">
            Welcome to the TA Queue Manager
          </div>
          <div>
            <form onSubmit={handlePageCreation} className="mt-4 py-2">
              <input
                type="text"
                value={newPageName}
                onChange={(e) => setNewPageName(e.target.value)}
                className="py-2 px-4 mr-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:border-blue-500 dark:bg-gray-800 dark:text-gray-300 min-w-[275px]"
                placeholder="Enter new classroom number."
                required
              ></input>
              <button
                type="submit"
                className="py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:bg-blue-600"
              >
                Add New Classroom
              </button>
            </form>
          </div>
        </div>
        <div className="col-span-1">
          <Sidebar />
        </div>
      </main>
    </>
  );
};

export default Home;

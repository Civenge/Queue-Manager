"use client";

import { useEffect, useState } from "react";
import { validateEmail } from "@/utils/validation";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useRouter } from "next/navigation";

interface Guest {
  id: string;
  name: string;
  email: string;
  entered_at: Date;
}

const Home = () => {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [newGuestName, setNewGuestName] = useState<string>("");
  const [newGuestEmail, setNewGuestEmail] = useState<string>("");
  const [newPageName, setNewPageName] = useState<string>("");

  const router = useRouter();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch("/api/guest");
      const data: Guest[] = await response.json();

      const guestsWithFormattedDates = data.map((guest) => ({
        ...guest,
        entered_at: new Date(guest.entered_at),
      }));

      setGuests(guestsWithFormattedDates);
    } catch (e) {
      console.error(e);
    }
  };

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

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!newGuestName.trim()) {
      toast.error("Name is required");
      return;
    }

    if (!newGuestEmail.trim()) {
      toast.error("Email is required");
      return;
    }

    if (!validateEmail(newGuestEmail)) {
      toast.error(
        "Please enter a valid email address such as: example@example.com"
      );
      return;
    }

    try {
      const response = await fetch("/api/guest", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: newGuestName, email: newGuestEmail }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 400) {
          toast.error(`Error: ${errorData.error}`);
        } else {
          toast.error("Failed to add guest");
        }
        throw new Error("Failed to add guest");
      }

      const newGuest: Guest = await response.json();
      setGuests([
        ...guests,
        { ...newGuest, entered_at: new Date(newGuest.entered_at) },
      ]);
      setNewGuestName("");
      setNewGuestEmail("");
      toast.success("You have been added to the queue.");
    } catch (e) {
      console.error("Error adding guest: ", e);
      toast.error("Failed to add guest.");
    }
  };

  const handleRemove = async (id: string) => {
    try {
      const response = await fetch(`/api/guest?id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        toast.error("Failed to remove guest");
        throw new Error("Failed to remove guest");
      }

      setGuests(guests.filter((guest) => guest.id !== id));
      toast.success("Guest removed from the queue.");
    } catch (e) {
      console.error("Error removing guest: ", e);
    }
  };

  return (
    <>
      <ToastContainer />
      <main className="flex min-h-fit flex-col items-center justify-between p-24">
        <div className="py-2 px-4 text-blue-500 rounded-md focus:outline-none  text-center text-4xl font-bold">
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
        <div>
          <p className="py-2 px-4 text-20">
            Please enter your information below to be added to the queue.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="mt-4 py-2">
          <input
            type="text"
            value={newGuestName}
            onChange={(e) => setNewGuestName(e.target.value)}
            className="py-2 px-4 mr-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:border-blue-500 dark:bg-gray-800 dark:text-gray-300"
            placeholder="Enter your name here."
            required
          ></input>
          <input
            type="email"
            value={newGuestEmail}
            onChange={(e) => setNewGuestEmail(e.target.value)}
            className="py-2 px-4 mr-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:border-blue-500 dark:bg-gray-800 dark:text-gray-300"
            placeholder="Enter your email here."
            required
          ></input>
          <button
            type="submit"
            className="py-2 px-4 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:bg-green-600"
          >
            Add to Queue
          </button>
        </form>

        <div className="max-w-4xl mx-auto h-[50vh] overflow-auto px-8">
          <ul className="divide-y divide-gray-200">
            {guests.map((guest) => (
              <li key={guest.id} className="py-4">
                <div className="flex items-center justify-between">
                  <div className="text-lg font-semibold">{guest.name}</div>
                  <div className="ml-4 text-lg font-semibold">
                    {guest.email}
                  </div>
                  <div className="ml-4 text-sm text-gray-500">
                    {guest.entered_at.toLocaleString()}
                  </div>
                  <button
                    onClick={() => handleRemove(guest.id)}
                    className="ml-4 py-2 px-4 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:bg-red-600"
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </main>
    </>
  );
};

export default Home;

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { validateEmail } from "@/utils/validation";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "tailwindcss/tailwind.css";
import Sidebar from "@/components/Sidebar";

interface Guest {
  id: string;
  name: string;
  email: string;
  entered_at: Date;
}

const Page = () => {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [newGuestName, setNewGuestName] = useState<string>("");
  const [newGuestEmail, setNewGuestEmail] = useState<string>("");

  const router = useRouter();
  const { pageName } = router.query;

  useEffect(() => {
    if (pageName) {
      fetchData();
    }
  }, [pageName]);

  const fetchData = async () => {
    try {
      const response = await fetch(`/api/guest?pageName=${pageName}`);
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
        body: JSON.stringify({
          name: newGuestName,
          email: newGuestEmail,
          classroom: pageName,
          pageName,
        }),
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
      <main className="grid grid-cols-4 min-h-screen p-24 gap-4 bg-gray-300">
        <div className="col-span-3 flex flex-col items-center">
          <div className="py-2 px-4 text-blue-500 rounded-md focus:outline-none text-center text-4xl font-bold">
            Welcome to the TA Queue Manager
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
        </div>
        <div className="col-span-1">
          <Sidebar />
        </div>
      </main>
    </>
  );
};

export default Page;

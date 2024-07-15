"use client";

import { useEffect, useState } from "react";

interface Guest {
  id: string;
  guest: string;
  created_at: Date;
}

const Home = () => {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [newGuestName, setNewGuestName] = useState<string>("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch("/api/guest");
      const data: Guest[] = await response.json();

      const guestsWithFormattedDates = data.map((guest) => ({
        ...guest,
        created_at: new Date(guest.created_at),
      }));

      setGuests(guestsWithFormattedDates);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      const response = await fetch("/api/guest", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ guest: newGuestName }),
      });

      if (!response.ok) {
        throw new Error("Failed to add guest");
      }

      const newGuest: Guest = await response.json();
      setGuests([
        { ...newGuest, created_at: new Date(newGuest.created_at) },
        ...guests,
      ]);
      setNewGuestName("");
    } catch (e) {
      console.error("Error adding guest: ", e);
    }
  };

  return (
    <main className="flex min-h-fit flex-col items-center justify-between p-24">
      <div className="py-2 px-4 text-blue-500 rounded-md focus:outline-none  text-center text-4xl font-bold">
        Welcome to Kyle&apos;s Guestbook
      </div>
      <div>
        <p className="py-2 px-4 text-20">
          Please consider signing my guestbook if you are visiting the site!
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
        <button
          type="submit"
          className="py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:bg-blue-600"
        >
          Add Guest
        </button>
      </form>

      <div className="max-w-xl mx-auto h-[50vh] overflow-auto px-8">
        <ul className="divide-y divide-gray-200">
          {guests.map((guest) => (
            <li key={guest.id} className="py-4">
              <div className="flex items-center justify-between">
                <div className="text-lg font-semibold">{guest.guest}</div>
                <div className="ml-4 text-sm text-gray-500">
                  {guest.created_at.toLocaleString()}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
};

export default Home;

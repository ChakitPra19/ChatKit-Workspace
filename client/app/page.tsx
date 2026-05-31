"use client";

import { useEffect } from "react";
import { io } from "socket.io-client"

export default function Home() {
  useEffect(() => {
    const socket = io("http://localhost:5001", {
      auth: {
        token: ""
      }
    });

    socket.on("connect", () => {
      console.log(`Connect to Socket.io Successfully, ID: ${socket.id}`);
    });

    socket.on("connect_error", (err) => {
      console.log(`Connection Error: ${err.message}`);
    });

    return () => {
      socket.disconnect();
    };
  }, []);
  return (
    <div className="flex h-screen items-center justify-center bg-gray-900 text-white">
      <h1 className="text-3xl font-bold">Testing Socket Server!</h1>
    </div>
  );
}
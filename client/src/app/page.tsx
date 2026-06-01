"use client"
import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import axios from "axios";

const MY_TOKEN = "";
const ROOM_ID = "";

interface Message {
  _id: string,
  content: string;
  sender: { _id: string, username: string };
}

export default function ChatRoom() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");

  useEffect(() => {
    const newSocket = io("http://localhost:5001", {
      auth: { token: MY_TOKEN }
    });

    setSocket(newSocket);
    axios.get(`http://localhost:5001/api/messages/${ROOM_ID}`, {
      headers: { Authorization: `Bearer ${MY_TOKEN}` }
    }).then((res) => setMessages(res.data)).catch((err) => console.log("Fetch Messages Error:", err));

    newSocket.on("connect", () => {
      newSocket.emit("join_room", ROOM_ID);
    });

    newSocket.on("message_received", (incomingMessage) => {
      setMessages((prev) => [...prev, incomingMessage]);
    });

    return () => {
      newSocket.disconnect()
    };
  }, []);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!inputText.trim()) return;

    const tempMessage: Message = {
      _id: Math.random().toString(),
      content: inputText,
      sender: { _id: "me", username: "MySelf" },
    };

    setMessages((prev) => [...prev, tempMessage]);
    setInputText("");

    try {
      const res = await axios.post("http://localhost:5001/api/messages", { roomId: ROOM_ID, content: tempMessage.content }, { headers: { Authorization: `Bearer ${MY_TOKEN}` } });
      socket?.emit("send_message", {
        roomId: ROOM_ID,
        message: res.data
      });
    } catch (err) {
      console.log("Failed to send message:", err);
    }
  };

  return (
    <div>
      {messages.map((msg) => (
        <div key={msg._id}>
          <h1 className="text-red-500">{msg.sender.username}</h1>
          <p className="text-black">{msg.content}</p>
        </div>
      ))}

      <form onSubmit={handleSendMessage}>
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)} />
        <button type="submit">Send</button>
      </form>
    </div>
  )
};


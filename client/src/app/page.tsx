"use client"
import { useEffect, useRef, useState } from "react";
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
  const [typingUser, setTypingUser] = useState<string | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<String[]>([]);

  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

    newSocket.on("user_typing", (username) => {
      setTypingUser(username);
    });

    newSocket.on("user_stop_typing", () => {
      setTypingUser(null);
    });

    newSocket.on("update_online_users", (usersArray) => {
      setOnlineUsers(usersArray);
    });

    return () => {
      newSocket.disconnect()
    };
  }, []);

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);

    if (socket) {
      socket.emit("typing", ROOM_ID);
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    };

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stop_typing", ROOM_ID);
    }, 2000);
  };

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

      {typingUser && (
        <div className="flex justify-start">
          <div className="bg-gray-100 text-gray-500 text-sm p-2 rounded-xl italic">
            {typingUser} กำลังพิมพ์...
          </div>
        </div>
      )}

      <span>Online User</span>
      {onlineUsers.map((user, idx) => (
        <div key={idx}>
          <span className="text-green-500">{user}</span>
        </div>
      ))}

      <form onSubmit={handleSendMessage}>
        <input
          type="text"
          value={inputText}
          onChange={handleTyping} />
        <button type="submit">Send</button>
      </form>
    </div>
  )
};


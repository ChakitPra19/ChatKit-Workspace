"use client"
import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import axios from "axios";

const MY_TOKEN = "";
const ROOM_ID = "";

interface Message {
  _id: string;
  content: string;
  sender: { _id: string, username: string };
  messageType?: string;
}

export default function ChatRoom() {
  const [socket, setSocket] = useState<Socket | null>(null);

  // Typing Section
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [typingUser, setTypingUser] = useState<string | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<String[]>([]);

  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Uploading Section
  const [isUploading, setIsUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Note Section
  const [noteContent, setNoteContent] = useState("");

  const saveNoteTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const newSocket = io("http://localhost:5001", {
      auth: { token: MY_TOKEN }
    });

    setSocket(newSocket);
    axios.get(`http://localhost:5001/api/messages/${ROOM_ID}`, {
      headers: { Authorization: `Bearer ${MY_TOKEN}` }
    })
      .then((res) => setMessages(res.data))
      .catch((err) => console.log("Fetch Messages Error:", err));

    axios.get(`http://localhost:5001/api/notes/${ROOM_ID}`, {
      headers: { Authorization: `Bearer ${MY_TOKEN}` }
    })
      .then((res) => setNoteContent(res.data.content))
      .catch((err) => console.log("Fetch note fail: ", err));

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

    newSocket.on("note_updated", (newContent) => {
      setNoteContent(newContent);
    })

    return () => {
      newSocket.disconnect()
    };
  }, []);

  // Handle Section
  // Typing
  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);

    if (socket) {
      socket.emit("typing", ROOM_ID);
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    };

    typingTimeoutRef.current = setTimeout(() => {
      socket?.emit("stop_typing", ROOM_ID);
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
      const res = await axios.post("http://localhost:5001/api/messages", {
        roomId: ROOM_ID,
        content: tempMessage.content
      },
        {
          headers: {
            Authorization: `Bearer ${MY_TOKEN}`
          }
        });
      socket?.emit("send_message", {
        roomId: ROOM_ID,
        message: res.data
      });
    } catch (err) {
      console.log("Failed to send message:", err);
    }
  };

  // Uploading
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setIsUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const uploadRes = await axios.post("http://localhost:5001/api/upload", formData, {
        headers: {
          Authorization: `Bearer ${MY_TOKEN}`,
          "Content-Type": "multipart/form-data",
        }
      });

      const imageUrl = uploadRes.data.url;
      const msgRes = await axios.post("http://localhost:5001/api/messages", {
        roomId: ROOM_ID,
        content: imageUrl,
        messageType: "image",
      }, { headers: { Authorization: `Bearer ${MY_TOKEN}` } });

      socket?.emit("send_message", {
        roomId: ROOM_ID,
        message: msgRes.data,
      });

      setMessages((prev) => [...prev, msgRes.data]);

    } catch (error) {
      console.error("Failed to upload file:", error)
    } finally {
      setIsUploading(false);
    }
  };

  // Note
  const handleNoteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setNoteContent(text);

    if (socket) {
      socket.emit("update_note", { roomId: ROOM_ID, content: text });
    }

    if (saveNoteTimeoutRef.current) {
      clearTimeout(saveNoteTimeoutRef.current);
    }

    saveNoteTimeoutRef.current = setTimeout(async () => {
      try {
        await axios.put(`http://localhost:5001/api/notes/${ROOM_ID}`, { content: text }, { headers: { Authorization: `Bearer ${MY_TOKEN}` } })
        console.log("Note Saved")
      } catch (error) {
        console.log("Save note unsuccessful!")
      }
    }, 1500)
  }

  return (
    <div>
      {messages.map((msg) => (
        <div key={msg._id}>
          <h1 className="text-red-500">{msg.sender.username}</h1>
          {msg.messageType === "image" ? (
            <img src={msg.content} alt="รูปแชท" className="rounded-lg max-w-sm mt-1" />
          ) : (
            <p>{msg.content}</p>
          )}
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

      <form onSubmit={handleSendMessage} className="...">
        <input
          type="file"
          accept="image/*"
          className="hidden"
          ref={fileInputRef}
          onChange={handleFileUpload}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="p-2 text-xl hover:bg-gray-200 rounded-full"
        >
          {isUploading ? "⏳" : "📷"}
        </button>
      </form>
      <form onSubmit={handleSendMessage}>
        <input
          type="text"
          value={inputText}
          onChange={handleTyping} />
        <button type="submit">Send</button>
      </form>

      <textarea
        className="flex-1 w-full p-8 text-lg text-gray-800 outline-none resize-none bg-transparent"
        placeholder="ลองพิมพ์ดู"
        value={noteContent}
        onChange={handleNoteChange}
      />
    </div>
  )
};


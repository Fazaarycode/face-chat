"use client";

import { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import Avatar from "react-avatar";

let socket;

export default function ChatMessages({ room, username }) {
  const [messages, setMessages] = useState([]);
  const [connected, setConnected] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchMessages = async () => {
    try {
      const response = await fetch(`/api/messages?roomId=${room}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setMessages(data);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  useEffect(() => {
    fetchMessages();

    const socketInitializer = async () => {
      try {
        await fetch("/api/socket");
        socket = io("http://localhost:3001", {
          transports: ["websocket"],
          reconnectionAttempts: 5,
        });

        socket.on("connect", () => {
          setConnected(true);
          socket.emit("join-room", room);
        });

        socket.on("new-message", (message) => {
          setMessages((prev) => [...prev, message]);
          scrollToBottom();
        });

        socket.on("disconnect", () => {
          setConnected(false);
        });

        window.socket = socket;
      } catch (error) {
        console.error("Socket initialization error:", error);
      }
    };

    socketInitializer();

    return () => {
      if (socket) {
        socket.emit("leave-room", room);
        socket.disconnect();
      }
    };
  }, [room, fetchMessages]);

  return (
    <div className="bg-[#efeae2] rounded-xl shadow-lg p-6 h-[600px] overflow-y-auto">
      {!connected && (
        <div className="text-center text-amber-600 mb-4 font-medium">
          Connecting to chat...
        </div>
      )}

      <div className="space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-slate-500 font-medium">
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={index}
              className="container flex items-start gap-4"
              style={{
                display: "flex",
                justifyContent: message.senderName == username ? "flex-end" : "flex-start",
                marginTop: "10px",
                marginBottom: "10px",
              }}
            >
              {message.senderName !== username && (
                <div className="flex flex-col items-center space-y-1">
                  <Avatar
                    name={message.senderName || "Unknown"}
                    size="32"
                    round={true}
                    className="shadow-sm border-2 border-white"
                  />
                </div>
              )}

              <div
                style={{
                  backgroundColor: message.senderName === username ? "#d9fdd3" : "#ffffff",
                  boxShadow: "0 1px 0.5px rgba(11,20,26,.13)",
                  position: "relative",
                  borderRadius: "7.5px",
                  padding: "6px 7px 8px 9px",
                  maxWidth: "70%",
                  marginLeft: message.senderName === username ? "auto" : "0",
                  marginRight: message.senderName === username ? "0" : "auto",
                  minWidth: "120px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "2px",
                  }}
                >
                  {message.senderName !== username && (
                    <span
                      style={{
                        fontSize: "12.8px",
                        fontWeight: "500",
                        color: "#1fa855",
                        marginBottom: "2px",
                      }}
                    >
                      {message.senderName}
                    </span>
                  )}
                  <div
                    style={{
                      fontSize: "14.2px",
                      lineHeight: "19px",
                      color: "#111b21",
                      fontWeight: "400",
                      marginRight: "48px",
                      wordBreak: "break-word",
                      paddingBottom: "16px",
                    }}
                  >
                    {message.content}
                  </div>
                  <span
                    style={{
                      fontSize: "11px",
                      color: "#667781",
                      position: "absolute",
                      right: "7px",
                      bottom: "6px",
                      backgroundColor: "inherit",
                      paddingLeft: "4px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {new Date(message.timestamp).toLocaleTimeString([], {
                      hour: "numeric",
                      minute: "2-digit",
                      hour12: true,
                    })}
                  </span>
                </div>
              </div>

              {message.senderName === username && (
                <div className="flex flex-col items-center space-y-1">
                  <Avatar
                    name={message.senderName || "Unknown"}
                    size="32"
                    round={true}
                    className="shadow-sm border-2 border-white"
                  />
                </div>
              )}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}

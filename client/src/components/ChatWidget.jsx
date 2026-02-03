import React, { useState, useEffect, useRef, useContext } from "react";
import axios from "axios";
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";

const ChatWidget = () => {
  const { backendUrl, userToken, userData } = useContext(AppContext);

  const token = userToken;
  const userId = userData?._id; // ✅ FIX: correct userId source

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [suggestions, setSuggestions] = useState([
    "Analyze a job match",
    "Get career guidance",
    "Check ATS score",
  ]);

  const messagesEndRef = useRef(null);
  // eslint-disable-next-line no-unused-vars
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  // Load conversation when chat opens
  useEffect(() => {
    if (isOpen && token && userId && !conversationId) {
      loadOrCreateConversation();
    }
  }, [isOpen, token, userId]);

  const loadOrCreateConversation = async () => {
    try {
      const res = await axios.post(
        `${backendUrl}/api/chat/conversation`,
        { type: "general" },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        const conv = res.data.data;
        setConversationId(conv._id);

        if (conv.messageCount > 0) {
          loadConversationHistory(conv._id);
        } else {
          setMessages([
            {
              role: "assistant",
              content: `Hello ${userData?.name || "there"}! 👋

I'm JobMate AI, your career assistant.

🎯 Job Match Analysis  
🚀 Career Path Guidance  
📄 Resume ATS Score  

What would you like to explore?`,
              timestamp: new Date(),
            },
          ]);
        }
      }
    } catch (err) {
      console.error("Conversation init failed:", err);
      toast.error("Failed to start chat");
    }
  };

  const loadConversationHistory = async (convId) => {
    try {
      const res = await axios.get(
        `${backendUrl}/api/chat/conversation/${convId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        setMessages(
          res.data.data.messages.map((m) => ({
            role: m.role,
            content: m.content,
            timestamp: new Date(m.createdAt),
            suggestions: m.suggestions,
          }))
        );
      }
    } catch (err) {
      console.error("Load history failed:", err);
    }
  };

  const sendMessage = async (messageText = null) => {
    const message = messageText || inputMessage.trim();
    if (!message || isLoading) return;

    setMessages((prev) => [
      ...prev,
      { role: "user", content: message, timestamp: new Date() },
    ]);

    setInputMessage("");
    setIsLoading(true);

    try {
      const res = await axios.post(
        `${backendUrl}/api/chat/message`,
        {
          conversationId,
          message,
          context: {},
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        const assistant = res.data.data.assistantMessage;

        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: assistant.content,
            timestamp: new Date(),
            suggestions: assistant.suggestions,
          },
        ]);

        if (assistant.suggestions) {
          setSuggestions(assistant.suggestions);
        }
      }
    } catch (err) {
      console.error("Send failed:", err);
      toast.error("Failed to send message");

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, something went wrong. Please try again.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!token || !userId) return null; // ✅ FIX: wait for auth

  return (
    <>
      <button
        onClick={() => setIsOpen((o) => !o)}
        className="fixed bottom-6 right-6 z-50 bg-blue-600 text-white rounded-full p-4 shadow-lg"
      >
        🤖
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-96 h-[600px] bg-white rounded-lg shadow-xl flex flex-col">
          <div className="p-4 bg-blue-600 text-white font-semibold">
            JobMate AI
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${
                  m.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`p-3 rounded-lg max-w-[80%] ${
                    m.role === "user"
                      ? "bg-blue-600 text-white"
                      : "bg-white border"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{m.content}</p>
                </div>
              </div>
            ))}

            {isLoading && <p className="text-sm">Typing…</p>}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-3 border-t flex gap-2">
            <input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1 border rounded px-3 py-2"
              placeholder="Type your message..."
              disabled={isLoading}
            />
            <button
              onClick={() => sendMessage()}
              disabled={!inputMessage.trim() || isLoading}
              className="bg-blue-600 text-white px-4 rounded"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatWidget;

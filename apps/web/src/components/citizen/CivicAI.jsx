import { useState } from "react";
import {
  FiMessageCircle,
  FiSend,
  FiX,
  FiCpu,
} from "react-icons/fi";

const suggestedQuestions = [
  "How do I raise a complaint?",
  "Track my complaint",
  "What is the status of my complaint?",
  "What does In Progress mean?",
  "How can I contact the authority?",
];

const getBotResponse = (question) => {
  const q = question.toLowerCase();

  // Track and status questions
  if (
    q.includes("track") ||
    q.includes("status") ||
    q.includes("what is my complaint status")
  ) {
    return "You can check your complaint status from the My Complaints section. Your complaint will show its current status, such as Pending, In Progress, or Resolved.";
  }

  // In Progress explanation
  if (
    q.includes("in progress") ||
    q.includes("meaning")
  ) {
    return "Your complaint has been assigned and the concerned authority is currently working on it.";
  }

  // Contact authority
  if (
    q.includes("contact") ||
    q.includes("authority")
  ) {
    return "Please use the authority contact information provided by Civic Connect for your concerned department.";
  }

  // Raise complaint
  if (
    q.includes("raise") ||
    q.includes("register") ||
    q.includes("file")
  ) {
    return "Go to Raise Complaint, select the issue category, provide a description, location and image, then submit your complaint.";
  }

  // Report civic issue / pothole
  if (
    q.includes("pothole") ||
    q.includes("civic issue") ||
    q.includes("report")
  ) {
    return "Go to Raise Complaint, select the issue category, provide a description, location and image, then submit your complaint.";
  }

  // Default response
  return "I can help you with raising complaints, tracking complaint status, understanding complaint statuses, and contacting the concerned authority.";
};

export default function CivicAI() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");

  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Hi! How can I help you?",
    },
  ]);

  const sendMessage = (text = message) => {
    const trimmedMessage = text.trim();

    if (!trimmedMessage) return;

    const userMessage = {
      sender: "user",
      text: trimmedMessage,
    };

    const botMessage = {
      sender: "bot",
      text: getBotResponse(trimmedMessage),
    };

    setMessages((prev) => [
      ...prev,
      userMessage,
      botMessage,
    ]);

    setMessage("");
  };

  const handleSuggestion = (question) => {
    sendMessage(question);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-4 z-50 flex h-[520px] w-[380px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">
          
          {/* Header */}
          <div className="flex items-center justify-between bg-blue-800 px-4 py-4 text-white">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
                <FiCpu size={21} />
              </div>

              <div>
                <h3 className="font-semibold">
                  Civic Assistant
                </h3>
                <p className="text-xs text-blue-100">
                  How can I help you?
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="rounded-full p-2 transition hover:bg-white/20"
              aria-label="Close Civic Assistant"
            >
              <FiX size={21} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 space-y-3 overflow-y-auto bg-gray-50 p-4">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${
                  msg.sender === "user"
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    msg.sender === "user"
                      ? "rounded-br-md bg-blue-700 text-white"
                      : "rounded-bl-md border border-gray-200 bg-white text-gray-800"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {/* Suggested Questions */}
            {messages.length === 1 && (
              <div className="pt-2">
                <p className="mb-2 text-xs font-medium text-gray-500">
                  Suggested questions
                </p>

                <div className="space-y-2">
                  {suggestedQuestions.map((question) => (
                    <button
                      key={question}
                      onClick={() => handleSuggestion(question)}
                      className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-left text-sm text-gray-700 transition hover:border-blue-300 hover:bg-blue-50"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t border-gray-200 bg-white p-3">
            <div className="flex items-end gap-2">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message..."
                rows={1}
                className="max-h-24 min-h-[42px] flex-1 resize-none rounded-xl border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />

              <button
                onClick={() => sendMessage()}
                disabled={!message.trim()}
                className="flex h-[42px] w-[42px] items-center justify-center rounded-xl bg-blue-700 text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Send message"
              >
                <FiSend size={18} />
              </button>
            </div>

            <p className="mt-1.5 text-center text-[10px] text-gray-400">
              Civic Assistant
            </p>
          </div>
        </div>
      )}

      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-full bg-blue-800 px-5 py-3.5 text-sm font-semibold text-white shadow-lg transition hover:bg-blue-900 hover:shadow-xl"
          aria-label="Open Civic Assistant"
        >
          <FiMessageCircle size={20} />
          <span>Civic AI</span>
        </button>
      )}
    </>
  );
}
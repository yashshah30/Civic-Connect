import { useState } from "react";
import { FiMessageCircle, FiSend, FiX, FiCpu } from "react-icons/fi";

const suggestedQuestions = [
  "How do I raise a complaint?",
  "Track my complaint",
  "What is the status of my complaint?",
  "Report a civic issue",
];

export default function CivicAI() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "bot",
      text: "Hi! How can I help you?",
    },
  ]);

  const sendMessage = (text = message) => {
    const trimmedMessage = text.trim();

    if (!trimmedMessage) return;

    const userMessage = {
      id: Date.now(),
      sender: "user",
      text: trimmedMessage,
    };

    const botMessage = {
      id: Date.now() + 1,
      sender: "bot",
      text: "I'm here to help. AI assistance will be connected soon.",
    };

    setMessages((previous) => [
      ...previous,
      userMessage,
      botMessage,
    ]);

    setMessage("");
  };

  const handleSuggestion = (question) => {
    setMessage(question);
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-4 z-50 flex h-[520px] w-[calc(100vw-2rem)] max-w-md flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl sm:right-6">
          
          {/* Header */}
          <div className="flex items-center justify-between bg-blue-900 px-5 py-4 text-white">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15">
                <FiCpu className="text-xl" />
              </div>

              <div>
                <h2 className="font-semibold">PRAGATI AI</h2>
                <p className="text-xs text-blue-100">
                  Your Smart Civic Assistant
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-lg p-2 transition hover:bg-white/10"
              aria-label="Close chatbot"
            >
              <FiX className="text-xl" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 space-y-4 overflow-y-auto bg-slate-50 p-4">
            {messages.map((item) => (
              <div
                key={item.id}
                className={`flex ${
                  item.sender === "user"
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm ${
                    item.sender === "user"
                      ? "rounded-br-md bg-blue-900 text-white"
                      : "rounded-bl-md bg-white text-slate-700 shadow-sm"
                  }`}
                >
                  {item.text}
                </div>
              </div>
            ))}

            {/* Suggested Questions */}
            {messages.length === 1 && (
              <div className="pt-2">
                <p className="mb-2 text-xs font-semibold text-slate-500">
                  Suggested questions
                </p>

                <div className="space-y-2">
                  {suggestedQuestions.map((question) => (
                    <button
                      key={question}
                      type="button"
                      onClick={() => handleSuggestion(question)}
                      className="block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-left text-sm text-slate-700 transition hover:border-blue-300 hover:bg-blue-50"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t border-slate-200 bg-white p-3">
            <div className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 focus-within:border-blue-500">
              <input
                type="text"
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message..."
                className="min-w-0 flex-1 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
              />

              <button
                type="button"
                onClick={() => sendMessage()}
                disabled={!message.trim()}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-900 text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Send message"
              >
                <FiSend />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating PRAGATI AI Button */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="fixed bottom-5 right-5 z-50 flex items-center gap-3 rounded-full bg-blue-900 px-5 py-3 text-sm font-semibold text-white shadow-xl transition hover:bg-blue-800 hover:shadow-2xl sm:right-6"
          aria-label="Open PRAGATI AI Assistant"
        >
          <FiMessageCircle className="text-xl" />
          <span>PRAGATI AI</span>
        </button>
      )}
    </>
  );
}
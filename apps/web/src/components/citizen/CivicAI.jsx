import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiSend,
  FiX,
  FiCpu,
  FiArrowRight,
  FiLoader,
  FiExternalLink,
  FiMessageCircle,
  FiBell,
  FiFileText,
  FiCheckCircle,
  FiClock,
  FiAlertCircle,
} from "react-icons/fi";
import { sendCivicAIMessage } from "../../services/aiService";

const formatStatus = (status) => {
  if (!status) return "Unknown";
  return String(status)
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const formatPriority = (priority) => {
  if (!priority) return "Standard";
  return (
    String(priority).charAt(0).toUpperCase() +
    String(priority).slice(1).toLowerCase()
  );
};

const formatCategory = (category) => {
  if (!category) return "Civic Issue";
  return String(category)
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const getStatusBadgeClass = (status) => {
  const s = String(status || "").toLowerCase();
  if (s.includes("resolved")) {
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  }
  if (s.includes("progress") || s.includes("assigned")) {
    return "bg-blue-50 text-blue-700 border-blue-200";
  }
  if (s.includes("review") || s.includes("pending") || s.includes("submitted")) {
    return "bg-amber-50 text-amber-700 border-amber-200";
  }
  if (s.includes("reject") || s.includes("closed")) {
    return "bg-rose-50 text-rose-700 border-rose-200";
  }
  return "bg-slate-100 text-slate-700 border-slate-200";
};

const getPriorityBadgeClass = (priority) => {
  const p = String(priority || "").toLowerCase();
  if (p === "urgent") {
    return "bg-rose-100 text-rose-700 border-rose-200 font-bold";
  }
  if (p === "high") {
    return "bg-orange-100 text-orange-700 border-orange-200 font-semibold";
  }
  if (p === "medium") {
    return "bg-amber-100 text-amber-700 border-amber-200";
  }
  return "bg-emerald-100 text-emerald-700 border-emerald-200";
};

const suggestedQuickQueries = [
  "meri complaint ka kya hua?",
  "meri recent complaints dikhao",
  "complaint report karni hai",
  "In Progress matlab kya?",
  "koi update aaya?",
];

export default function CivicAI() {
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [context, setContext] = useState({});
  const messagesEndRef = useRef(null);

  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "bot",
      text: "Namaste! I am **PRAGATI AI** (**P**ublic **R**esponse & **G**rievance **A**ssistance for **T**ransparent **I**nteraction), your smart civic assistant for **Civic Connect**.\n\nI can help you:\n• **Track Status**: Ask *'meri complaint ka kya hua?'* or give a complaint ID\n• **Draft Complaints**: Describe an issue (*'road pe gaddha hai'*, *'drainage overflow'*) to create a formal report\n• **Review Workflows**: Ask *'In Progress matlab kya?'* to understand municipal timelines\n• **Notifications**: Check your latest complaint updates\n\n*Note: I am dedicated strictly to Civic Connect municipal services.* How can I assist you today?",
      secondaryActions: [
        { label: "Track My Complaints", query: "meri complaint ka kya hua?" },
        { label: "Recent Complaints", query: "meri recent complaints dikhao" },
        { label: "Report a Complaint", query: "complaint report karni hai" },
        { label: "Check Notifications", query: "mere notifications hain?" },
      ],
    },
  ]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loading, isOpen]);

  const sendMessage = async (text = message) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const userMsg = {
      id: Date.now(),
      sender: "user",
      text: trimmed,
    };

    setMessages((prev) => [...prev, userMsg]);
    setMessage("");
    setLoading(true);

    try {
      const res = await sendCivicAIMessage(trimmed, context);

      const botMsg = {
        id: Date.now() + 1,
        sender: "bot",
        text: res.message,
        intent: res.intent,
        primaryAction: res.primaryAction,
        secondaryActions: res.secondaryActions || [],
        data: res.data || {},
      };

      setMessages((prev) => [...prev, botMsg]);

      if (res.context) {
        setContext((prev) => ({ ...prev, ...res.context }));
      }
    } catch (err) {
      console.error("PRAGATI AI chat error:", err);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: "bot",
          text:
            err.message ||
            "I ran into an issue connecting to the civic service. You can view your complaints or report an issue directly.",
          secondaryActions: [
            { label: "My Complaints", route: "/citizen/complaints" },
            { label: "Report Issue", route: "/citizen/report" },
          ],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleActionClick = (action) => {
    if (!action) return;

    // Query shortcut
    if (action.query) {
      sendMessage(action.query);
      return;
    }

    // Navigation action
    const route = action.payload?.route || action.route;
    if (route) {
      setIsOpen(false);
      if (action.payload?.draft) {
        navigate(route, { state: { draft: action.payload.draft } });
      } else {
        navigate(route);
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const renderFormattedText = (text) => {
    if (!text) return null;
    const lines = text.split("\n");
    return lines.map((line, lineIdx) => {
      const parts = line.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`)/g);
      return (
        <span key={lineIdx} className={lineIdx > 0 ? "block mt-1" : "block"}>
          {parts.map((part, partIdx) => {
            if (part.startsWith("**") && part.endsWith("**")) {
              return (
                <strong key={partIdx} className="font-semibold text-slate-900">
                  {part.slice(2, -2)}
                </strong>
              );
            }
            if (part.startsWith("*") && part.endsWith("*")) {
              return (
                <em key={partIdx} className="text-slate-600 text-xs italic">
                  {part.slice(1, -1)}
                </em>
              );
            }
            if (part.startsWith("`") && part.endsWith("`")) {
              return (
                <code
                  key={partIdx}
                  className="rounded bg-slate-100 px-1 py-0.5 text-xs font-mono text-blue-900"
                >
                  {part.slice(1, -1)}
                </code>
              );
            }
            return part;
          })}
        </span>
      );
    });
  };

  return (
    <>
      {/* Floating PRAGATI AI Trigger Button */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="group fixed bottom-5 right-5 z-50 flex items-center gap-3 rounded-2xl bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 px-4 py-2.5 text-left text-white shadow-xl ring-1 ring-white/10 transition-all hover:scale-105 hover:shadow-2xl sm:bottom-6 sm:right-6"
          aria-label="Open PRAGATI AI Assistant"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white shadow-sm ring-1 ring-blue-400/30">
            <FiCpu className="text-base" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-brand text-xs font-bold tracking-wide text-white">
                PRAGATI AI
              </span>
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <p className="text-[10px] font-medium text-blue-200/90">
              Your Smart Civic Assistant
            </p>
          </div>
        </button>
      )}

      {/* Interactive Chat Window */}
      {isOpen && (
        <div
          className="fixed bottom-20 right-4 z-50 flex h-[600px] w-[calc(100vw-2rem)] max-w-[440px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl sm:bottom-24 sm:right-6 font-sans"
          role="dialog"
          aria-label="PRAGATI AI Assistant"
        >
          {/* Header with Official PRAGATI AI Branding */}
          <div className="border-b border-slate-800 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 px-4 py-3 text-white">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md ring-2 ring-blue-400/30">
                  <FiCpu className="text-xl" />
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="font-brand text-sm font-bold tracking-wide text-white">
                      PRAGATI AI
                    </h2>
                    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/20 px-1.5 py-0.5 text-[9px] font-medium text-emerald-300">
                      <span className="h-1 w-1 animate-pulse rounded-full bg-emerald-400" />
                      Civic Assistant
                    </span>
                  </div>

                  <p className="truncate text-[10px] font-medium text-blue-200/90">
                    Public Response & Grievance Assistance for Transparent Interaction
                  </p>
                  <p className="text-[9.5px] font-semibold tracking-wide text-emerald-400">
                    Your Smart Civic Assistant
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1 text-slate-300 transition hover:bg-white/10 hover:text-white"
                aria-label="Close PRAGATI AI assistant"
              >
                <FiX className="text-lg" />
              </button>
            </div>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 space-y-3.5 overflow-y-auto bg-slate-50/70 p-4">
            {messages.map((item) => (
              <div
                key={item.id}
                className={`flex ${
                  item.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[90%] rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed ${
                    item.sender === "user"
                      ? "rounded-br-sm bg-blue-600 text-white shadow-sm"
                      : "rounded-bl-sm border border-slate-200/90 bg-white text-slate-800 shadow-sm"
                  }`}
                >
                  {item.sender === "user" ? (
                    <span className="whitespace-pre-line">{item.text}</span>
                  ) : (
                    <>
                      {/* Formatted Text Message */}
                      <div>{renderFormattedText(item.text)}</div>

                      {/* 1. Single Complaint Card */}
                      {item.data?.complaint && (
                        <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50/90 p-3 shadow-xs">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <span className="font-mono text-[10px] text-blue-800 font-semibold">
                                {item.data.complaint.id.slice(0, 8)}...
                              </span>
                              <p className="font-semibold text-slate-900 text-xs mt-0.5">
                                {item.data.complaint.title}
                              </p>
                            </div>
                            <span
                              className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${getStatusBadgeClass(
                                item.data.complaint.status
                              )}`}
                            >
                              {formatStatus(item.data.complaint.status)}
                            </span>
                          </div>

                          <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                            <span>
                              {formatCategory(item.data.complaint.category)}
                            </span>
                            <span>•</span>
                            <span
                              className={`rounded px-1.5 py-0.2 border text-[10px] ${getPriorityBadgeClass(
                                item.data.complaint.priority
                              )}`}
                            >
                              {formatPriority(item.data.complaint.priority)}
                            </span>
                            {item.data.complaint.created_at && (
                              <>
                                <span>•</span>
                                <span>
                                  {new Date(
                                    item.data.complaint.created_at
                                  ).toLocaleDateString()}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      )}

                      {/* 2. Multiple Complaints List */}
                      {item.data?.complaints &&
                        item.data.complaints.length > 0 && (
                          <div className="mt-3 space-y-2 border-t border-slate-100 pt-2.5">
                            {item.data.complaints.map((c) => (
                              <div
                                key={c.id}
                                className="rounded-xl border border-slate-200 bg-slate-50/90 p-2.5 transition hover:border-slate-300"
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <p className="line-clamp-1 text-xs font-semibold text-slate-800">
                                    {c.title}
                                  </p>
                                  <span
                                    className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${getStatusBadgeClass(
                                      c.status
                                    )}`}
                                  >
                                    {formatStatus(c.status)}
                                  </span>
                                </div>
                                <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-500">
                                  <span>{formatCategory(c.category)}</span>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleActionClick({
                                        payload: {
                                          route: `/citizen/complaints/${c.id}`,
                                        },
                                      })
                                    }
                                    className="inline-flex items-center gap-1 font-semibold text-blue-700 transition hover:text-blue-800 hover:underline"
                                  >
                                    <span>Details</span>
                                    <FiExternalLink className="text-[10px]" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                      {/* 3. Notifications List */}
                      {item.data?.notifications &&
                        item.data.notifications.length > 0 && (
                          <div className="mt-3 space-y-2 border-t border-slate-100 pt-2.5">
                            {item.data.notifications.map((n) => (
                              <div
                                key={n.id}
                                className="rounded-xl border border-slate-200 bg-slate-50/90 p-2.5 text-xs"
                              >
                                <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                                  <FiBell className="text-blue-600 text-xs" />
                                  <span>{n.title || "Update"}</span>
                                </div>
                                <p className="text-slate-600 text-[11px] mt-0.5">
                                  {n.message}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}

                      {/* 4. Natural-Language Draft Preview Card */}
                      {item.data?.draft && (
                        <div className="mt-3 rounded-xl border border-blue-200 bg-blue-50/70 p-3 text-xs">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-semibold text-blue-900 flex items-center gap-1">
                              <FiFileText className="text-xs" />
                              <span>Prepared Draft</span>
                            </span>
                            <span
                              className={`rounded border px-1.5 py-0.2 text-[10px] ${getPriorityBadgeClass(
                                item.data.draft.priority
                              )}`}
                            >
                              {formatPriority(item.data.draft.priority)}
                            </span>
                          </div>

                          <p className="font-bold text-slate-900 mt-1">
                            {item.data.draft.title}
                          </p>
                          <p className="text-[11px] text-slate-600 mt-1 line-clamp-3">
                            {item.data.draft.description}
                          </p>
                          <div className="mt-2 text-[10px] text-blue-800 font-medium">
                            Category: {formatCategory(item.data.draft.category)}
                          </div>
                        </div>
                      )}

                      {/* 5. Primary Action Button */}
                      {item.primaryAction && (
                        <button
                          type="button"
                          onClick={() => handleActionClick(item.primaryAction)}
                          className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-700"
                        >
                          <span>{item.primaryAction.label}</span>
                          <FiArrowRight className="text-sm" />
                        </button>
                      )}

                      {/* 6. Secondary Quick Action Pills */}
                      {item.secondaryActions &&
                        item.secondaryActions.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1.5 pt-1">
                            {item.secondaryActions.map((sec, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => handleActionClick(sec)}
                                className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-700 transition hover:border-blue-400 hover:bg-blue-50/60"
                              >
                                {sec.label}
                              </button>
                            ))}
                          </div>
                        )}
                    </>
                  )}
                </div>
              </div>
            ))}

            {/* Loading Indicator */}
            {loading && (
              <div className="flex justify-start">
                <div className="flex items-center gap-2 rounded-2xl rounded-bl-sm border border-slate-200 bg-white px-4 py-2.5 text-xs text-slate-500 shadow-sm">
                  <FiLoader className="animate-spin text-sm text-blue-600" />
                  <span>PRAGATI AI is processing...</span>
                </div>
              </div>
            )}

            {/* Quick Suggestion Chips (when only 1 message or idle) */}
            {messages.length === 1 && !loading && (
              <div className="pt-2">
                <p className="mb-2 text-xs font-semibold text-slate-500">
                  Try asking:
                </p>
                <div className="space-y-1.5">
                  {suggestedQuickQueries.map((query) => (
                    <button
                      key={query}
                      type="button"
                      onClick={() => sendMessage(query)}
                      className="block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-left text-xs font-medium text-slate-700 transition hover:border-blue-300 hover:bg-blue-50/70"
                    >
                      {query}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-slate-200 bg-white p-3">
            <div className="flex items-end gap-2">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask in Hindi or English (e.g., 'meri complaint ka kya hua?')..."
                rows={1}
                disabled={loading}
                className="max-h-24 min-h-[42px] flex-1 resize-none rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2.5 text-xs sm:text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500 disabled:bg-slate-100 placeholder:text-slate-400"
              />

              <button
                type="button"
                onClick={() => sendMessage()}
                disabled={!message.trim() || loading}
                className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Send message"
              >
                {loading ? (
                  <FiLoader className="animate-spin text-base" />
                ) : (
                  <FiSend className="text-base" />
                )}
              </button>
            </div>

            <p className="mt-2 text-center text-[10px] text-slate-400 font-medium">
              PRAGATI AI • Controlled Civic Assistant
            </p>
          </div>
        </div>
      )}
    </>
  );
}

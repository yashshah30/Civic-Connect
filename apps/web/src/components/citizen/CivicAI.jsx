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
} from "react-icons/fi";

const API_BASE_URL =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL) ||
  "https://civic-connect-backend-6i78.onrender.com";

const suggestedQuestions = [
  "Track my complaints",
  "How do I raise a complaint?",
  "What does In Progress mean?",
  "How long does resolution take?",
  "What can PRAGATI AI do?",
];

const getAuthToken = () => {
  return (
    localStorage.getItem("access_token") ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("token") ||
    null
  );
};

const formatStatus = (status) => {
  if (!status) return "Unknown";
  return status
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const formatPriority = (priority) => {
  if (!priority) return "Standard";
  return priority.charAt(0).toUpperCase() + priority.slice(1).toLowerCase();
};

const formatCategory = (category) => {
  if (!category) return "Civic Issue";
  return category
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const getStatusBadgeClass = (status) => {
  const s = (status || "").toLowerCase();
  if (s.includes("resolved")) {
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  }
  if (s.includes("progress")) {
    return "bg-blue-50 text-blue-700 border-blue-200";
  }
  if (s.includes("review") || s.includes("pending")) {
    return "bg-amber-50 text-amber-700 border-amber-200";
  }
  if (s.includes("reject") || s.includes("closed")) {
    return "bg-rose-50 text-rose-700 border-rose-200";
  }
  return "bg-slate-100 text-slate-700 border-slate-200";
};

const shouldShowComplaintButton = (text) => {
  const q = (text || "").toLowerCase();
  return (
    q.includes("start complaint") ||
    q.includes("raise complaint") ||
    q.includes("report a civic issue") ||
    q.includes("file a complaint") ||
    q.includes("haven't filed any complaints") ||
    q.includes("don't have any registered complaints")
  );
};

const getBotResponse = async (question) => {
  const q = question.trim().toLowerCase();

  // 1. Complaint Status / Tracking Queries
  if (
    q.includes("track") ||
    q.includes("status") ||
    q.includes("where is my complaint") ||
    q.includes("my complaint") ||
    q.includes("my complaints") ||
    q.includes("check complaint") ||
    q.includes("check status") ||
    q.includes("update on my")
  ) {
    const token = getAuthToken();

    if (!token) {
      return {
        text: "Please log in to your Civic Connect account to check the live status of your complaints.",
        showComplaintButton: false,
      };
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/complaints/my`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401 || response.status === 403) {
        return {
          text: "Your session has expired. Please log in again to view your complaints.",
          showComplaintButton: false,
        };
      }

      const contentType = response.headers.get("content-type") || "";
      if (!response.ok || !contentType.includes("application/json")) {
        return {
          text: "I'm unable to connect to the complaint service right now. Please try again shortly.",
          showComplaintButton: false,
        };
      }

      const data = await response.json();

      if (!data.success) {
        return {
          text:
            data.message ||
            "I couldn't retrieve your complaints at this moment. Please try again.",
          showComplaintButton: false,
        };
      }

      const complaints = data.complaints || [];

      if (complaints.length === 0) {
        return {
          text: "You don't have any registered complaints yet. If you have noticed an infrastructure or civic issue in your neighborhood, you can report it directly.",
          showComplaintButton: true,
          complaints: [],
        };
      }

      if (complaints.length === 1) {
        const c = complaints[0];
        const statusLabel = formatStatus(c.status);
        const catLabel = formatCategory(c.category);
        const priLabel = formatPriority(c.priority);

        return {
          text: `Here is your active complaint:\n\n• **${c.title}**\n  Status: **${statusLabel}**\n  Category: ${catLabel} | Priority: ${priLabel}`,
          showComplaintButton: false,
          complaints: [c],
        };
      }

      // Multiple complaints (show up to 5)
      const recent = complaints.slice(0, 5);
      const listText = recent
        .map((c, i) => {
          const statusLabel = formatStatus(c.status);
          const catLabel = formatCategory(c.category);
          const priLabel = formatPriority(c.priority);
          return `${i + 1}. **${c.title}**\n   Status: **${statusLabel}** | ${catLabel} (${priLabel})`;
        })
        .join("\n\n");

      const extraText =
        complaints.length > 5
          ? `\n\n*(Showing 5 most recent of ${complaints.length} complaints)*`
          : "";

      return {
        text: `Here are your recent complaint updates:\n\n${listText}${extraText}`,
        showComplaintButton: false,
        complaints: recent,
      };
    } catch (err) {
      console.error("PRAGATI AI complaint tracking error:", err);
      return {
        text: "I'm unable to connect to the complaint service right now. Please check your network and try again.",
        showComplaintButton: false,
      };
    }
  }

  // 2. Raising / Filing / Reporting Complaints
  if (
    q.includes("raise") ||
    q.includes("register") ||
    q.includes("file") ||
    q.includes("report") ||
    q.includes("pothole") ||
    q.includes("garbage") ||
    q.includes("street light") ||
    q.includes("streetlight") ||
    q.includes("drainage") ||
    q.includes("leakage") ||
    q.includes("civic issue") ||
    q.includes("new complaint")
  ) {
    return {
      text: "To report a civic issue:\n1. Click **Start Complaint** below.\n2. Write rough notes — PRAGATI AI can formalize and categorize your description automatically.\n3. Pin the location on the map.\n4. Upload photographic evidence.\n5. Review and submit directly to municipal authorities.",
      showComplaintButton: true,
    };
  }

  // 3. Status Explanations
  if (q.includes("in progress") || q.includes("in-progress")) {
    return {
      text: "**In Progress** means your complaint has been verified and assigned to the relevant municipal department (e.g., Road Works, Sanitation, Water Supply). Field workers or contractors are actively working on resolving the issue on-site.",
      showComplaintButton: false,
    };
  }

  if (q.includes("under review") || q.includes("pending")) {
    return {
      text: "**Under Review / Pending** means your complaint has been logged and is awaiting verification by the municipal authority before dispatching teams to the site.",
      showComplaintButton: false,
    };
  }

  if (q.includes("resolved") || q.includes("resolution")) {
    return {
      text: "**Resolved** means the assigned municipal authority has completed the necessary work and uploaded resolution proof. Citizens can verify whether the issue has truly been fixed.",
      showComplaintButton: false,
    };
  }

  if (q.includes("rejected") || q.includes("reject")) {
    return {
      text: "**Rejected** indicates that the complaint could not be processed, typically due to duplicate submissions, insufficient details, or falling outside municipal jurisdiction. The remarks section will contain the specific reason.",
      showComplaintButton: false,
    };
  }

  if (
    q.includes("meaning") ||
    q.includes("statuses") ||
    q.includes("stages")
  ) {
    return {
      text: "Civic Connect tracks complaints across four main stages:\n• **Under Review**: Received and awaiting authority verification.\n• **In Progress**: Assigned to department; work is underway.\n• **Resolved**: Work completed with evidence.\n• **Rejected**: Cannot be processed (reason provided in remarks).",
      showComplaintButton: false,
    };
  }

  // 4. Contact Authority / Department
  if (
    q.includes("contact") ||
    q.includes("authority") ||
    q.includes("officer") ||
    q.includes("department") ||
    q.includes("helpline")
  ) {
    return {
      text: "Complaints are assigned directly to official municipal departments based on category (Roads, Water & Sewerage, Sanitation, Electricity, etc.). You can see assigned department details on your complaint tracking page. For life-threatening emergencies, please reach out directly to emergency services or your municipal helpline.",
      showComplaintButton: false,
    };
  }

  // 5. Timelines & SLA
  if (
    q.includes("timeline") ||
    q.includes("how long") ||
    q.includes("time") ||
    q.includes("delay") ||
    q.includes("sla") ||
    q.includes("escalat")
  ) {
    return {
      text: "Municipal resolution targets depend on issue severity:\n• **Urgent / High** (e.g., open manholes, active water main burst): 24–48 hours.\n• **Medium** (e.g., potholes, streetlights, garbage overflow): 3–7 business days.\n• **Low** (routine maintenance): 7–14 business days.\n\nIssues exceeding standard timelines are flagged for administrative escalation.",
      showComplaintButton: false,
    };
  }

  // 6. Greetings / PRAGATI AI Identity
  if (
    q === "hi" ||
    q === "hello" ||
    q === "hey" ||
    q === "namaste" ||
    q.startsWith("hi ") ||
    q.startsWith("hello ")
  ) {
    return {
      text: "Hello! I am PRAGATI AI, your civic assistant. I can help you check complaint statuses, guide you through filing a new report, or answer questions about municipal workflows. How can I assist you today?",
      showComplaintButton: false,
    };
  }

  if (
    q.includes("who are you") ||
    q.includes("what can you do") ||
    q.includes("pragati") ||
    q.includes("what is pragati") ||
    q === "help"
  ) {
    return {
      text: "I am **PRAGATI AI: Your Smart Civic Assistant**.\n\nHere is how I can assist you:\n• **Track Complaints**: Ask 'Track my complaints' to view live status updates.\n• **File Complaints**: Step-by-step guidance to report civic problems.\n• **Status Explanations**: Learn what stages like 'In Progress' mean.\n• **Resolution Timelines**: Understand expected municipal response times.",
      showComplaintButton: false,
    };
  }

  // Default Fallback
  return {
    text: "I'm here to assist with your civic questions! You can ask me to track your active complaints, explain complaint statuses, or guide you in submitting a new civic report.",
    showComplaintButton: false,
  };
};

export default function CivicAI() {
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "bot",
      text: "Namaste! I am **PRAGATI AI**, your smart civic assistant. How can I help you today?",
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
      const res = await getBotResponse(trimmed);
      const botMsg = {
        id: Date.now() + 1,
        sender: "bot",
        text: res.text,
        complaints: res.complaints || [],
        showComplaintButton: Boolean(res.showComplaintButton),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error("PRAGATI AI error:", err);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: "bot",
          text: "I ran into a temporary issue processing your request. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
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

  const handleStartComplaint = () => {
    setIsOpen(false);
    navigate("/citizen/report");
  };

  const handleViewComplaint = (complaintId) => {
    setIsOpen(false);
    navigate(`/citizen/complaints/${complaintId}`);
  };

  const handleViewAllComplaints = () => {
    setIsOpen(false);
    navigate("/citizen/complaints");
  };

  const renderFormattedText = (text) => {
    if (!text) return null;
    const lines = text.split("\n");
    return lines.map((line, lineIdx) => {
      const parts = line.split(/(\*\*.*?\*\*|\*.*?\*)/g);
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
                <em key={partIdx} className="text-slate-500 text-xs italic">
                  {part.slice(1, -1)}
                </em>
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
      {/* Chat Window */}
      {isOpen && (
        <div
          className="fixed bottom-20 right-4 z-50 flex h-[540px] w-[calc(100vw-2rem)] max-w-[400px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl sm:bottom-24 sm:right-6"
          role="dialog"
          aria-label="PRAGATI AI Civic Assistant"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900 px-4 py-3.5 text-white">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-blue-400/30 bg-blue-600/30 text-blue-400">
                <FiCpu className="text-lg" />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-brand text-sm font-bold tracking-wide text-white">
                    PRAGATI AI
                  </h2>
                  <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/15 px-1.5 py-0.5 text-[9px] font-medium text-emerald-400">
                    <span className="h-1 w-1 animate-pulse rounded-full bg-emerald-400" />
                    Active
                  </span>
                </div>
                <p className="text-[11px] text-blue-200/80">
                  Your Smart Civic Assistant
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-lg p-1.5 text-slate-300 transition hover:bg-white/10 hover:text-white"
              aria-label="Close PRAGATI AI assistant"
            >
              <FiX className="text-lg" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50/70 p-4">
            {messages.map((item) => (
              <div
                key={item.id}
                className={`flex ${
                  item.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[88%] rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed ${
                    item.sender === "user"
                      ? "rounded-br-sm bg-blue-600 text-white shadow-sm"
                      : "rounded-bl-sm border border-slate-200/90 bg-white text-slate-800 shadow-sm"
                  }`}
                >
                  {item.sender === "user" ? (
                    <span className="whitespace-pre-line">{item.text}</span>
                  ) : (
                    <>
                      <div>{renderFormattedText(item.text)}</div>

                      {/* Structured Complaint Cards */}
                      {item.complaints && item.complaints.length > 0 && (
                        <div className="mt-3 space-y-2 border-t border-slate-100 pt-2.5">
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                            Complaints
                          </p>
                          {item.complaints.map((c) => (
                            <div
                              key={c.id}
                              className="rounded-xl border border-slate-200 bg-slate-50/90 p-2.5 transition hover:border-slate-300"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <p className="line-clamp-1 text-xs font-semibold text-slate-800">
                                  {c.title}
                                </p>
                                <span
                                  className={`inline-block shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium ${getStatusBadgeClass(
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
                                  onClick={() => handleViewComplaint(c.id)}
                                  className="inline-flex items-center gap-1 font-semibold text-blue-700 transition hover:text-blue-800 hover:underline"
                                >
                                  <span>View Details</span>
                                  <FiExternalLink className="text-[10px]" />
                                </button>
                              </div>
                            </div>
                          ))}

                          {item.complaints.length > 1 && (
                            <button
                              type="button"
                              onClick={handleViewAllComplaints}
                              className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50"
                            >
                              <span>Go to My Complaints</span>
                              <FiArrowRight className="text-[11px]" />
                            </button>
                          )}
                        </div>
                      )}

                      {/* Start Complaint Action Button */}
                      {(item.showComplaintButton ||
                        shouldShowComplaintButton(item.text)) && (
                        <button
                          type="button"
                          onClick={handleStartComplaint}
                          className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-700"
                        >
                          <span>Start Complaint</span>
                          <FiArrowRight className="text-sm" />
                        </button>
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
                  <span>Checking your complaints...</span>
                </div>
              </div>
            )}

            {/* Suggested Questions */}
            {messages.length === 1 && !loading && (
              <div className="pt-2">
                <p className="mb-2 text-xs font-semibold text-slate-500">
                  Suggested questions
                </p>

                <div className="space-y-1.5">
                  {suggestedQuestions.map((question) => (
                    <button
                      key={question}
                      type="button"
                      onClick={() => handleSuggestion(question)}
                      className="block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-left text-xs font-medium text-slate-700 transition hover:border-blue-300 hover:bg-blue-50/70"
                    >
                      {question}
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
                placeholder="Ask PRAGATI AI anything..."
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
              PRAGATI AI • Your Smart Civic Assistant
            </p>
          </div>
        </div>
      )}

      {/* Floating PRAGATI AI Button */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="group fixed bottom-5 right-5 z-50 flex items-center gap-2.5 rounded-full bg-slate-900 px-4 py-3 text-sm font-medium text-white shadow-xl ring-1 ring-white/10 transition-all hover:scale-105 hover:bg-slate-800 hover:shadow-2xl sm:bottom-6 sm:right-6"
          aria-label="Open PRAGATI AI Assistant"
        >
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500/20 text-blue-400">
            <FiCpu className="text-sm" />
          </div>
          <span className="font-brand font-semibold tracking-wide text-white">
            PRAGATI AI
          </span>
          <span className="flex h-2 w-2 rounded-full bg-emerald-400" />
        </button>
      )}
    </>
  );
}

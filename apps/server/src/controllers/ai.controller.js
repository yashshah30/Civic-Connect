import {
  generateDraftComplaint,
  detectCivicIntent,
  ALLOWED_INTENTS,
} from "../services/ai.service.js";
import { createClient } from "@supabase/supabase-js";
import { supabase } from "../config/supabase.js";

const getSupabase = (req) =>
  createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY,
    {
      global: {
        headers: {
          Authorization: `Bearer ${req.user.accessToken}`,
        },
      },
    }
  );

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

const ALLOWED_PAGE_ROUTES = {
  complaints: "/citizen/complaints",
  "my complaints": "/citizen/complaints",
  report: "/citizen/report",
  profile: "/citizen/profile",
  notifications: "/citizen/notifications",
  dashboard: "/citizen/dashboard",
  track: "/citizen/track",
};

export const draftComplaint = async (req, res) => {
  try {
    const { input } = req.body || {};

    if (input === undefined || input === null) {
      return res.status(400).json({
        success: false,
        message: "Input is required",
      });
    }

    if (typeof input !== "string") {
      return res.status(400).json({
        success: false,
        message: "Input must be a text string",
      });
    }

    const trimmedInput = input.trim();

    if (!trimmedInput) {
      return res.status(400).json({
        success: false,
        message: "Input cannot be empty",
      });
    }

    if (trimmedInput.length < 5) {
      return res.status(400).json({
        success: false,
        message:
          "Input is too short. Please provide at least 5 characters describing the issue.",
      });
    }

    if (trimmedInput.length > 2000) {
      return res.status(400).json({
        success: false,
        message: "Input exceeds maximum allowed length of 2000 characters",
      });
    }

    const draft = await generateDraftComplaint(trimmedInput);

    return res.json({
      success: true,
      message: "Complaint draft generated successfully",
      title: draft.title,
      description: draft.description,
      category: draft.category,
      priority: draft.priority,
      draft,
    });
  } catch (error) {
    console.error("AI draft complaint error:", error?.message || error);

    if (error.code === "MISSING_API_KEY") {
      return res.status(503).json({
        success: false,
        message:
          "AI service is currently unavailable. Gemini API key is not configured on the server.",
      });
    }

    if (error.code === "TIMEOUT") {
      return res.status(504).json({
        success: false,
        message: "AI service request timed out. Please try again.",
      });
    }

    const errorMessage = String(error?.message || "");
    const status = error?.status || error?.statusCode;

    if (
      status === 429 ||
      errorMessage.includes("quota") ||
      errorMessage.includes("RESOURCE_EXHAUSTED")
    ) {
      return res.status(429).json({
        success: false,
        message:
          "AI service rate limit exceeded. Please wait a moment and try again.",
      });
    }

    if (
      status === 400 &&
      (errorMessage.includes("API_KEY_INVALID") ||
        errorMessage.includes("invalid api key") ||
        errorMessage.includes("API key not valid"))
    ) {
      return res.status(500).json({
        success: false,
        message:
          "AI service configuration error. Please contact the administrator.",
      });
    }

    if (
      errorMessage.includes("Failed to parse") ||
      errorMessage.includes("invalid response") ||
      errorMessage.includes("missing valid")
    ) {
      return res.status(502).json({
        success: false,
        message:
          "AI service returned an unexpected response structure. Please try again.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "An error occurred while generating the complaint draft.",
    });
  }
};

/**
 * Controlled Conversational Action Handler for PRAGATI AI.
 * Understands natural conversational user requests, detects intent,
 * executes only authorized queries on behalf of the citizen, and returns structured actions.
 */
export const handleConversationalAction = async (req, res) => {
  try {
    const { message, context = {} } = req.body || {};

    if (!message || typeof message !== "string" || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "Message text is required.",
      });
    }

    const trimmedMessage = message.trim();
    const authenticatedSupabase = getSupabase(req);

    // 1. Detect Intent using hybrid fast/model engine
    const detected = await detectCivicIntent(trimmedMessage, context);
    const intent = ALLOWED_INTENTS.includes(detected.intent)
      ? detected.intent
      : "GENERAL_CIVIC_GUIDANCE";

    let responseMessage = "";
    let primaryAction = null;
    let secondaryActions = [];
    let responseData = {};
    let updatedContext = { ...context };

    // 2. Fetch official department dictionary (for resolving department names)
    let departmentsMap = new Map();
    try {
      const { data: deptData } = await authenticatedSupabase
        .from("departments")
        .select("id, name");
      if (deptData && deptData.length > 0) {
        deptData.forEach((d) => departmentsMap.set(d.id, d.name));
      } else {
        const { data: fallbackDept } = await supabase
          .from("departments")
          .select("id, name");
        (fallbackDept || []).forEach((d) => departmentsMap.set(d.id, d.name));
      }
    } catch {
      // Non-critical: gracefully proceed with unassigned fallback
    }

    // 3. Controlled Action Switch
    switch (intent) {
      case "TRACK_COMPLAINT": {
        const { data: complaints, error } = await authenticatedSupabase
          .from("complaints")
          .select(
            "id, title, category, priority, status, department_id, address, created_at, updated_at"
          )
          .eq("user_id", req.user.id)
          .order("created_at", { ascending: false });

        if (error) throw error;

        const allComplaints = complaints || [];

        if (allComplaints.length === 0) {
          responseMessage =
            "You don't have any registered complaints in Civic Connect yet. If you have an issue in your area (like potholes, streetlights, or drainage), you can report it directly.";
          primaryAction = {
            type: "START_COMPLAINT",
            label: "Report a Complaint",
            payload: { route: "/citizen/report" },
          };
          secondaryActions = [
            {
              type: "OPEN_PAGE",
              label: "Go to Dashboard",
              payload: { route: "/citizen/dashboard" },
            },
          ];
          break;
        }

        // If targetCategory is specified
        if (detected.targetCategory) {
          const categoryMatches = allComplaints.filter((c) =>
            String(c.category || "")
              .toLowerCase()
              .includes(detected.targetCategory.toLowerCase())
          );

          if (categoryMatches.length === 0) {
            responseMessage = `I couldn't find any complaints under the **${formatCategory(
              detected.targetCategory
            )}** category in your account. You have ${
              allComplaints.length
            } total complaint${allComplaints.length > 1 ? "s" : ""} on record.`;
            primaryAction = {
              type: "OPEN_PAGE",
              label: "View All Complaints",
              payload: { route: "/citizen/complaints" },
            };
            secondaryActions = [
              {
                type: "START_COMPLAINT",
                label: `Report ${formatCategory(
                  detected.targetCategory
                )} Issue`,
                payload: { route: "/citizen/report" },
              },
            ];
            break;
          }

          if (categoryMatches.length === 1) {
            const single = categoryMatches[0];
            const deptName =
              departmentsMap.get(single.department_id) || "Assigned Department";
            responseMessage = `Here is your ${formatCategory(
              detected.targetCategory
            )} complaint:\n\n• **${single.title}**\n• Status: **${formatStatus(
              single.status
            )}**\n• Priority: ${formatPriority(
              single.priority
            )}\n• Department: ${deptName}`;

            primaryAction = {
              type: "VIEW_COMPLAINT",
              label: "View Complaint Details",
              payload: {
                complaintId: single.id,
                route: `/citizen/complaints/${single.id}`,
              },
            };
            secondaryActions = [
              {
                type: "OPEN_PAGE",
                label: "All Complaints",
                payload: { route: "/citizen/complaints" },
              },
            ];
            responseData = { complaint: single };
            updatedContext.lastComplaintId = single.id;
            updatedContext.lastCategory = single.category;
            break;
          }

          // Multiple category matches
          responseMessage = `I found **${
            categoryMatches.length
          }** complaints under **${formatCategory(
            detected.targetCategory
          )}**. Which one would you like to inspect?`;
          responseData = { complaints: categoryMatches.slice(0, 5) };
          primaryAction = {
            type: "OPEN_PAGE",
            label: "Open My Complaints",
            payload: { route: "/citizen/complaints" },
          };
          break;
        }

        // Default: pick the most relevant active/unresolved complaint, or latest
        const activeComplaint =
          allComplaints.find((c) => {
            const s = String(c.status || "").toLowerCase();
            return s !== "resolved" && s !== "rejected";
          }) || allComplaints[0];

        const deptName =
          departmentsMap.get(activeComplaint.department_id) ||
          "Municipal Department";

        responseMessage = `Your latest complaint **"${
          activeComplaint.title
        }"** is currently **${formatStatus(
          activeComplaint.status
        )}**.\n\n• **ID**: \`${activeComplaint.id.slice(0, 8)}...\`\n• **Status**: ${formatStatus(
          activeComplaint.status
        )}\n• **Priority**: ${formatPriority(
          activeComplaint.priority
        )}\n• **Department**: ${deptName}\n• **Filed**: ${new Date(
          activeComplaint.created_at
        ).toLocaleDateString()}`;

        primaryAction = {
          type: "VIEW_COMPLAINT",
          label: "View Details",
          payload: {
            complaintId: activeComplaint.id,
            route: `/citizen/complaints/${activeComplaint.id}`,
          },
        };

        secondaryActions = [
          {
            type: "OPEN_PAGE",
            label: "Track Status",
            payload: { route: "/citizen/track" },
          },
          {
            type: "OPEN_PAGE",
            label: "My Complaints",
            payload: { route: "/citizen/complaints" },
          },
        ];

        responseData = { complaint: activeComplaint };
        updatedContext.lastComplaintId = activeComplaint.id;
        updatedContext.lastCategory = activeComplaint.category;
        break;
      }

      case "LIST_COMPLAINTS": {
        const { data: complaints, error } = await authenticatedSupabase
          .from("complaints")
          .select(
            "id, title, category, priority, status, department_id, address, created_at"
          )
          .eq("user_id", req.user.id)
          .order("created_at", { ascending: false })
          .limit(5);

        if (error) throw error;

        const allComplaints = complaints || [];

        if (allComplaints.length === 0) {
          responseMessage =
            "You don't have any registered complaints yet. Would you like to file a new civic report?";
          primaryAction = {
            type: "START_COMPLAINT",
            label: "Start Complaint",
            payload: { route: "/citizen/report" },
          };
          break;
        }

        const enriched = allComplaints.map((c) => ({
          ...c,
          department_name:
            departmentsMap.get(c.department_id) || "Municipal Services",
        }));

        responseMessage = `Here are your **${enriched.length}** most recent complaints:`;
        responseData = { complaints: enriched };
        primaryAction = {
          type: "OPEN_PAGE",
          label: "Go to My Complaints",
          payload: { route: "/citizen/complaints" },
        };
        secondaryActions = [
          {
            type: "START_COMPLAINT",
            label: "Report New Issue",
            payload: { route: "/citizen/report" },
          },
        ];

        if (enriched[0]) {
          updatedContext.lastComplaintId = enriched[0].id;
          updatedContext.lastCategory = enriched[0].category;
        }
        break;
      }

      case "VIEW_COMPLAINT": {
        const targetId =
          detected.targetComplaintId || context.lastComplaintId;

        if (!targetId) {
          responseMessage =
            "Which complaint would you like to view? You can provide a complaint ID or ask 'meri complaints dikhao'.";
          primaryAction = {
            type: "OPEN_PAGE",
            label: "My Complaints",
            payload: { route: "/citizen/complaints" },
          };
          break;
        }

        const { data: complaints, error } = await authenticatedSupabase
          .from("complaints")
          .select(
            "id, title, category, priority, status, department_id, address, created_at, updated_at"
          )
          .eq("user_id", req.user.id);

        if (error) throw error;

        const found = (complaints || []).find((c) => {
          const matchQuery = targetId.trim().toLowerCase();
          return (
            c.id.toLowerCase() === matchQuery ||
            c.id.toLowerCase().startsWith(matchQuery) ||
            c.id.slice(0, 8).toLowerCase() === matchQuery
          );
        });

        // Critical Security: If complaint doesn't belong to citizen, do NOT disclose its existence
        if (!found) {
          responseMessage =
            "I couldn't find that complaint in your records. Please check the complaint ID or choose from your complaints list.";
          primaryAction = {
            type: "OPEN_PAGE",
            label: "Open My Complaints",
            payload: { route: "/citizen/complaints" },
          };
          break;
        }

        const deptName =
          departmentsMap.get(found.department_id) || "Municipal Department";

        responseMessage = `Here are the details for complaint **"${
          found.title
        }"**:\n\n• **ID**: \`${found.id}\`\n• **Status**: **${formatStatus(
          found.status
        )}**\n• **Priority**: ${formatPriority(
          found.priority
        )}\n• **Category**: ${formatCategory(
          found.category
        )}\n• **Department**: ${deptName}\n• **Filed**: ${new Date(
          found.created_at
        ).toLocaleDateString()}`;

        primaryAction = {
          type: "VIEW_COMPLAINT",
          label: "View Full Details",
          payload: {
            complaintId: found.id,
            route: `/citizen/complaints/${found.id}`,
          },
        };

        secondaryActions = [
          {
            type: "OPEN_PAGE",
            label: "Track Timeline",
            payload: { route: `/citizen/complaints/${found.id}` },
          },
          {
            type: "OPEN_PAGE",
            label: "All Complaints",
            payload: { route: "/citizen/complaints" },
          },
        ];

        responseData = { complaint: found };
        updatedContext.lastComplaintId = found.id;
        updatedContext.lastCategory = found.category;
        break;
      }

      case "START_COMPLAINT": {
        // Natural language issue description handoff
        const issueDesc =
          detected.issueDescription &&
          detected.issueDescription.trim().length >= 10
            ? detected.issueDescription.trim()
            : null;

        if (issueDesc) {
          let draft = null;
          try {
            draft = await generateDraftComplaint(issueDesc);
          } catch (err) {
            console.warn("Draft complaint generation in chat error:", err?.message);
          }

          if (draft) {
            responseMessage = `I have drafted a formal complaint based on your description:\n\n• **Title**: **${
              draft.title
            }**\n• **Category**: ${formatCategory(
              draft.category
            )}\n• **Suggested Priority**: ${formatPriority(
              draft.priority
            )}\n\nYou can review, confirm your location on the map, and submit on the Report page.`;

            primaryAction = {
              type: "START_COMPLAINT",
              label: "Open Report with this Draft",
              payload: {
                route: "/citizen/report",
                draft,
              },
            };

            secondaryActions = [
              {
                type: "OPEN_PAGE",
                label: "Report Manually",
                payload: { route: "/citizen/report" },
              },
            ];

            responseData = { draft };
            break;
          }
        }

        // Standard start complaint guidance
        responseMessage =
          "To file a civic complaint:\n1. Describe the issue in rough notes or everyday Hindi/English.\n2. Pin the exact location on the interactive map.\n3. Upload photo evidence.\n4. Submit directly to municipal authorities.\n\nClick below to open the reporting page:";

        primaryAction = {
          type: "START_COMPLAINT",
          label: "Start Complaint",
          payload: { route: "/citizen/report" },
        };
        break;
      }

      case "EXPLAIN_STATUS": {
        const st = String(detected.targetStatus || "all").toLowerCase();

        if (st.includes("progress")) {
          responseMessage =
            "**In Progress** means your complaint has been verified and assigned to the relevant municipal department (e.g., Road Works, Sanitation). Field teams or contractors are actively working on resolving the issue on-site.";
        } else if (st.includes("review") || st.includes("pending")) {
          responseMessage =
            "**Under Review / Pending** means your complaint has been received by the municipal system and is undergoing verification by the control room before field crew dispatch.";
        } else if (st.includes("assigned")) {
          responseMessage =
            "**Assigned** means the complaint has been verified and routed to a designated municipal department engineer or contractor for on-site execution.";
        } else if (st.includes("resolved")) {
          responseMessage =
            "**Resolved** means the field team has completed the work and uploaded completion proof. You can inspect the photographic evidence on your complaint tracking page.";
        } else if (st.includes("rejected")) {
          responseMessage =
            "**Rejected** indicates that the complaint could not be processed, typically due to duplicate submissions, insufficient location info, or falling outside municipal purview. Detailed remarks are recorded on the ticket.";
        } else {
          responseMessage =
            "Civic Connect tracks complaints across four main stages:\n• **Under Review**: Received, awaiting authority verification.\n• **In Progress**: Assigned to department; field work underway.\n• **Resolved**: Work completed with evidence.\n• **Rejected**: Cannot be processed (reason in remarks).";
        }

        primaryAction = {
          type: "OPEN_PAGE",
          label: "Track My Complaints",
          payload: { route: "/citizen/complaints" },
        };
        secondaryActions = [
          {
            type: "START_COMPLAINT",
            label: "Report Issue",
            payload: { route: "/citizen/report" },
          },
        ];
        break;
      }

      case "EXPLAIN_PRIORITY": {
        const pr = String(detected.targetPriority || "all").toLowerCase();

        if (pr.includes("urgent")) {
          responseMessage =
            "**Urgent Priority** is reserved for immediate, severe safety or life-threatening hazards (e.g., open electrical wires, massive road cave-ins, open manhole on active roadways). Municipal turnaround: 24–48 hours.";
        } else if (pr.includes("high")) {
          responseMessage =
            "**High Priority** covers major disruptions or safety risks (deep vehicle-damaging potholes, major water pipe bursts, sewer overflow). Municipal turnaround: 48–72 hours.";
        } else if (pr.includes("medium")) {
          responseMessage =
            "**Medium Priority** applies to standard civic disruptions requiring repair (broken streetlights, uncollected garbage heap, non-emergency leaks). Municipal turnaround: 3–7 business days.";
        } else if (pr.includes("low")) {
          responseMessage =
            "**Low Priority** is for minor cosmetic or routine maintenance issues. Municipal turnaround: 7–14 business days.";
        } else {
          responseMessage =
            "Complaints are assigned priority based on safety and public impact:\n• **Urgent** (24–48h): Severe life hazards\n• **High** (48–72h): Major disruptions\n• **Medium** (3–7 days): Standard repairs\n• **Low** (7–14 days): Routine maintenance";
        }

        primaryAction = {
          type: "OPEN_PAGE",
          label: "My Complaints",
          payload: { route: "/citizen/complaints" },
        };
        break;
      }

      case "CHECK_NOTIFICATIONS": {
        const { data: notifications, error } = await authenticatedSupabase
          .from("notifications")
          .select("id, title, message, is_read, created_at, complaint_id")
          .eq("user_id", req.user.id)
          .order("created_at", { ascending: false })
          .limit(5);

        if (error) throw error;

        const notifList = notifications || [];

        if (notifList.length === 0) {
          responseMessage =
            "You have no notifications right now. You'll receive real-time updates whenever your complaints are assigned, updated, or resolved.";
          primaryAction = {
            type: "OPEN_PAGE",
            label: "Go to Dashboard",
            payload: { route: "/citizen/dashboard" },
          };
          break;
        }

        responseMessage = `You have **${notifList.length}** recent notification${
          notifList.length > 1 ? "s" : ""
        }:`;
        responseData = { notifications: notifList };
        primaryAction = {
          type: "OPEN_PAGE",
          label: "Open Notifications",
          payload: { route: "/citizen/notifications" },
        };
        secondaryActions = [
          {
            type: "OPEN_PAGE",
            label: "My Complaints",
            payload: { route: "/citizen/complaints" },
          },
        ];
        break;
      }

      case "OPEN_PAGE": {
        const targetPage = detected.targetPage || "";
        const route =
          ALLOWED_PAGE_ROUTES[targetPage] ||
          Object.values(ALLOWED_PAGE_ROUTES).find((r) => r === targetPage) ||
          "/citizen/dashboard";

        let pageName = "Dashboard";
        if (route.includes("complaints")) pageName = "My Complaints";
        if (route.includes("report")) pageName = "Report Complaint";
        if (route.includes("profile")) pageName = "Profile";
        if (route.includes("notifications")) pageName = "Notifications";
        if (route.includes("track")) pageName = "Track Complaint";

        responseMessage = `Navigating to **${pageName}** for you:`;
        primaryAction = {
          type: "OPEN_PAGE",
          label: `Open ${pageName}`,
          payload: { route },
        };
        break;
      }

      case "OUT_OF_SCOPE": {
        responseMessage =
          "I am **PRAGATI AI** (*Public Response & Grievance Assistance for Transparent Interaction*), the dedicated civic assistant built specifically for **Civic Connect**.\n\nI can only assist you with municipal issues, civic grievance reporting, status tracking, notifications, and city services in your municipality. I cannot assist with general knowledge, coding, mathematics, entertainment, or personal queries.\n\nHow may I help you with your civic grievances today?";

        primaryAction = {
          type: "START_COMPLAINT",
          label: "Report a Civic Issue",
          payload: { route: "/citizen/report" },
        };
        secondaryActions = [
          {
            type: "OPEN_PAGE",
            label: "Track Complaints",
            payload: { route: "/citizen/complaints" },
          },
          {
            type: "OPEN_PAGE",
            label: "City Civic Pulse",
            payload: { route: "/citizen/civic-pulse" },
          },
        ];
        break;
      }

      case "GENERAL_CIVIC_GUIDANCE":
      default: {
        responseMessage =
          "Namaste! I am **PRAGATI AI**, your smart civic assistant for Civic Connect.\n\nI can help you:\n• **Track Status**: Ask *'meri complaint ka kya hua?'* or enter a complaint ID.\n• **Report Issues**: Describe a problem (e.g. *'drainage overflow ho raha hai'*) and I will draft your complaint.\n• **List Complaints**: Ask *'meri complaints dikhao'*.\n• **Notifications**: Inquire about latest updates or alerts.\n• **Municipal Explanations**: Understand statuses like *'In Progress'* and SLA timelines.";

        primaryAction = {
          type: "START_COMPLAINT",
          label: "Start a Complaint",
          payload: { route: "/citizen/report" },
        };
        secondaryActions = [
          {
            type: "OPEN_PAGE",
            label: "Track Complaints",
            payload: { route: "/citizen/complaints" },
          },
          {
            type: "CHECK_NOTIFICATIONS",
            label: "Check Notifications",
            payload: { route: "/citizen/notifications" },
          },
        ];
        break;
      }
    }

    return res.json({
      success: true,
      intent,
      message: responseMessage,
      primaryAction,
      secondaryActions,
      data: responseData,
      context: updatedContext,
    });
  } catch (error) {
    console.error("PRAGATI AI conversational action error:", error);

    return res.status(500).json({
      success: false,
      message: "An error occurred while processing your request with PRAGATI AI.",
      intent: "GENERAL_CIVIC_GUIDANCE",
      primaryAction: {
        type: "START_COMPLAINT",
        label: "Report Issue",
        payload: { route: "/citizen/report" },
      },
    });
  }
};

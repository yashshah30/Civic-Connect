import { useState } from "react";
import { Link } from "react-router-dom";
import Layout from "../../components/layout/layout";
import {
  Sparkles,
  MapPin,
  Camera,
  Clock,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  ChevronDown,
  Building2,
  Bell,
  FileText,
  Activity,
  Check,
  Layers,
  ArrowUpRight,
} from "lucide-react";

// PRAGATI AI Real-World Scenarios for Interactive Showcase
const aiScenarios = [
  {
    id: "pothole",
    tab: "Road Hazard",
    rawInput: "Huge pothole near metro pillar 45, bikes are slipping after rain",
    structured: {
      title: "Severe Road Pothole Hazard near Metro Pillar 45",
      category: "Roads & Infrastructure",
      priority: "High",
      priorityColor: "bg-amber-100 text-amber-800 border-amber-200",
      description:
        "Deep pothole accumulation near Metro Pillar 45 causing hazardous road conditions and slippage risks for two-wheelers, aggravated by rain waterlogging.",
      department: "Road & Infrastructure Department",
      location: "Metro Pillar 45, Outer Ring Corridor",
    },
  },
  {
    id: "water",
    tab: "Water Leakage",
    rawInput: "Clean drinking water supply pipe broke in sector 4, water wasting on road for 2 days",
    structured: {
      title: "Main Drinking Water Pipeline Rupture in Sector 4",
      category: "Water Supply",
      priority: "Urgent",
      priorityColor: "bg-red-100 text-red-800 border-red-200",
      description:
        "Continuous potable water pipeline rupture in Sector 4 resulting in heavy clean water loss and localized street flooding over the past 48 hours.",
      department: "Water Department",
      location: "Sector 4, Main Pipeline Junction",
    },
  },
  {
    id: "sanitation",
    tab: "Sanitation Waste",
    rawInput: "Community dump bins overflowing near park gate, stray animals scattering garbage",
    structured: {
      title: "Overflowing Waste Bins & Sanitation Hazard near Park Gate",
      category: "Sanitation",
      priority: "Medium",
      priorityColor: "bg-blue-100 text-blue-800 border-blue-200",
      description:
        "Public municipal waste bins overflowing near the community park entrance, leading to animal disturbance, foul odor, and public health concerns.",
      department: "Sanitation Department",
      location: "Community Park Gate, Ward 8",
    },
  },
];

const features = [
  {
    icon: Sparkles,
    badge: "AI Powered",
    title: "PRAGATI AI Assistant",
    description:
      "Transform informal citizen notes and voice descriptions into structured, formal civic complaints with auto-suggested titles, categories, and priority ratings.",
  },
  {
    icon: MapPin,
    badge: "Location Intelligence",
    title: "Geolocation & Map Tracking",
    description:
      "Pinpoint exact coordinates using interactive Leaflet maps and GPS capture, ensuring municipal field crews locate issues without ambiguity.",
  },
  {
    icon: Camera,
    badge: "Verification",
    title: "Photographic Evidence",
    description:
      "Attach up to 5 clear on-site photos directly into secure cloud storage to provide indisputable visual context before work begins.",
  },
  {
    icon: Clock,
    badge: "Transparency",
    title: "Milestone Status Timeline",
    description:
      "Follow every progress stage from submission and department assignment to in-progress work and final resolution with verifiable timestamps.",
  },
  {
    icon: Building2,
    badge: "Municipal Control",
    title: "Department Routing",
    description:
      "Enable civic authorities to systematically filter, evaluate priority, and assign complaints to responsible municipal departments.",
  },
  {
    icon: Bell,
    badge: "Real-Time Updates",
    title: "Instant Citizen Notifications",
    description:
      "Receive real-time in-app notifications whenever authority officers inspect, reassign, or update the resolution status of your complaint.",
  },
];

const steps = [
  {
    number: "01",
    title: "Report an Issue",
    text: "Share what is broken in your community. Provide rough notes, take photos, and confirm your location on the map.",
    badge: "Citizen Step",
  },
  {
    number: "02",
    title: "PRAGATI AI Structures It",
    text: "With one click, PRAGATI AI refines the description, generates a formal municipal title, and suggests category and priority.",
    badge: "AI Assistance",
  },
  {
    number: "03",
    title: "Department Routing",
    text: "Municipal authorities review the complaint and dispatch it to the appropriate division for immediate scheduling.",
    badge: "Authority Action",
  },
  {
    number: "04",
    title: "Track & Resolve",
    text: "Monitor real-time status updates and inspection remarks directly from your dashboard until the issue is fully resolved.",
    badge: "Resolution",
  },
];

const faqs = [
  {
    q: "What is Civic Connect?",
    a: "Civic Connect is an AI-powered municipal complaint platform that bridges citizens and civic authorities. It allows residents to easily document civic infrastructure problems and track them through verifiable status milestones.",
  },
  {
    q: "How does PRAGATI AI help with reporting?",
    a: "PRAGATI AI is your smart civic assistant. When you type or dictate a rough, frantic, or colloquial description (e.g., in everyday Hindi or English), PRAGATI AI structures it into an organized, official complaint with an accurate category and priority level. You always review and edit the draft before submitting.",
  },
  {
    q: "Does PRAGATI AI automatically submit complaints?",
    a: "Never. PRAGATI AI is strictly an assistant. It generates an editable draft for your convenience. You have full control to inspect, modify, or discard the AI draft before submitting your complaint.",
  },
  {
    q: "How can I track my complaint after submission?",
    a: "Every complaint receives a tracking record. In the citizen portal or on the Track Complaint page, you can view a live milestone timeline showing whether your issue is Submitted, Under Review, Assigned, In Progress, or Resolved, along with timestamps and official notes.",
  },
  {
    q: "What departments are supported?",
    a: "Complaints are systematically routed to specialized municipal departments including Roads & Infrastructure, Water Department, Sanitation Department, and Drainage Department.",
  },
  {
    q: "Is Civic Connect free for citizens?",
    a: "Yes. Civic Connect is completely free for citizens to report neighborhood issues, upload evidence, and track municipal progress.",
  },
];

export default function Landing() {
  const [activeScenario, setActiveScenario] = useState("pothole");
  const [openFaq, setOpenFaq] = useState(0);

  const scenario =
    aiScenarios.find((item) => item.id === activeScenario) || aiScenarios[0];

  return (
    <Layout>
      {/* HERO SECTION */}
      <section
        id="home"
        className="relative overflow-hidden bg-slate-950 text-white civic-grid-dark"
      >
        {/* Ambient subtle glow gradients */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-40 top-0 h-[500px] w-[500px] rounded-full bg-blue-600/15 blur-[120px]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-20 top-20 h-[550px] w-[550px] rounded-full bg-indigo-500/10 blur-[140px]"
        />

        <div className="relative mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-24 lg:grid lg:grid-cols-12 lg:gap-12 lg:py-28">
          
          {/* Left Column: Headline & Action */}
          <div className="flex flex-col justify-center lg:col-span-7">
            
            {/* PRAGATI AI Product Pill */}
            <div className="mb-6 inline-flex w-fit items-center gap-2.5 rounded-full border border-blue-500/30 bg-blue-950/60 px-4 py-1.5 shadow-inner backdrop-blur-md">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <div className="flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-cyan-300" />
                <span className="font-brand text-xs font-bold tracking-wider text-cyan-200 uppercase">
                  PRAGATI AI
                </span>
              </div>
              <span className="text-slate-500 text-xs">|</span>
              <span className="text-xs font-medium text-slate-300">
                Next-Gen Civic Assistant
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Report. Track.{" "}
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-indigo-200">
                Improve your city.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">
              Civic Connect bridges citizens and municipal authorities through intelligent
              complaint drafting, GPS location mapping, and transparent milestone tracking.
            </p>

            {/* Primary Action Buttons */}
            <div className="mt-8 flex flex-col gap-3.5 sm:flex-row sm:items-center">
              <Link
                to="/signup"
                className="group inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-7 py-3.5 text-base font-semibold text-white shadow-lg shadow-blue-600/30 transition duration-200 hover:bg-blue-500 hover:shadow-blue-500/40 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-slate-950"
              >
                <span>Report an Issue</span>
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </Link>

              <a
                href="#how-it-works"
                className="inline-flex items-center justify-center rounded-xl border border-slate-700 bg-slate-900/80 px-6 py-3.5 text-base font-medium text-slate-200 backdrop-blur-sm transition duration-200 hover:border-slate-600 hover:bg-slate-800 hover:text-white"
              >
                Explore Platform
              </a>
            </div>

            {/* Trust Badges */}
            <div className="mt-10 grid grid-cols-3 gap-4 border-t border-slate-800/80 pt-6 text-xs text-slate-400 sm:text-sm">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-400" />
                <span>Verified Routing</span>
              </div>
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 shrink-0 text-cyan-400" />
                <span>Real-Time Status</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 shrink-0 text-blue-400" />
                <span>PRAGATI AI Assisted</span>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Visual Showcase */}
          <div className="mt-12 lg:col-span-5 lg:mt-0">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              
              {/* Outer Card Glow */}
              <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-5 shadow-2xl shadow-blue-950/50 backdrop-blur-xl">
                
                {/* Header Pill */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600/20 text-blue-400">
                      <Sparkles className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="font-brand text-sm font-bold text-white tracking-wide">
                        PRAGATI AI
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        Smart Civic Assistant
                      </p>
                    </div>
                  </div>

                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-medium text-emerald-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Active
                  </span>
                </div>

                {/* Simulated Citizen Prompt Box */}
                <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950/80 p-3.5">
                  <div className="flex items-center justify-between text-[11px] font-medium text-slate-400">
                    <span className="text-slate-400 uppercase tracking-wider text-[10px]">
                      Citizen Input
                    </span>
                    <span className="text-slate-500">Live draft preview</span>
                  </div>
                  <p className="mt-2 text-xs italic text-slate-200">
                    &ldquo;hamare area mein road par bahut bada pothole hai aur baarish ke baad paani bhar jata hai, bikes ko problem hoti hai&rdquo;
                  </p>
                </div>

                {/* Transformation Badge */}
                <div className="my-3 flex items-center justify-center">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/30 bg-blue-600/10 px-3 py-1 text-[11px] font-semibold text-blue-300">
                    <Sparkles className="h-3 w-3" />
                    PRAGATI AI Generated Structure
                  </span>
                </div>

                {/* Structured Output Preview */}
                <div className="space-y-3 rounded-2xl border border-blue-500/20 bg-gradient-to-b from-blue-950/40 to-slate-950/60 p-4">
                  
                  {/* Title & Priority */}
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="rounded-full bg-amber-500/15 border border-amber-500/30 px-2.5 py-0.5 text-[11px] font-semibold text-amber-300">
                        High Priority
                      </span>
                      <span className="rounded-full bg-blue-500/15 border border-blue-500/30 px-2.5 py-0.5 text-[11px] font-medium text-blue-300">
                        Roads & Infrastructure
                      </span>
                    </div>

                    <h4 className="mt-2.5 text-sm font-bold text-white">
                      Severe Pothole & Waterlogging Hazard on Main Road
                    </h4>
                  </div>

                  {/* Formatted Description */}
                  <p className="text-xs leading-relaxed text-slate-300">
                    Deep crater accumulation causing immediate skid risks for two-wheelers and transit disruption following rainfall.
                  </p>

                  {/* Location & Status Footer */}
                  <div className="border-t border-slate-800/80 pt-3 flex items-center justify-between text-[11px] text-slate-400">
                    <span className="flex items-center gap-1 text-slate-400">
                      <MapPin className="h-3.5 w-3.5 text-blue-400" />
                      Ward 12, Main Ring Road
                    </span>
                    <span className="font-medium text-emerald-400">
                      ✓ Ready for Submission
                    </span>
                  </div>

                </div>

                {/* Bottom interactive action note */}
                <div className="mt-4 flex items-center justify-between rounded-xl bg-slate-950/60 px-3.5 py-2.5 text-xs text-slate-400">
                  <span>Citizen reviews and verifies draft</span>
                  <Link
                    to="/signup"
                    className="font-medium text-blue-400 hover:text-blue-300 inline-flex items-center gap-1"
                  >
                    Try it now <ArrowUpRight className="h-3 w-3" />
                  </Link>
                </div>

              </div>

            </div>
          </div>

        </div>
      </section>

      {/* PRAGATI AI SHOWCASE SECTION */}
      <section id="pragati-ai" className="border-b border-slate-200 bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          
          {/* Header */}
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3.5 py-1 text-xs font-semibold text-blue-800">
              <Sparkles className="h-3.5 w-3.5" />
              <span>INTELLIGENT COMPLAINT ASSISTANT</span>
            </div>

            <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Meet{" "}
              <span className="font-brand tracking-wide text-blue-900">
                PRAGATI AI
              </span>
              . Your Smart Civic Assistant.
            </h2>

            <p className="mt-4 text-base leading-relaxed text-slate-600 sm:text-lg">
              Citizens often struggle to classify municipal categories or describe hazards in
              official terms. PRAGATI AI bridges this gap instantly, converting everyday
              statements into structured municipal data ready for authority action.
            </p>
          </div>

          {/* Interactive Scenario Tabs */}
          <div className="mt-12 flex justify-center">
            <div className="inline-flex rounded-xl bg-slate-100 p-1.5">
              {aiScenarios.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveScenario(item.id)}
                  className={`rounded-lg px-4 py-2 text-xs font-semibold transition sm:text-sm ${
                    activeScenario === item.id
                      ? "bg-white text-blue-900 shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {item.tab}
                </button>
              ))}
            </div>
          </div>

          {/* Scenario Comparison Box */}
          <div className="mt-8 grid gap-6 lg:grid-cols-12 lg:items-center">
            
            {/* Raw Input Card */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 lg:col-span-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Step 1: Raw Citizen Report
                </span>
                <span className="rounded bg-slate-200 px-2 py-0.5 text-[11px] font-medium text-slate-700">
                  Unstructured Input
                </span>
              </div>

              <div className="mt-4 rounded-xl border border-slate-300/80 bg-white p-4 shadow-inner">
                <p className="text-sm font-medium leading-relaxed text-slate-800">
                  &ldquo;{scenario.rawInput}&rdquo;
                </p>
              </div>

              <div className="mt-4 space-y-2 text-xs text-slate-500">
                <p className="flex items-center gap-1.5">
                  <Check className="h-4 w-4 text-emerald-600" />
                  Supports casual phrasing and regional dialects
                </p>
                <p className="flex items-center gap-1.5">
                  <Check className="h-4 w-4 text-emerald-600" />
                  Understands urgency and safety implications
                </p>
              </div>
            </div>

            {/* Transform Arrow Indicator */}
            <div className="flex justify-center lg:col-span-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-900 text-white shadow-md">
                <Sparkles className="h-5 w-5" />
              </div>
            </div>

            {/* Structured AI Output Card */}
            <div className="rounded-2xl border-2 border-blue-900/20 bg-blue-50/50 p-6 lg:col-span-5 shadow-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-brand font-bold text-xs uppercase tracking-wider text-blue-950">
                    PRAGATI AI
                  </span>
                  <span className="text-xs text-blue-700 font-semibold">
                    Structured Draft
                  </span>
                </div>

                <span
                  className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${scenario.structured.priorityColor}`}
                >
                  {scenario.structured.priority} Priority
                </span>
              </div>

              <div className="mt-4 space-y-3.5 rounded-xl border border-blue-200/80 bg-white p-5 shadow-sm">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Generated Title
                  </p>
                  <p className="mt-1 text-sm font-bold text-slate-900">
                    {scenario.structured.title}
                  </p>
                </div>

                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Formal Description
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-slate-700">
                    {scenario.structured.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 border-t border-slate-100 pt-3">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Category
                    </p>
                    <p className="mt-0.5 text-xs font-semibold text-blue-900">
                      {scenario.structured.category}
                    </p>
                  </div>

                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Assigned Department
                    </p>
                    <p className="mt-0.5 text-xs font-semibold text-slate-800">
                      {scenario.structured.department}
                    </p>
                  </div>
                </div>
              </div>

              <p className="mt-3 text-center text-xs text-slate-500">
                Citizen reviews, edits, and clicks &ldquo;Use This Draft&rdquo; before manual submission.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="border-b border-slate-200 bg-slate-50 py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-3.5 py-1 text-xs font-semibold text-slate-700 shadow-sm">
              <Layers className="h-3.5 w-3.5 text-blue-700" />
              <span>TRANSPARENT LIFECYCLE</span>
            </div>

            <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              From Report to Verified Resolution
            </h2>

            <p className="mt-4 text-base leading-relaxed text-slate-600 sm:text-lg">
              A 4-step accountable process keeping citizens informed and municipal field teams
              efficiently coordinated.
            </p>
          </div>

          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step) => (
              <div
                key={step.number}
                className="group relative rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-blue-300 hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <span className="font-brand text-3xl font-extrabold text-blue-900/20 group-hover:text-blue-900/40 transition">
                    {step.number}
                  </span>
                  <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-semibold text-blue-800">
                    {step.badge}
                  </span>
                </div>

                <h3 className="mt-6 text-lg font-bold text-slate-900">
                  {step.title}
                </h3>

                <p className="mt-2.5 text-sm leading-relaxed text-slate-600">
                  {step.text}
                </p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* FEATURES SECTION */}
      <section id="features" className="border-b border-slate-200 bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3.5 py-1 text-xs font-semibold text-blue-800">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>CORE CAPABILITIES</span>
            </div>

            <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Built for Modern Municipal Governance
            </h2>

            <p className="mt-4 text-base leading-relaxed text-slate-600 sm:text-lg">
              Engineered exclusively with verified functionality: authenticated role routing,
              multimedia evidence handling, and database-backed milestone workflows.
            </p>
          </div>

          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <div
                  key={feature.title}
                  className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm transition duration-200 hover:border-slate-300 hover:shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-900 text-white">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                      {feature.badge}
                    </span>
                  </div>

                  <h3 className="mt-5 text-lg font-bold text-slate-900">
                    {feature.title}
                  </h3>

                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* LIVE COMPLAINT TRACKING SHOWCASE */}
      <section id="tracking-preview" className="border-b border-slate-200 bg-slate-50 py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Transparent, Verifiable Progress Tracking
            </h2>

            <p className="mt-4 text-base leading-relaxed text-slate-600 sm:text-lg">
              Citizens and authorities always look at the same live milestone record.
              No vague answers or lost complaints.
            </p>
          </div>

          {/* Interactive Card Preview */}
          <div className="mt-12 mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
            
            {/* Card Header */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-5">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-blue-800">
                  Complaint Record Preview
                </span>
                <h3 className="mt-1 text-xl font-bold text-slate-900">
                  Drainage Overflow & Waterlogging near Market Road
                </h3>
                <p className="mt-0.5 text-xs text-slate-400">
                  Complaint ID: CC-2026-8941 • Submitted via PRAGATI AI
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800">
                  In Progress
                </span>
                <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
                  High Priority
                </span>
              </div>
            </div>

            {/* Stepper Display */}
            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="border-l-2 border-blue-900 pl-3">
                <p className="text-[11px] font-bold uppercase text-blue-900">
                  1. Submitted
                </p>
                <p className="text-xs font-medium text-slate-700">Oct 26, 09:15 AM</p>
                <p className="text-[11px] text-slate-400">Citizen filed</p>
              </div>

              <div className="border-l-2 border-blue-900 pl-3">
                <p className="text-[11px] font-bold uppercase text-blue-900">
                  2. Reviewed
                </p>
                <p className="text-xs font-medium text-slate-700">Oct 26, 11:30 AM</p>
                <p className="text-[11px] text-slate-400">Verified by Control</p>
              </div>

              <div className="border-l-2 border-blue-900 pl-3">
                <p className="text-[11px] font-bold uppercase text-blue-900">
                  3. Assigned
                </p>
                <p className="text-xs font-medium text-slate-700">Oct 26, 02:00 PM</p>
                <p className="text-[11px] text-slate-400">Drainage Dept.</p>
              </div>

              <div className="border-l-2 border-emerald-500 pl-3 bg-emerald-50/50 py-1 rounded-r">
                <p className="text-[11px] font-bold uppercase text-emerald-800">
                  4. In Progress
                </p>
                <p className="text-xs font-medium text-emerald-950">Oct 27, 10:00 AM</p>
                <p className="text-[11px] text-emerald-700">Crew on site</p>
              </div>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between rounded-xl bg-slate-50 px-4 py-3 text-xs text-slate-600 gap-2">
              <div className="flex items-center gap-1.5">
                <Building2 className="h-4 w-4 text-slate-500" />
                <span>Assigned to: <strong className="text-slate-800">Drainage Department</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-slate-500" />
                <span>Location: <strong className="text-slate-800">Sector 3, Main Market Gate</strong></span>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* FAQ SECTION */}
      <section id="faq" className="border-b border-slate-200 bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-3xl px-5 sm:px-8">
          
          <div className="text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-slate-50 px-3.5 py-1 text-xs font-semibold text-slate-700">
              <FileText className="h-3.5 w-3.5 text-blue-800" />
              <span>FREQUENTLY ASKED QUESTIONS</span>
            </div>

            <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Questions & Answers
            </h2>

            <p className="mt-4 text-base text-slate-600">
              Everything you need to know about Civic Connect and PRAGATI AI.
            </p>
          </div>

          <div className="mt-12 space-y-3.5">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;

              return (
                <div
                  key={faq.q}
                  className="overflow-hidden rounded-xl border border-slate-200 transition duration-150 hover:border-slate-300"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="flex w-full items-center justify-between gap-4 px-6 py-4.5 text-left transition hover:bg-slate-50"
                  >
                    <span className="font-semibold text-slate-900 sm:text-base text-sm">
                      {faq.q}
                    </span>

                    <ChevronDown
                      className={`h-5 w-5 shrink-0 text-slate-400 transition-transform duration-200 ${
                        isOpen ? "rotate-180 text-blue-900" : ""
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="border-t border-slate-100 bg-slate-50/70 px-6 py-4 text-sm leading-relaxed text-slate-600">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* FINAL CTA SECTION */}
      <section className="bg-slate-950 py-20 civic-grid-dark text-white">
        <div className="mx-auto max-w-5xl px-5 sm:px-8 text-center">
          
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 text-xs font-semibold text-cyan-300 mb-6">
            <Sparkles className="h-3.5 w-3.5" />
            <span>START CONTRIBUTING TODAY</span>
          </div>

          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
            Empower your voice.{" "}
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-indigo-200">
              Strengthen your city.
            </span>
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">
            Join thousands of active citizens reporting issues, monitoring municipal accountability,
            and building cleaner, safer neighborhoods with Civic Connect.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3.5 sm:flex-row">
            <Link
              to="/signup"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-8 py-4 font-semibold text-white shadow-lg shadow-blue-600/30 transition hover:bg-blue-500 hover:shadow-blue-500/40"
            >
              <span>Create Citizen Account</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              to="/login"
              className="inline-flex items-center justify-center rounded-xl border border-slate-700 bg-slate-900/80 px-8 py-4 font-semibold text-slate-200 transition hover:bg-slate-800 hover:text-white"
            >
              Sign In to Portal
            </Link>
          </div>

        </div>
      </section>
    </Layout>
  );
}

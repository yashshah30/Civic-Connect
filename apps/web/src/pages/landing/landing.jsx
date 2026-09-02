import { useState } from "react";
import { Link } from "react-router-dom";
import Layout from "../../components/layout/layout";

const faqs = [
  {
    q: "What is Civic Connect?",
    a: "Civic Connect is a digital platform that connects citizens with civic authorities, making it easier to report, track and resolve local issues.",
  },
  {
    q: "What issues can I report?",
    a: "You can report problems such as potholes, broken street lights, water leakage, waste management issues, sanitation problems and other civic concerns.",
  },
  {
    q: "Can I track my complaint?",
    a: "Yes. Citizens can follow their complaint status and see updates as the responsible authority processes the issue.",
  },
  {
    q: "How does Civic Connect help authorities?",
    a: "Authorities can organize complaints, filter them by status, category and priority, assign them to departments and monitor resolution progress.",
  },
];

const features = [
  {
    icon: "📍",
    title: "Easy Reporting",
    text: "Report civic problems with location, description and supporting information.",
  },
  {
    icon: "🔎",
    title: "Track Progress",
    text: "Know exactly where your complaint stands throughout the resolution process.",
  },
  {
    icon: "🏢",
    title: "Smart Management",
    text: "Authorities can organize, prioritize and assign complaints efficiently.",
  },
  {
    icon: "🔔",
    title: "Stay Updated",
    text: "Receive meaningful updates as your complaint moves through each stage.",
  },
];

const steps = [
  {
    number: "01",
    title: "Report an Issue",
    text: "Tell us about the civic problem and provide the necessary details.",
    icon: "📝",
  },
  {
    number: "02",
    title: "Complaint Review",
    text: "The complaint is reviewed and routed to the appropriate department.",
    icon: "🔍",
  },
  {
    number: "03",
    title: "Action Taken",
    text: "The responsible authority works on resolving the reported issue.",
    icon: "🛠️",
  },
  {
    number: "04",
    title: "Problem Resolved",
    text: "Track the final status and see when the issue has been resolved.",
    icon: "✅",
  },
];

export default function Landing() {
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <Layout>
      {/* HERO */}
      <section
        id="home"
        className="relative overflow-hidden bg-gradient-to-br from-blue-950 via-blue-900 to-blue-700 text-white"
      >
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-blue-400/20 blur-3xl" />
        <div className="absolute -bottom-40 -left-20 h-96 w-96 rounded-full bg-cyan-400/10 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-6 py-20 sm:px-8 lg:grid-cols-2 lg:px-8 lg:py-28">
          <div>
            <div className="mb-6 inline-flex items-center rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm backdrop-blur">
              <span className="mr-2 h-2 w-2 rounded-full bg-green-400" />
              Smart civic engagement platform
            </div>

            <h1 className="text-4xl font-extrabold leading-tight sm:text-5xl lg:text-6xl">
              Better Cities
              <span className="block text-cyan-300">
                Start With You.
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-blue-100">
              Report civic issues, track progress and connect with the
              authorities responsible for making your community better.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/signup"
                className="rounded-xl bg-white px-7 py-3.5 text-center font-bold text-blue-900 shadow-lg transition duration-200 hover:-translate-y-1 hover:bg-blue-50"
              >
                Get Started →
              </Link>

              <a
                href="#how-it-works"
                className="rounded-xl border border-white/30 bg-white/10 px-7 py-3.5 text-center font-semibold transition duration-200 hover:bg-white/20"
              >
                Explore Platform
              </a>
            </div>

            <div className="mt-10 flex flex-wrap gap-x-7 gap-y-3 text-sm text-blue-100">
              <span>✓ Simple</span>
              <span>✓ Transparent</span>
              <span>✓ Community-focused</span>
            </div>
          </div>

          {/* Dashboard preview */}
          <div className="relative">
            <div className="rounded-3xl border border-white/20 bg-white/10 p-3 shadow-2xl backdrop-blur sm:p-5">
              <div className="overflow-hidden rounded-2xl bg-white text-slate-900 shadow-xl">
                <div className="flex items-center justify-between border-b px-5 py-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-blue-700">
                      Authority Dashboard
                    </p>
                    <h3 className="mt-1 font-bold">
                      Complaint Overview
                    </h3>
                  </div>

                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100">
                    🏙️
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 p-5">
                  <div className="rounded-xl bg-blue-50 p-3">
                    <p className="text-xs text-slate-500">Total</p>
                    <p className="mt-1 text-xl font-bold text-blue-900">
                      128
                    </p>
                  </div>

                  <div className="rounded-xl bg-yellow-50 p-3">
                    <p className="text-xs text-slate-500">Pending</p>
                    <p className="mt-1 text-xl font-bold text-yellow-700">
                      32
                    </p>
                  </div>

                  <div className="rounded-xl bg-green-50 p-3">
                    <p className="text-xs text-slate-500">Resolved</p>
                    <p className="mt-1 text-xl font-bold text-green-700">
                      96
                    </p>
                  </div>
                </div>

                <div className="space-y-3 px-5 pb-5">
                  {[
                    ["CC-001", "Road pothole", "In Progress"],
                    ["CC-002", "Street light", "Resolved"],
                    ["CC-003", "Water leakage", "Under Review"],
                  ].map(([id, title, status]) => (
                    <div
                      key={id}
                      className="flex items-center justify-between rounded-xl border border-slate-100 p-3 transition hover:bg-slate-50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-sm">
                          📋
                        </div>

                        <div>
                          <p className="text-sm font-semibold">
                            {title}
                          </p>
                          <p className="text-xs text-slate-400">
                            {id}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                          status === "Resolved"
                            ? "bg-green-100 text-green-700"
                            : status === "In Progress"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="absolute -bottom-5 -left-5 hidden rounded-2xl border border-white/20 bg-white px-5 py-4 text-slate-900 shadow-xl sm:block">
              <p className="text-xs text-slate-500">Resolution rate</p>
              <p className="text-xl font-extrabold text-green-600">
                95%
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="about" className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-6 sm:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-bold uppercase tracking-widest text-blue-700">
              Civic Connect
            </p>

            <h2 className="mt-3 text-3xl font-bold text-slate-900 sm:text-4xl">
              One platform. Better civic participation.
            </h2>

            <p className="mt-4 leading-7 text-slate-600">
              Everything citizens and authorities need to communicate,
              coordinate and resolve civic issues.
            </p>
          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-2 hover:border-blue-200 hover:shadow-xl"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-2xl transition group-hover:scale-110">
                  {feature.icon}
                </div>

                <h3 className="mt-5 text-lg font-bold text-slate-900">
                  {feature.title}
                </h3>

                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {feature.text}
                </p>

                <div className="mt-5 text-sm font-semibold text-blue-700">
                  Learn more →
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="bg-slate-50 py-20">
        <div className="mx-auto max-w-7xl px-6 sm:px-8">
          <div className="text-center">
            <p className="text-sm font-bold uppercase tracking-widest text-blue-700">
              How It Works
            </p>

            <h2 className="mt-3 text-3xl font-bold text-slate-900 sm:text-4xl">
              From report to resolution.
            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-slate-600">
              A simple process designed to keep citizens informed at every
              stage.
            </p>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, index) => (
              <div key={step.number} className="relative">
                <div className="h-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-900 text-xl">
                      {step.icon}
                    </div>

                    <span className="text-3xl font-black text-slate-100">
                      {step.number}
                    </span>
                  </div>

                  <h3 className="mt-6 font-bold text-slate-900">
                    {step.title}
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    {step.text}
                  </p>
                </div>

                {index !== steps.length - 1 && (
                  <div className="absolute right-[-15px] top-16 z-10 hidden text-xl text-blue-300 lg:block">
                    →
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* IMPACT */}
      <section id="impact" className="bg-blue-950 py-20 text-white">
        <div className="mx-auto max-w-7xl px-6 sm:px-8">
          <div className="text-center">
            <p className="text-sm font-bold uppercase tracking-widest text-blue-300">
              Platform Impact
            </p>

            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
              Making every report count.
            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-blue-200">
              Demonstration statistics for the current frontend prototype.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {[
              ["1,250+", "Issues Reported"],
              ["850+", "Issues Resolved"],
              ["95%", "Resolution Rate"],
              ["24/7", "Platform Access"],
            ].map(([number, label]) => (
              <div
                key={label}
                className="rounded-2xl border border-white/10 bg-white/10 p-7 text-center transition hover:-translate-y-1 hover:bg-white/15"
              >
                <p className="text-3xl font-extrabold sm:text-4xl">
                  {number}
                </p>
                <p className="mt-2 text-sm text-blue-200">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="bg-white py-20">
        <div className="mx-auto max-w-3xl px-6 sm:px-8">
          <div className="text-center">
            <p className="text-sm font-bold uppercase tracking-widest text-blue-700">
              FAQ
            </p>

            <h2 className="mt-3 text-3xl font-bold text-slate-900 sm:text-4xl">
              Questions, answered.
            </h2>
          </div>

          <div className="mt-10 space-y-3">
            {faqs.map((faq, index) => {
              const open = openFaq === index;

              return (
                <div
                  key={faq.q}
                  className="overflow-hidden rounded-xl border border-slate-200"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(open ? null : index)}
                    className="flex w-full items-center justify-between gap-5 px-5 py-5 text-left transition hover:bg-slate-50"
                  >
                    <span className="font-semibold text-slate-900">
                      {faq.q}
                    </span>

                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-50 text-lg font-medium text-blue-800">
                      {open ? "−" : "+"}
                    </span>
                  </button>

                  {open && (
                    <div className="border-t border-slate-100 bg-slate-50 px-5 py-5 text-sm leading-7 text-slate-600">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="contact" className="bg-slate-50 px-6 py-20">
        <div className="mx-auto max-w-6xl rounded-3xl bg-gradient-to-r from-blue-900 to-blue-700 px-6 py-14 text-center text-white shadow-xl sm:px-12">
          <div className="mx-auto max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-widest text-blue-200">
              Get Started
            </p>

            <h2 className="mt-3 text-3xl font-extrabold sm:text-4xl">
              Your city. Your voice. Your impact.
            </h2>

            <p className="mt-4 leading-7 text-blue-100">
              Join Civic Connect and become part of a smarter, more
              connected community.
            </p>

            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                to="/signup"
                className="rounded-xl bg-white px-7 py-3.5 font-bold text-blue-900 transition hover:bg-blue-50"
              >
                Create Account
              </Link>

              <Link
                to="/login"
                className="rounded-xl border border-white/30 px-7 py-3.5 font-semibold text-white transition hover:bg-white/10"
              >
                Login
              </Link>
            </div>
          </div>
          </div>
      </section>
    </Layout>
  );
  }

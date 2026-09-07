import { useState } from "react";
import {
  FiBell,
  FiCheckCircle,
  FiUser,
  FiInfo,
  FiSave,
} from "react-icons/fi";

const NotificationPreferences = () => {
  const [preferences, setPreferences] = useState({
    statusUpdates: true,
    resolutionUpdates: true,
    assignmentUpdates: true,
    generalNotifications: true,
  });

  const [saved, setSaved] = useState(false);

  const handleToggle = (name) => {
    setPreferences((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));

    setSaved(false);
  };

  const handleSave = () => {
    // Backend/Supabase will be connected later.
    setSaved(true);
  };

  const preferenceItems = [
    {
      name: "statusUpdates",
      title: "Status Updates",
      description:
        "Receive notifications whenever the status of your complaint changes.",
      icon: FiBell,
    },
    {
      name: "resolutionUpdates",
      title: "Resolution Updates",
      description:
        "Get notified when your complaint is resolved or rejected.",
      icon: FiCheckCircle,
    },
    {
      name: "assignmentUpdates",
      title: "Assignment Updates",
      description:
        "Receive notifications when your complaint is assigned to a department.",
      icon: FiUser,
    },
    {
      name: "generalNotifications",
      title: "General Notifications",
      description:
        "Receive important general announcements and civic updates.",
      icon: FiInfo,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <p className="text-sm font-semibold text-blue-900">
            Settings
          </p>

          <h1 className="mt-1 text-3xl font-bold text-slate-900">
            Notification Preferences
          </h1>

          <p className="mt-2 text-slate-500">
            Choose which notifications you want to receive about your
            complaints and Civic Connect updates.
          </p>
        </div>

        {/* Preferences Card */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-5 sm:px-6">
            <h2 className="text-lg font-bold text-slate-900">
              Notification Settings
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Turn notifications on or off according to your preference.
            </p>
          </div>

          <div className="divide-y divide-slate-200">
            {preferenceItems.map((item) => {
              const Icon = item.icon;
              const enabled = preferences[item.name];

              return (
                <div
                  key={item.name}
                  className="flex items-center justify-between gap-4 px-5 py-5 sm:px-6"
                >
                  {/* Information */}
                  <div className="flex min-w-0 items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-900">
                      <Icon size={19} />
                    </div>

                    <div>
                      <h3 className="font-semibold text-slate-900">
                        {item.title}
                      </h3>

                      <p className="mt-1 text-sm leading-6 text-slate-500">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  {/* Toggle */}
                  <button
                    type="button"
                    onClick={() => handleToggle(item.name)}
                    aria-label={`Toggle ${item.title}`}
                    className={`relative h-7 w-12 shrink-0 rounded-full transition ${
                      enabled
                        ? "bg-blue-900"
                        : "bg-slate-300"
                    }`}
                  >
                    <span
                      className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition ${
                        enabled
                          ? "left-6"
                          : "left-1"
                      }`}
                    />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Save Section */}
          <div className="flex flex-col gap-3 border-t border-slate-200 bg-slate-50 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div>
              {saved ? (
                <p className="text-sm font-medium text-green-700">
                  ✓ Preferences saved successfully.
                </p>
              ) : (
                <p className="text-sm text-slate-500">
                  Changes will be applied after saving.
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={handleSave}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-900 px-5 py-3 font-semibold text-white transition hover:bg-blue-800"
            >
              <FiSave />
              Save Preferences
            </button>
          </div>
        </div>

        {/* Information */}
        <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50 p-4">
          <div className="flex items-start gap-3">
            <FiInfo className="mt-0.5 shrink-0 text-blue-900" />

            <p className="text-sm leading-6 text-blue-900">
              Notification preferences control the types of updates you
              receive from Civic Connect. You can change these settings
              anytime.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default NotificationPreferences;
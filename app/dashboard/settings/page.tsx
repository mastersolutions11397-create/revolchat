"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { Settings as SettingsIcon } from "lucide-react";

export default function SettingsPage() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email_notifications: true,
    sms_notifications: false,
    push_notifications: true,
    timezone: "UTC",
  });

  const handleSave = async () => {
    setLoading(true);
    // TODO: Save settings to API
    setTimeout(() => {
      setLoading(false);
      alert("Settings saved!");
    }, 1000);
  };

  const handleSignOut = async () => {
    await signOut();
    router.push("/auth/login");
  };

  return (
    <div className="space-y-8">
      {/* Banner */}
      <div className="rounded-2xl bg-[#0b1220] p-6 text-white">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-500/20 text-sky-400">
            <SettingsIcon className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Settings</h1>
            <p className="text-white/70 text-sm">
              Manage your account preferences and notifications.
            </p>
          </div>
        </div>
      </div>

      {/* General Settings */}
      <div className="rounded-2xl border border-gray-200 bg-white p-8">
        <h2 className="text-xl font-bold text-gray-900 mb-6">General</h2>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Timezone
            </label>
            <select
              value={formData.timezone}
              onChange={(e) =>
                setFormData({ ...formData, timezone: e.target.value })
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            >
              <option value="UTC">UTC</option>
              <option value="America/New_York">Eastern Time</option>
              <option value="America/Chicago">Central Time</option>
              <option value="America/Denver">Mountain Time</option>
              <option value="America/Los_Angeles">Pacific Time</option>
            </select>
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="rounded-2xl border border-gray-200 bg-white p-8">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Notifications</h2>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Email Notifications
              </h3>
              <p className="text-gray-600 text-sm">Receive updates via email</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.email_notifications}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    email_notifications: e.target.checked,
                  })
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-sky-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-600"></div>
            </label>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                SMS Notifications
              </h3>
              <p className="text-gray-600 text-sm">
                Receive critical alerts via SMS
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.sms_notifications}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    sms_notifications: e.target.checked,
                  })
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-sky-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-600"></div>
            </label>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Push Notifications
              </h3>
              <p className="text-gray-600 text-sm">
                Receive notifications in your browser
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.push_notifications}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    push_notifications: e.target.checked,
                  })
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-sky-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Account Actions */}
      <div className="rounded-2xl border border-gray-200 bg-white p-8">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Account</h2>
        <div className="space-y-4">
          <button
            onClick={() => router.push("/profile")}
            className="w-full text-left px-6 py-4 border-2 border-sky-200 text-sky-700 rounded-lg font-semibold hover:bg-sky-50 transition-all"
          >
            Edit Profile
          </button>
          <button
            onClick={handleSignOut}
            className="w-full text-left px-6 py-4 border-2 border-red-200 text-red-700 rounded-lg font-semibold hover:bg-red-50 transition-all"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={loading}
          className="bg-gradient-to-r from-sky-600 to-sky-700 text-white px-8 py-3 rounded-lg font-semibold hover:from-sky-700 hover:to-sky-800 transition-all disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save Settings"}
        </button>
      </div>
    </div>
  );
}

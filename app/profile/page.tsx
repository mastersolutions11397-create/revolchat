"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { profileAPI, UserProfileUpdate } from "@/lib/api/profile";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    company: "",
    phone: "",
    email: "",
  });
  const [notificationPrefs, setNotificationPrefs] = useState({
    email: true,
    sms: false,
    push: true,
  });

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const profileData = await profileAPI.getProfile();
        setFormData({
          first_name: profileData.first_name || "",
          last_name: profileData.last_name || "",
          company: profileData.company || "",
          phone: profileData.phone || "",
          email: user.email || "",
        });
        setNotificationPrefs({
          email: profileData.notification_preferences?.email ?? true,
          sms: profileData.notification_preferences?.sms ?? false,
          push: profileData.notification_preferences?.push ?? true,
        });
      } catch (err) {
        console.error("Error fetching profile:", err);
        // If profile doesn't exist, use user metadata
        setFormData({
          first_name: user.user_metadata?.first_name || "",
          last_name: user.user_metadata?.last_name || "",
          company: user.user_metadata?.company || "",
          phone: user.user_metadata?.phone || "",
          email: user.email || "",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const updateData: UserProfileUpdate = {
        first_name: formData.first_name || undefined,
        last_name: formData.last_name || undefined,
        company: formData.company || undefined,
        phone: formData.phone || undefined,
        notification_preferences: notificationPrefs,
      };

      await profileAPI.updateProfile(updateData);
      alert("Profile updated successfully!");
    } catch (err) {
      console.error("Error updating profile:", err);
      setError(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push("/auth/login");
  };

  const getInitials = () => {
    if (formData.first_name && formData.last_name) {
      return `${formData.first_name[0]}${formData.last_name[0]}`.toUpperCase();
    }
    if (formData.first_name) {
      return formData.first_name[0].toUpperCase();
    }
    return user?.email?.[0]?.toUpperCase() || "U";
  };

  const getUserName = () => {
    if (formData.first_name && formData.last_name) {
      return `${formData.first_name} ${formData.last_name}`;
    }
    if (formData.first_name) {
      return formData.first_name;
    }
    return user?.email?.split("@")[0] || "User";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-white via-sky-50 to-sky-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-white via-sky-50 to-sky-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-sky-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link
                href="/"
                className="text-2xl font-bold yetti-gradient bg-clip-text text-transparent"
              >
                🧊 yetti AI
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/dashboard"
                className="text-gray-700 hover:text-sky-500 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Dashboard
              </Link>
              <Link
                href="/dashboard"
                className="text-gray-700 hover:text-sky-500 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Workspaces
              </Link>
              <button
                onClick={handleSignOut}
                className="text-gray-700 hover:text-sky-500 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Profile Settings
          </h1>
          <p className="text-xl text-gray-600">
            Manage your account and preferences
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Info */}
          <div className="lg:col-span-2 space-y-8">
            {/* Personal Information */}
            <div className="yetti-card rounded-2xl p-8 yetti-shadow">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Personal Information
              </h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label
                      htmlFor="firstName"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      First Name
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      value={formData.first_name}
                      onChange={(e) =>
                        setFormData({ ...formData, first_name: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="lastName"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Last Name
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      value={formData.last_name}
                      onChange={(e) =>
                        setFormData({ ...formData, last_name: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    disabled
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Email cannot be changed
                  </p>
                </div>
                <div>
                  <label
                    htmlFor="company"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Company
                  </label>
                  <input
                    type="text"
                    id="company"
                    value={formData.company}
                    onChange={(e) =>
                      setFormData({ ...formData, company: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
                  />
                </div>
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-linear-to-r from-sky-500 to-sky-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-sky-700 hover:to-sky-700 transition-all disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </form>
            </div>

            {/* Notification Preferences */}
            <div className="yetti-card rounded-2xl p-8 yetti-shadow">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Notification Preferences
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Email Notifications
                    </h3>
                    <p className="text-gray-600">
                      Receive updates about your AI agents and integrations
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notificationPrefs.email}
                      onChange={(e) =>
                        setNotificationPrefs({
                          ...notificationPrefs,
                          email: e.target.checked,
                        })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-sky-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-500"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      SMS Notifications
                    </h3>
                    <p className="text-gray-600">
                      Get critical alerts via text message
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notificationPrefs.sms}
                      onChange={(e) =>
                        setNotificationPrefs({
                          ...notificationPrefs,
                          sms: e.target.checked,
                        })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-sky-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-500"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Push Notifications
                    </h3>
                    <p className="text-gray-600">
                      Receive notifications in your browser
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notificationPrefs.push}
                      onChange={(e) =>
                        setNotificationPrefs({
                          ...notificationPrefs,
                          push: e.target.checked,
                        })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-sky-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-500"></div>
                  </label>
                </div>
                <button
                  onClick={async (e) => {
                    e.preventDefault();
                    setSaving(true);
                    try {
                      await profileAPI.updateProfile({
                        notification_preferences: notificationPrefs,
                      });
                      alert("Notification preferences updated!");
                    } catch (err) {
                      setError(err instanceof Error ? err.message : "Failed to update preferences");
                    } finally {
                      setSaving(false);
                    }
                  }}
                  disabled={saving}
                  className="mt-4 bg-linear-to-r from-sky-500 to-sky-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-sky-700 hover:to-sky-700 transition-all disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Preferences"}
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Profile Picture */}
            <div className="yetti-card rounded-2xl p-8 yetti-shadow text-center">
              <div className="w-24 h-24 bg-linear-to-br from-sky-500 to-sky-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl font-bold">
                  {getInitials()}
                </span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {getUserName()}
              </h3>
              <p className="text-gray-600 mb-4">{formData.email}</p>
              <button className="text-sky-500 hover:text-sky-500 font-medium">
                Change Photo
              </button>
            </div>

            {/* Account Status */}
            <div className="yetti-card rounded-2xl p-8 yetti-shadow">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">
                Account Status
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Plan</span>
                  <span className="font-semibold text-gray-900">Free</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Status</span>
                  <span className="text-green-600 font-semibold">Active</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Member Since</span>
                  <span className="font-semibold text-gray-900">
                    {user?.created_at
                      ? new Date(user.created_at).toLocaleDateString("en-US", {
                          month: "short",
                          year: "numeric",
                        })
                      : "—"}
                  </span>
                </div>
              </div>
              <div className="mt-6">
                <Link
                  href="/plans"
                  className="block w-full bg-linear-to-r from-sky-500 to-sky-500 text-white py-3 px-4 rounded-lg font-semibold hover:from-sky-700 hover:to-sky-700 transition-all text-center"
                >
                  Upgrade Plan
                </Link>
              </div>
            </div>

            {/* Discord Invite */}
            <div className="yetti-card rounded-2xl p-8 yetti-shadow text-center">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Join the Yetti Community
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                Connect with fellow builders, share tips, and get direct support in our Discord server.
              </p>
              <Link
                href="https://discord.gg/hN8r5Tep"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 w-full bg-[#5865F2] text-white py-3 px-4 rounded-lg font-semibold transition-all hover:bg-[#4752C4]"
              >
                <span role="img" aria-label="Discord">
                  💬
                </span>
                Join our Discord
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

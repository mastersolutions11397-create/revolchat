import Link from "next/link";

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-purple-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-purple-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link
                href="/"
                className="text-2xl font-bold yeti-gradient bg-clip-text text-transparent"
              >
                🧊 Yeti AI
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/dashboard"
                className="text-gray-700 hover:text-purple-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Dashboard
              </Link>
              <Link
                href="/workspace"
                className="text-gray-700 hover:text-purple-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Workspaces
              </Link>
              <button className="text-gray-700 hover:text-purple-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Info */}
          <div className="lg:col-span-2 space-y-8">
            {/* Personal Information */}
            <div className="yeti-card rounded-2xl p-8 yeti-shadow">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Personal Information
              </h2>
              <form className="space-y-6">
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
                      defaultValue="John"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
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
                      defaultValue="Doe"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
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
                    defaultValue="john@example.com"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  />
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
                    defaultValue="Acme Corporation"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
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
                    defaultValue="+1 (555) 123-4567"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all"
                >
                  Save Changes
                </button>
              </form>
            </div>

            {/* Security Settings */}
            <div className="yeti-card rounded-2xl p-8 yeti-shadow">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Security
              </h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Change Password
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label
                        htmlFor="currentPassword"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Current Password
                      </label>
                      <input
                        type="password"
                        id="currentPassword"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="newPassword"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        New Password
                      </label>
                      <input
                        type="password"
                        id="newPassword"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="confirmPassword"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        id="confirmPassword"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      />
                    </div>
                    <button className="bg-gray-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-all">
                      Update Password
                    </button>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Two-Factor Authentication
                  </h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-700">
                        Add an extra layer of security to your account
                      </p>
                      <p className="text-sm text-gray-500">
                        Currently disabled
                      </p>
                    </div>
                    <button className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all">
                      Enable 2FA
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Notification Preferences */}
            <div className="yeti-card rounded-2xl p-8 yeti-shadow">
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
                      defaultChecked
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
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
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
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
                      defaultChecked
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Profile Picture */}
            <div className="yeti-card rounded-2xl p-8 yeti-shadow text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl font-bold">JD</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                John Doe
              </h3>
              <p className="text-gray-600 mb-4">john@example.com</p>
              <button className="text-purple-600 hover:text-purple-500 font-medium">
                Change Photo
              </button>
            </div>

            {/* Account Status */}
            <div className="yeti-card rounded-2xl p-8 yeti-shadow">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">
                Account Status
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Plan</span>
                  <span className="font-semibold text-gray-900">Pro</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Status</span>
                  <span className="text-green-600 font-semibold">Active</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Member Since</span>
                  <span className="font-semibold text-gray-900">Jan 2024</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Messages Used</span>
                  <span className="font-semibold text-gray-900">
                    12,543 / 50,000
                  </span>
                </div>
              </div>
              <div className="mt-6">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full"
                    style={{ width: "25%" }}
                  ></div>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  25% of monthly limit used
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="yeti-card rounded-2xl p-8 yeti-shadow">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">
                Quick Actions
              </h3>
              <div className="space-y-3">
                <Link
                  href="/plans"
                  className="block w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all text-center"
                >
                  Upgrade Plan
                </Link>
                <Link
                  href="/dashboard"
                  className="block w-full border-2 border-purple-200 text-purple-700 py-3 px-4 rounded-lg font-semibold hover:bg-purple-50 transition-all text-center"
                >
                  Go to Dashboard
                </Link>
                <button className="block w-full border-2 border-gray-200 text-gray-700 py-3 px-4 rounded-lg font-semibold hover:bg-gray-50 transition-all">
                  Download Data
                </button>
                <button className="block w-full border-2 border-red-200 text-red-700 py-3 px-4 rounded-lg font-semibold hover:bg-red-50 transition-all">
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
